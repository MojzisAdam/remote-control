import { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";
import { useMqtt } from "@/hooks/useMqtt";
import DeviceStates from "./DeviceStates";
import TemperatureDisplay from "./TemperatureDisplay";
import HomeDashboard from "./HomeOverview";
import TemperaturesChartContainer from "@/components/remoteControl/shared/charts/TemperaturesChart";
import MonthlyTemperaturesContainer from "@/components/remoteControl/shared/charts/MonthlyTemperatures";
import ConnectionStatusIndicator from "@/components/remoteControl/shared/ConnectionStatusIndicator";
import DeviceLoader from "@/components/remoteControl/shared/DeviceLoader";
import { LayoutDashboard, Sliders, Boxes, Box, RefreshCw, Loader2 } from "lucide-react";
import DeviceParameters from "./DeviceParameters";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useDevices } from "@/hooks/useDevices";
import { useAuth } from "@/hooks/useAuth";
import { Device } from "@/api/devices/model";

export interface DeviceData {
	[key: string]: number | string | undefined;
	reg_0?: number;
	reg_1?: number;
	reg_2?: number;
	reg_3?: number;
	reg_4?: number;
	reg_5?: number;
	reg_6?: number;
	reg_100?: number;
	reg_101?: number;
	reg_102?: number;
	reg_104?: number;
	reg_105?: number;
	reg_106?: number;
	reg_107?: number;
	reg_108?: number;
	reg_109?: number;
	reg_110?: number;
	reg_111?: number;
	reg_112?: number;
	reg_113?: number;
	reg_114?: number;
	reg_115?: number;
	reg_117?: number;
	reg_120?: number;
	reg_121?: number;
	reg_122?: number;
	reg_124?: number;
	reg_128?: number;
	reg_129?: number;
	reg_130?: number;
	reg_132?: number;
	reg_135?: number;
	reg_136?: number;
	reg_137?: number;
	reg_138?: number;
	reg_206?: number;
	reg_210?: number;
	reg_211?: number;
	reg_265?: number;
	reg_266?: number;
	reg_267?: number;
	reg_268?: number;

	script_version?: string;
	fhi?: number;
}

interface RemoteControlMqttRpiProps {
	device: Device;
	onDataReceived?: (data: DeviceData) => void;
	onVersionUpdate?: (fwVersion: string, scriptVersion: string) => void;
}

const CONNECTION_TIMEOUT = 20000;

const deviceDataReducer = (state: DeviceData, action: { type: string; payload?: DeviceData }) => {
	switch (action.type) {
		case "UPDATE":
			return { ...state, ...action.payload };
		case "RESET":
			return {};
		default:
			return state;
	}
};

