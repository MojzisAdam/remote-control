import { useState, useEffect, useCallback, useRef } from "react";
import { startSession, checkConnection, getDeviceData, updateParameter as updateParameterAction, endSession } from "@/api/remoteControlApi/actions";
import { DeviceData } from "@/api/remoteControlApi/model";
import { handleApiRequest } from "@/utils/apiHandler";

const OFFLINE_THRESHOLD_SEC = 15;
const INITIAL_CHECK_MAX_ITER = 20;
const CHECK_INTERVAL_MS = 1000;
const POLLING_INTERVAL = 5000;

export const useRemoteControlApi = (deviceId: string, onDataReceived?: (data: DeviceData) => void) => {
	const [deviceData, setDeviceData] = useState<DeviceData>({});
	const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "offline">("connecting");
	const [error, setError] = useState<string | null>(null);
	const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<number | null>(null);
	const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false);

	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const initialCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const isMountedRef = useRef<boolean>(true);

	const safeSetConnectionStatus = useCallback((status: "connecting" | "connected" | "disconnected" | "offline") => {
		if (isMountedRef.current) {
			setConnectionStatus(status);
		}
	}, []);

	const safeSetError = useCallback((err: string | null) => {
		if (isMountedRef.current) {
			setError(err);
		}
	}, []);

	const safeSetLastSuccessfulFetch = useCallback((time: number | null) => {
		if (isMountedRef.current) {
			setLastSuccessfulFetch(time);
		}
	}, []);

	const safeSetInitialCheckDone = useCallback((done: boolean) => {
		if (isMountedRef.current) {
			setInitialCheckDone(done);
		}
	}, []);

	const safeSetDeviceData = useCallback((data: DeviceData) => {
		if (isMountedRef.current) {
			setDeviceData(data);
		}
	}, []);

	const doInitialCheck = useCallback(
		async (iteration: number) => {
			if (!isMountedRef.current) return;

			const result = await handleApiRequest({
				apiCall: () => checkConnection(deviceId),
				successMessage: null,
				statusHandlers: {
					404: () => "Device not found",
					500: () => "Server error during connection check",
				},
			});

			if (!isMountedRef.current) return;

			if (result.success) {
				const res = result.data;
				const lastActivity = new Date(res.last_activity).getTime();
				safeSetLastSuccessfulFetch(lastActivity);
				const diffSec = (Date.now() - lastActivity) / 1000;

				if (diffSec <= OFFLINE_THRESHOLD_SEC) {
					safeSetConnectionStatus("connected");
					safeSetInitialCheckDone(true);
				} else {
					if (iteration < INITIAL_CHECK_MAX_ITER && isMountedRef.current) {
						initialCheckTimeoutRef.current = setTimeout(() => {
							doInitialCheck(iteration + 1);
						}, CHECK_INTERVAL_MS);
						return;
					} else {
						if (res.send_data === true || res.send_data === "1") {
							// safeSetError("rp-internet-notcon");
							safeSetConnectionStatus("offline");
						} else {
							// safeSetError("spojeni-vyprselo");
							safeSetConnectionStatus("disconnected");
						}
						safeSetInitialCheckDone(true);
						return;
					}
				}
			} else {
				console.error("Error during initial connection check:", result.status);
				// safeSetError(result.status || "Error during initial connection check");
				// safeSetConnectionStatus("disconnected");
				// safeSetInitialCheckDone(true);
			}
		},
		[deviceId, safeSetConnectionStatus, safeSetInitialCheckDone, safeSetLastSuccessfulFetch]
	);

	const fetchAndUpdate = useCallback(async () => {
		const result = await handleApiRequest({
			apiCall: () => getDeviceData(deviceId),
			successMessage: null,
			statusHandlers: {
				404: () => "Device not found",
				500: () => "Server error during data fetch",
			},
		});
		if (!isMountedRef.current) return;

		if (result.success) {
			const res = result.data;

			if (res.success) {
				safeSetDeviceData(res.data);
				if (onDataReceived) onDataReceived(res.data);
			}

			const status = res.status;
			const lastActivity = new Date(status.last_activity).getTime();
			safeSetLastSuccessfulFetch(lastActivity);
			const diffSec = (Date.now() - lastActivity) / 1000;

			if (diffSec > OFFLINE_THRESHOLD_SEC) {
				if (status.send_data) {
					// safeSetError("rp-internet-notcon");
					safeSetConnectionStatus("offline");
				} else {
					// safeSetError("spojeni-vyprselo");
					safeSetConnectionStatus("disconnected");
				}
				if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
				return;
			}
			if (connectionStatus !== "connected") {
				safeSetConnectionStatus("connected");
			}
		} else {
			console.error("Error during polling:", result.status);
		}
	}, [deviceId, onDataReceived, connectionStatus, safeSetConnectionStatus, safeSetDeviceData, safeSetLastSuccessfulFetch]);

	const startPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}
		fetchAndUpdate();
		pollingIntervalRef.current = setInterval(fetchAndUpdate, POLLING_INTERVAL);
	}, [fetchAndUpdate]);

	// --- Initialization ---
	const initializeConnection = useCallback(async () => {
		if (!isMountedRef.current) return;

		safeSetConnectionStatus("connecting");
		safeSetError(null);
		safeSetInitialCheckDone(false);

		const result = await handleApiRequest({
			apiCall: () => startSession(deviceId),
			successMessage: "Session started successfully",
			statusHandlers: {
				404: () => "Device not found",
				500: () => "Server error during session start",
			},
		});

		if (!isMountedRef.current) return;

		if (result.success) {
			console.log("Session started successfully.");
			await doInitialCheck(0);
		} else {
			console.error("Error in startSession:", result.status);
			// safeSetError(result.status || "Session start error");
			// safeSetConnectionStatus("disconnected");
		}
	}, [deviceId, doInitialCheck, safeSetConnectionStatus, safeSetError, safeSetInitialCheckDone]);

	useEffect(() => {
		if (initialCheckDone && connectionStatus === "connected" && isMountedRef.current) {
			startPolling();
		}
	}, [initialCheckDone, connectionStatus, startPolling]);

	const retryConnection = useCallback(async () => {
		if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
		if (initialCheckTimeoutRef.current) clearTimeout(initialCheckTimeoutRef.current);
		await initializeConnection();
	}, [initializeConnection]);

	const updateDeviceParameter = useCallback(
		async (register: number, value: number) => {
			if (!isMountedRef.current) return;

			const result = await handleApiRequest({
				apiCall: () => updateParameterAction(deviceId, register, value),
				successMessage: `Parameter reg_${register} updated successfully`,
				statusHandlers: {
					404: () => "Device not found",
					400: () => "Invalid parameter values",
					500: () => "Server error during parameter update",
				},
			});

			if (result.success) {
				return true;
			} else {
				console.error("Error updating parameter:", result.status);
				return false;
			}
		},
		[deviceId]
	);

	const endRemoteSession = useCallback(async () => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}

		if (initialCheckTimeoutRef.current) {
			clearTimeout(initialCheckTimeoutRef.current);
			initialCheckTimeoutRef.current = null;
		}

		const result = await handleApiRequest({
			apiCall: () => endSession(deviceId),
			successMessage: "Session ended successfully",
			statusHandlers: {
				404: () => "Device not found",
				500: () => "Server error during session end",
			},
		});

		if (result.success) {
			console.log("Session ended.");
			if (isMountedRef.current) {
				safeSetConnectionStatus("disconnected");
			}
			return true;
		} else {
			console.error("Error ending session:", result.status);
			return false;
		}
	}, [deviceId, safeSetConnectionStatus]);

	useEffect(() => {
		isMountedRef.current = true;
		initializeConnection();

		return () => {
			isMountedRef.current = false;

			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}

			if (initialCheckTimeoutRef.current) {
				clearTimeout(initialCheckTimeoutRef.current);
				initialCheckTimeoutRef.current = null;
			}

			// End session
			// handleApiRequest({
			// 	apiCall: () => endSession(deviceId),
			// 	successMessage: null, // Silent during cleanup
			// }).catch((err) => {
			// 	console.error("Error ending session during cleanup:", err);
			// });
		};
	}, [deviceId, initializeConnection]);

	return {
		deviceData,
		connectionStatus,
		error,
		lastSuccessfulFetch,
		initializeConnection,
		retryConnection,
		updateDeviceParameter,
		endRemoteSession,
	};
};

export default useRemoteControlApi;
