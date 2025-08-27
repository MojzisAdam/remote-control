import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Device } from "@/api/devices/model";
import { fetchDevice } from "@/api/devices/actions";
import { handleApiRequest } from "@/utils/apiHandler";

interface CachedDevice {
	device: Device;
	timestamp: number;
}

interface DeviceContextType {
	currentDevice: Device | null;
	isLoading: boolean;
	notFound: boolean;
	loadDevice: (deviceId: string) => Promise<void>;
	forceLoadDevice: (deviceId: string) => Promise<void>;
	updateDevice: (device: Device) => void;
}

const CACHE_EXPIRATION = 5 * 60 * 1000;

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000;

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [notFound, setNotFound] = useState<boolean>(false);

	const currentDeviceIdRef = useRef<string | null>(null);
	const loadingDeviceIdRef = useRef<string | null>(null);
	const deviceCacheRef = useRef<Record<string, CachedDevice>>({});
	const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const isCacheExpired = (timestamp: number): boolean => {
		return Date.now() - timestamp > CACHE_EXPIRATION;
	};

	const fetchAndCacheDevice = useCallback(async (deviceId: string): Promise<void> => {
		// Prevent multiple simultaneous calls for the same device
		if (loadingDeviceIdRef.current === deviceId) {
			return;
		}

		loadingDeviceIdRef.current = deviceId;
		setIsLoading(true);
		try {
			const result = await handleApiRequest({
				apiCall: () => fetchDevice(deviceId),
				successMessage: "Device fetched successfully",
				statusHandlers: {
					404: () => setNotFound(true),
				},
			});

			if (result.success) {
				const device = result.data.device;
				setCurrentDevice(device);
				deviceCacheRef.current = {
					...deviceCacheRef.current,
					[deviceId]: {
						device,
						timestamp: Date.now(),
					},
				};
				setNotFound(false);
			} else {
				setCurrentDevice(null);
				if (result.statusCode === 404) {
					setNotFound(true);
				}
			}
		} catch (error) {
			console.error("Error loading device:", error);
			setCurrentDevice(null);
		} finally {
			setIsLoading(false);
			loadingDeviceIdRef.current = null;
		}
	}, []);

	const loadDevice = useCallback(
		async (deviceId: string): Promise<void> => {
			if (!deviceId) {
				setCurrentDevice(null);
				setNotFound(true);
				return;
			}

			currentDeviceIdRef.current = deviceId;

			const cachedEntry = deviceCacheRef.current[deviceId];
			if (cachedEntry && !isCacheExpired(cachedEntry.timestamp)) {
				setCurrentDevice(cachedEntry.device);
				setNotFound(false);
				return;
			}

			await fetchAndCacheDevice(deviceId);
		},
		[fetchAndCacheDevice]
	);

	const forceLoadDevice = useCallback(
		async (deviceId: string): Promise<void> => {
			if (!deviceId) {
				setCurrentDevice(null);
				setNotFound(true);
				return;
			}

			currentDeviceIdRef.current = deviceId;

			// setupAutoRefresh(deviceId);

			await fetchAndCacheDevice(deviceId);
		},
		[fetchAndCacheDevice]
	);

	const setupAutoRefresh = (deviceId: string): void => {
		if (refreshIntervalRef.current) {
			clearInterval(refreshIntervalRef.current);
			refreshIntervalRef.current = null;
		}

		refreshIntervalRef.current = setInterval(() => {
			if (currentDeviceIdRef.current === deviceId) {
				fetchAndCacheDevice(deviceId).catch((error) => {
					console.error("Error during auto-refresh:", error);
				});
			}
		}, AUTO_REFRESH_INTERVAL);
	};

	const updateDevice = useCallback((device: Device): void => {
		setCurrentDevice(device);
		deviceCacheRef.current = {
			...deviceCacheRef.current,
			[device.id]: {
				device,
				timestamp: Date.now(),
			},
		};
	}, []);

	useEffect(() => {
		return () => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
		};
	}, []);

	return (
		<DeviceContext.Provider
			value={{
				currentDevice,
				isLoading,
				notFound,
				loadDevice,
				forceLoadDevice,
				updateDevice,
			}}
		>
			{children}
		</DeviceContext.Provider>
	);
};

export const useDeviceContext = () => {
	const context = useContext(DeviceContext);
	if (context === undefined) {
		throw new Error("useDeviceContext must be used within a DeviceProvider");
	}
	return context;
};