const RemoteControlMqttRpi: React.FC<RemoteControlMqttRpiProps> = ({ device, onDataReceived, onVersionUpdate }) => {
	const { t } = useTranslation("remote-control");
	const { updateDeviceVersions } = useDevices();
	const { client, connectionStatus, error, connectClient, disconnectClient, publishMessage, subscribeToTopic, lastMessage } = useMqtt(device.id);

	const { hasPermission } = useAuth();
	const canViewExtendedParams = hasPermission("edit-all-parameters");

	const [deviceData, dispatchDeviceData] = useReducer(deviceDataReducer, {});

	const [containerPageShown, setContainerPageShown] = useState<boolean>(false);
	const [deviceConnectionStatus, setDeviceConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "offline">("connecting");
	const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number | null>(null);

	const isInitialized = useRef<boolean>(false);
	const isSubscribed = useRef<boolean>(false);
	const isExtendedSubscribed = useRef<boolean>(false);
	const hasPublishedInitialMessage = useRef<boolean>(false);

	const lastProcessedMessage = useRef<string>("");
	const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [activePage, setActivePage] = useState<"overview" | "parameters">("overview");

	const connectionStatusRef = useRef(deviceConnectionStatus);

	const [extendedData, setExtendedData] = useState<DeviceData>({});
	const [showExtendedParams, setShowExtendedParams] = useState<boolean>(false);
	const [lastExtendedMessageTimestamp, setLastExtendedMessageTimestamp] = useState<number | null>(null);
	const [extendedReloading, setExtendedReloading] = useState<boolean>(false);
	const [showReloadButton, setShowReloadButton] = useState<boolean>(false);
	const [extendedReloadingStart, setExtendedReloadingStart] = useState<number | null>(null);

	const versionsUpdated = useRef<boolean>(false);

	useEffect(() => {
		versionsUpdated.current = false;
	}, [device.id]);

	useEffect(() => {
		if (deviceData.fw_v && deviceData.reg_130 && !versionsUpdated.current) {
			const updateVersions = async () => {
				versionsUpdated.current = true;

				try {
					if (onVersionUpdate) {
						onVersionUpdate(`${deviceData.reg_130}`, `${deviceData.fw_v}`);
					} else {
						// If onVersionUpdate is not provided, update device versions directly
						await updateDeviceVersions(device.id, `${deviceData.reg_130}`, `${deviceData.fw_v}`);
					}
				} catch (error) {
					console.error("Failed to update device versions:", error);
				}
			};

			if (device && (device.fw_version !== `${deviceData.reg_130}` || device.script_version !== `${deviceData.fw_v}`)) {
				updateVersions();
			}
		}
	}, [device.id, device.fw_version, device.script_version, deviceData.fw_v, deviceData.reg_130, updateDeviceVersions, onVersionUpdate]);

	useEffect(() => {
		connectionStatusRef.current = deviceConnectionStatus;
	}, [deviceConnectionStatus]);

	const startConnectionTimeout = useCallback(() => {
		if (connectionTimeoutRef.current) {
			clearTimeout(connectionTimeoutRef.current);
		}
		connectionTimeoutRef.current = setTimeout(() => {
			if (connectionStatusRef.current !== "connected") {
				setDeviceConnectionStatus("offline");
				console.log("Device connection timeout");
			}
		}, CONNECTION_TIMEOUT);
	}, []);

	const resetConnectionTimeout = useCallback(() => {
		setDeviceConnectionStatus("connected");
		setLastMessageTimestamp(Date.now());
		startConnectionTimeout();
	}, [startConnectionTimeout]);

	useEffect(() => {
		const setup = async () => {
			if (isInitialized.current) return;
			try {
				isInitialized.current = true;
				await connectClient();
				console.log("MQTT client connected");
				startConnectionTimeout();
			} catch (err) {
				console.error("Failed to connect MQTT client:", err);
				isInitialized.current = false;
			}
		};
		setup();
		return () => {
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current);
			}
			disconnectClient();
		};
	}, [connectClient, disconnectClient, startConnectionTimeout]);

	useEffect(() => {
		const setupSubscription = async () => {
			if (connectionStatus !== "connected" || isSubscribed.current) return;
			try {
				const topic = `daitsu/v1/${device.id}/data/remote`;
				await subscribeToTopic(topic);
				isSubscribed.current = true;
				sendInitialMessage();
			} catch (err) {
				console.error("Failed to subscribe to topic:", err);
				isSubscribed.current = false;
			}
		};

		const sendInitialMessage = async () => {
			if (connectionStatus !== "connected" || !isSubscribed.current || hasPublishedInitialMessage.current) return;
			try {
				const sendTopic = `daitsu/v1/${device.id}/cmd/remote_control`;
				await publishMessage(sendTopic, JSON.stringify({ send: 1 }), { qos: 1 });
				hasPublishedInitialMessage.current = true;
			} catch (err) {
				console.error("Failed to publish initial message:", err);
			}
		};

		setupSubscription();
		startConnectionTimeout();
	}, [connectionStatus, subscribeToTopic, publishMessage, device.id]);

	useEffect(() => {
		if (!lastMessage) return;

		const messageId = `${lastMessage.topic}:${lastMessage.message}`;
		if (messageId === lastProcessedMessage.current) return;
		lastProcessedMessage.current = messageId;

		try {
			resetConnectionTimeout();

			const { topic, message } = lastMessage;
			const payload = JSON.parse(message);

			if (topic === `daitsu/v1/${device.id}/data/parameters`) {
				const formattedPayload = formatExtendedPayload(payload);
				setExtendedData((prev) => ({ ...prev, ...formattedPayload }));
				setLastExtendedMessageTimestamp(Date.now());
				if (extendedReloading) {
					setExtendedReloading(false);
					setExtendedReloadingStart(null);
					setShowReloadButton(false);
				}
				return;
			}

			let newData: DeviceData = {};

			if (topic === `daitsu/v1/${device.id}/data/remote`) {
				newData = {
					reg_0: payload.reg_0,
					reg_1: payload.reg_1,
					reg_2: payload.reg_2,
					reg_3: payload.reg_3,
					reg_4: payload.reg_4,
					reg_5: payload.reg_5,
					reg_6: payload.reg_6,
					reg_100: payload.reg_100,
					reg_101: payload.reg_101,
					reg_102: payload.reg_102,
					reg_104: payload.reg_104,
					reg_105: payload.reg_105,
					reg_106: payload.reg_106,
					reg_107: payload.reg_107,
					reg_108: payload.reg_108,
					reg_109: payload.reg_109,
					reg_110: payload.reg_110,
					reg_111: payload.reg_111,
					reg_112: payload.reg_112,
					reg_113: payload.reg_113,
					reg_114: payload.reg_114,
					reg_115: payload.reg_115,
					reg_117: payload.reg_117,
					reg_120: payload.reg_120,
					reg_121: payload.reg_121,
					reg_122: payload.reg_122,
					reg_124: payload.reg_124,
					reg_128: payload.reg_128,
					reg_129: payload.reg_129,
					reg_130: payload.reg_130,
					reg_132: payload.reg_132,
					reg_135: payload.reg_135,
					reg_136: payload.reg_136,
					reg_137: payload.reg_137,
					reg_138: payload.reg_138,
					reg_206: payload.reg_206,
					reg_210: payload.reg_210,
					reg_211: payload.reg_211,
					reg_265: payload.reg_265,
					reg_266: payload.reg_266,
					reg_267: payload.reg_267,
					reg_268: payload.reg_268,

					script_version: payload.script_version,
					fhi: payload.fhi,
				};
			}

			dispatchDeviceData({ type: "UPDATE", payload: newData });

			if (onDataReceived) {
				try {
					onDataReceived(newData);
				} catch (callbackError) {
					console.error("Error in onDataReceived callback:", callbackError);
				}
			}

			if (!containerPageShown) {
				setContainerPageShown(true);
			}
		} catch (err) {
			console.error("Error processing MQTT message:", err);
		}
	}, [lastMessage, deviceData, onDataReceived, resetConnectionTimeout, containerPageShown, extendedReloading]);

	useEffect(() => {
		if (!lastMessageTimestamp) return;
		const intervalId = setInterval(() => {
			if (Date.now() - lastMessageTimestamp > CONNECTION_TIMEOUT) {
				setDeviceConnectionStatus("disconnected");
			}
		}, 5000);
		return () => clearInterval(intervalId);
	}, [lastMessageTimestamp]);

	const retryConnection = useCallback(async () => {
		setExtendedReloadingStart(Date.now());
		try {
			setDeviceConnectionStatus("connecting");
			await disconnectClient();
			await connectClient();
			isSubscribed.current = false;
			isExtendedSubscribed.current = false;
			hasPublishedInitialMessage.current = false;
			setLastMessageTimestamp(null);
			setLastExtendedMessageTimestamp(null);
			setShowReloadButton(false);
			startConnectionTimeout();
		} catch (err) {
			console.error("Failed to retry connection:", err);
			setDeviceConnectionStatus("disconnected");
		}
	}, [connectClient, disconnectClient, startConnectionTimeout]);

	const publishMqtt = useCallback(
		async (register: number, value: number) => {
			const topic = `daitsu/v1/${device.id}/cmd/prmt_change_1`;
			const message = JSON.stringify({
				reg_change: 1,
				reg_name: register,
				reg_value: value,
			});
			try {
				await publishMessage(topic, message, { qos: 1 });
			} catch (error) {
				console.error("Failed to publish MQTT message:", error);
			}
		},
		[device.id, publishMessage]
	);

	const publishMqttExtended = useCallback(
		async (register: number, value: number) => {
			const topic = `daitsu/v1/${device.id}/cmd/prmt_change_2`;
			const message = JSON.stringify({
				reg_change: 1,
				reg_name: register,
				reg_value: value,
			});
			try {
				await publishMessage(topic, message, { qos: 1 });
			} catch (error) {
				console.error("Failed to publish MQTT message:", error);
			}
		},
		[device.id, publishMessage]
	);

	const toggleExtendedParameters = useCallback(() => {
		if (!canViewExtendedParams) return;
		setShowExtendedParams((prev) => !prev);
	}, [canViewExtendedParams]);

	useEffect(() => {
		if (!showExtendedParams || connectionStatus !== "connected" || isExtendedSubscribed.current) {
			return;
		}

		const setupExtendedSubscription = async () => {
			try {
				setExtendedReloading(true);
				const topic = `daitsu/v1/${device.id}/data/parameters`;
				await subscribeToTopic(topic);
				isExtendedSubscribed.current = true;

				const sendTopic = `daitsu/v1/${device.id}/cmd/all_prmts`;
				await publishMessage(sendTopic, JSON.stringify({ send: 1 }), { qos: 1 });
			} catch (err) {
				console.error("Failed to subscribe to extended parameters topic:", err);
				isExtendedSubscribed.current = false;
				setShowExtendedParams(false);
			} finally {
				setExtendedReloading(false);
			}
		};

		setupExtendedSubscription();
	}, [showExtendedParams, connectionStatus, subscribeToTopic, publishMessage, device.id]);

	const refreshExtendedData = useCallback(async () => {
		setExtendedReloading(true);
		setExtendedReloadingStart(Date.now());
		setLastExtendedMessageTimestamp(null);
		setShowReloadButton(false);
		try {
			const sendTopic = `daitsu/v1/${device.id}/cmd/all_prmts`;
			await publishMessage(sendTopic, JSON.stringify({ send: 1 }));
		} catch (err) {
			console.error("Failed to refresh extended parameters:", err);
		}
	}, [device.id, publishMessage]);

	useEffect(() => {
		if ((deviceConnectionStatus === "disconnected" || deviceConnectionStatus === "offline") && isExtendedSubscribed.current) {
			if (client && connectionStatus === "connected") {
				client.unsubscribe(`daitsu/v1/${device.id}/data/parameters`);
			}
			isExtendedSubscribed.current = false;
		}
	}, [deviceConnectionStatus, client, connectionStatus, device.id]);

	useEffect(() => {
		if (deviceConnectionStatus === "connected" && lastExtendedMessageTimestamp) {
			const intervalId = setInterval(() => {
				if (Date.now() - lastExtendedMessageTimestamp > 30000) {
					setShowReloadButton(true);
					setExtendedReloading(true);
				} else {
					setShowReloadButton(false);
				}
			}, 5000);
			return () => clearInterval(intervalId);
		} else {
			setShowReloadButton(false);
		}
	}, [lastExtendedMessageTimestamp, deviceConnectionStatus]);

	useEffect(() => {
		if (extendedReloading && extendedReloadingStart) {
			const interval = setInterval(() => {
				if (Date.now() - extendedReloadingStart >= 30000) {
					setShowReloadButton(true);
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [extendedReloading, extendedReloadingStart]);

	const overviewData = useMemo(() => deviceData, [deviceData]);
	const temperatureData = useMemo(
		() => ({
			reg_2: deviceData.reg_2,
			reg_3: deviceData.reg_3,
			reg_4: deviceData.reg_4,
			reg_104: deviceData.reg_104,
			reg_105: deviceData.reg_105,
			reg_106: deviceData.reg_106,
			reg_107: deviceData.reg_107,
			reg_108: deviceData.reg_108,
			reg_109: deviceData.reg_109,
			reg_110: deviceData.reg_110,
			reg_111: deviceData.reg_111,
			reg_112: deviceData.reg_112,
			reg_113: deviceData.reg_113,
			reg_114: deviceData.reg_114,
			reg_115: deviceData.reg_115,
			reg_120: deviceData.reg_120,
			reg_121: deviceData.reg_121,
			reg_135: deviceData.reg_135,
			reg_136: deviceData.reg_136,
			reg_137: deviceData.reg_137,
		}),
		[deviceData]
	);

	const stateData = useMemo(
		() => ({
			reg_100: deviceData.reg_100,
			reg_101: deviceData.reg_101,
			reg_102: deviceData.reg_102,
			reg_122: deviceData.reg_122,
			reg_124: deviceData.reg_124,
			reg_128: deviceData.reg_128,
			reg_129: deviceData.reg_129,
			reg_132: deviceData.reg_132,
			reg_138: deviceData.reg_138,
			reg_130: deviceData.reg_130,
			script_version: deviceData.script_version,
		}),
		[deviceData]
	);

	const parametersData = useMemo(() => {
		const baseParams = {
			reg_265: deviceData.reg_265,
			reg_266: deviceData.reg_266,
			reg_267: deviceData.reg_267,
			reg_268: deviceData.reg_268,
			reg_0: deviceData.reg_0,
			reg_1: deviceData.reg_1,
			reg_2: deviceData.reg_2,
			reg_3: deviceData.reg_3,
			reg_4: deviceData.reg_4,
			reg_5: deviceData.reg_5,
			reg_6: deviceData.reg_6,

			fhi: canViewExtendedParams ? deviceData.fhi : undefined,
		};

		if (showExtendedParams && canViewExtendedParams) {
			return { ...extendedData };
		}

		return baseParams;
	}, [showExtendedParams, extendedData, deviceData, canViewExtendedParams]);

	return (
		<div className="space-y-4">
			{/* Device connection status */}
			<div className="flex justify-between items-start">
				<ConnectionStatusIndicator
					deviceConnectionStatus={deviceConnectionStatus}
					lastMessageTimestamp={lastMessageTimestamp}
					retryConnection={retryConnection}
					connectionStatus={connectionStatus}
					error={error}
				/>
				{containerPageShown && (
					<div className="flex justify-center">
						<div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg shadow-sm">
							<div className="flex space-x-1">
								<button
									onClick={() => setActivePage("overview")}
									className={`p-2 rounded-lg transition-all duration-200 ${
										activePage === "overview"
											? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400"
											: "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-300"
									}`}
									aria-label={t("remote-control.buttonOverview")}
									title={t("remote-control.buttonOverview")}
								>
									<LayoutDashboard size={16} />
								</button>
								<button
									onClick={() => setActivePage("parameters")}
									className={`p-2 rounded-lg transition-all duration-200 ${
										activePage === "parameters"
											? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400"
											: "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-300"
									}`}
									aria-label={t("remote-control.buttonParameters")}
									title={t("remote-control.buttonParameters")}
								>
									<Sliders size={16} />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Main content */}
			{containerPageShown ? (
				<div className="mt-8">
					{activePage === "overview" && (
						<div
							key="overview"
							className="flex flex-wrap items-start gap-8"
						>
							<div className="max-sm:-mx-[calc((100vw-100%)/2)] w-full max-sm:w-screen">
								<HomeDashboard deviceData={overviewData} />
							</div>
							<div className="flex justify-between gap-8 max-sm:flex-col w-full">
								<TemperaturesChartContainer device={device} />
								<MonthlyTemperaturesContainer device={device} />
							</div>
							<div className="flex gap-8 max-sm:flex-col w-full">
								<TemperatureDisplay data={temperatureData} />
								<DeviceStates
									data={stateData}
									hasExtendedView={canViewExtendedParams}
								/>
							</div>
						</div>
					)}
					{activePage === "parameters" && (
						<>
							{canViewExtendedParams && (
								<div className="mb-4 flex justify-end items-center space-x-4">
									{showExtendedParams && deviceConnectionStatus === "connected" && (
										<>
											{extendedReloading &&
												(showReloadButton ? (
													<Button
														variant="outline"
														size="icon"
														onClick={refreshExtendedData}
													>
														<RefreshCw />
													</Button>
												) : (
													<div>
														<Loader2
															className="animate-spin"
															size={16}
														/>
													</div>
												))}
										</>
									)}
									<Button
										size="icon"
										onClick={toggleExtendedParameters}
										variant={showExtendedParams ? "secondary" : "outline"}
									>
										{showExtendedParams ? <Boxes size={16} /> : <Box size={16} />}
									</Button>
								</div>
							)}
							<DeviceParameters
								deviceId={device.id}
								deviceData={parametersData}
								onUpdateParameter={showExtendedParams ? publishMqttExtended : publishMqtt}
								isExtendedMode={showExtendedParams}
							/>
						</>
					)}
				</div>
			) : (
				<DeviceLoader />
			)}
		</div>
	);
};

export const formatInt16 = (value: number): number => {
	return value > 32767 ? value - 65536 : value;
};

export type ExtendedPayload = Record<string, number | string | undefined>;

export const formatExtendedPayload = (payload: ExtendedPayload): ExtendedPayload => {
	const formatted = { ...payload };

	const keysToFormat: string[] = [];

	keysToFormat.forEach((key) => {
		const value = formatted[key];
		if (typeof value === "number") {
			formatted[key] = formatInt16(value);
		}
	});

	return formatted;
};

export default RemoteControlMqttRpi;
