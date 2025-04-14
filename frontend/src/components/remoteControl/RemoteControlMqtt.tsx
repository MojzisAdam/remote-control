import { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";
import { useMqtt } from "@/hooks/useMqtt";
import DeviceStates from "./DeviceStates";
import TemperatureDisplay from "./TemperatureDisplay";
import HomeDashboard from "./HomeOverviewModern";
import TemperaturesChartContainer from "./TemperaturesChart";
import MonthlyTemperaturesContainer from "./MonthlyTemperatures";
import ConnectionStatusIndicator from "@/components/remoteControl/ConnectionStatusIndicator";
import DeviceLoader from "@/components/remoteControl/DeviceLoader";
import { LayoutDashboard, Sliders, Boxes, Box, RefreshCw, Loader2 } from "lucide-react";
import DeviceParameters from "./DeviceParameters";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useDevices } from "@/hooks/useDevices";
import { useDeviceContext } from "@/provider/DeviceProvider";

interface DeviceData {
	[key: string]: number | string | undefined;
	reg_33?: number;
	reg_35?: number;
	reg_36?: number;
	reg_38?: number;
	reg_64?: number;
	reg_65?: number;
	reg_66?: number;
	reg_68?: number;
	reg_71?: number;
	reg_75?: number;
	reg_76?: number;
	reg_77?: number;
	reg_78?: number;
	reg_96?: number;
	reg_97?: number;
	reg_99?: number;
	reg_108?: number;
	reg_109?: number;
	reg_110?: number;
	reg_111?: number;
	reg_128?: number;
	reg_133?: number;
	reg_192?: number;
	reg_193?: number;
	reg_195?: number;
	reg_257?: number;
	reg_258?: number;
	reg_260?: number;
	reg_512?: number;
	reg_608?: number;
	reg_610?: number;
	reg_640?: number;
	reg_646?: number;
	reg_673?: number;
	reg_674?: number;
	reg_675?: number;
	reg_676?: number;
	reg_677?: number;
	reg_678?: number;
	reg_679?: number;
	reg_680?: number;
	reg_681?: number;
	reg_685?: number;
	reg_704?: number;
	reg_705?: number;
	reg_707?: number;
	reg_708?: number;
	reg_736?: number;
	reg_737?: number;
	reg_739?: number;
	reg_740?: number;
	reg_741?: number;
	reg_745?: number;
	reg_746?: number;
	reg_834?: number;
	she_hum?: number;
	fw_v?: string;
	fhi?: number;
}

interface RemoteControlMqttProps {
	deviceId: string;
	onDataReceived?: (data: DeviceData) => void;
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

const RemoteControlMqtt: React.FC<RemoteControlMqttProps> = ({ deviceId, onDataReceived }) => {
	const { t } = useTranslation("remote-control");
	const { updateDeviceVersions } = useDevices();
	const { currentDevice, updateDevice } = useDeviceContext();
	const { client, connectionStatus, error, connectClient, disconnectClient, publishMessage, subscribeToTopic, lastMessage } = useMqtt();

	const [deviceData, dispatchDeviceData] = useReducer(deviceDataReducer, {});
	const startCounter = useRef<number>(0b000);
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
		if (deviceData.fw_v && deviceData.reg_834 && !versionsUpdated.current) {
			const updateVersions = async () => {
				try {
					const result = await updateDeviceVersions(deviceId, deviceData.fw_v as string, `${deviceData.reg_834}`);

					if (result.success && currentDevice) {
						const updatedDevice = {
							...currentDevice,
							fw_version: deviceData.fw_v as string,
							script_version: `${deviceData.reg_834}`,
						};
						updateDevice(updatedDevice);
					}

					versionsUpdated.current = true;
				} catch (error) {
					console.error("Failed to update device versions:", error);
				}
			};

			updateVersions();
		}
	}, [deviceId, deviceData.fw_v, deviceData.reg_834, updateDeviceVersions, currentDevice, updateDevice]);

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
				const topic = `/amit_cim/publish/${deviceId}/#`;
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
				const sendTopic = `/amit_cim/subscribe/${deviceId}/w`;
				await publishMessage(sendTopic, JSON.stringify({ send: 1 }), { qos: 1 });
				hasPublishedInitialMessage.current = true;
			} catch (err) {
				console.error("Failed to publish initial message:", err);
			}
		};

		setupSubscription();
		startConnectionTimeout();
	}, [connectionStatus, subscribeToTopic, publishMessage, deviceId]);

	useEffect(() => {
		const setupExtendedSubscription = async () => {
			if (!showExtendedParams || connectionStatus !== "connected" || isExtendedSubscribed.current) return;
			try {
				const topic = `/amit_cim/publish_s/${deviceId}/params`;
				await subscribeToTopic(topic);
				isExtendedSubscribed.current = true;

				const sendTopic = `/amit_cim/subscribe/${deviceId}/ws`;
				await publishMessage(sendTopic, JSON.stringify({ send: 1 }), { qos: 1 });
			} catch (err) {
				console.error("Failed to subscribe to extended parameters topic:", err);
				isExtendedSubscribed.current = false;
			}
		};
		setupExtendedSubscription();
	}, [showExtendedParams, connectionStatus, subscribeToTopic, publishMessage, deviceId]);

	useEffect(() => {
		if (!lastMessage) return;

		const messageId = `${lastMessage.topic}:${lastMessage.message}`;
		if (messageId === lastProcessedMessage.current) return;
		lastProcessedMessage.current = messageId;

		try {
			resetConnectionTimeout();

			const { topic, message } = lastMessage;
			const payload = JSON.parse(message);

			if (topic.includes("/publish_s/") && topic.includes("/params")) {
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

			if (topic.endsWith("1")) {
				newData = {
					reg_33: payload.reg_33,
					reg_35: payload.reg_35,
					reg_36: payload.reg_36,
					reg_38: payload.reg_38,
					reg_64: payload.reg_64,
					reg_65: formatInt16(payload.reg_65),
					reg_66: payload.reg_66,
					reg_68: payload.reg_68,
					reg_71: payload.reg_71,
					reg_75: payload.reg_75,
					reg_76: payload.reg_76,
				};
				startCounter.current |= 0b001;
			} else if (topic.endsWith("2")) {
				newData = {
					reg_77: payload.reg_77,
					reg_78: payload.reg_78,
					reg_96: payload.reg_96,
					reg_97: payload.reg_97,
					reg_99: payload.reg_99,
					reg_108: payload.reg_108,
					reg_109: payload.reg_109,
					reg_110: payload.reg_110,
					reg_111: payload.reg_111,
					reg_128: formatInt16(payload.reg_128),
					reg_133: payload.reg_133,
					reg_192: payload.reg_192,
				};
				startCounter.current |= 0b010;
			} else if (topic.endsWith("3")) {
				newData = {
					reg_193: payload.reg_193,
					reg_257: payload.reg_257,
					reg_258: payload.reg_258,
					reg_260: payload.reg_260,
					reg_195: payload.reg_195,
					reg_512: payload.reg_512,
					reg_608: payload.reg_608,
					reg_610: payload.reg_610,
					reg_640: payload.reg_640,
					reg_646: payload.reg_646,
					reg_673: payload.reg_673,
					reg_674: payload.reg_674,
					reg_675: payload.reg_675,
					reg_676: payload.reg_676,
					reg_677: payload.reg_677,
					reg_678: payload.reg_678,
					reg_679: payload.reg_679,
					reg_680: payload.reg_680,
					reg_681: payload.reg_681,
					reg_685: payload.reg_685,
					reg_704: payload.reg_704,
					reg_705: payload.reg_705,
					reg_707: payload.reg_707,
					reg_708: payload.reg_708,
					reg_736: payload.reg_736,
					reg_737: payload.reg_737,
					reg_739: payload.reg_739,
					reg_740: payload.reg_740,
					reg_741: payload.reg_741,
					reg_745: payload.reg_745,
					reg_746: payload.reg_746,
					reg_834: payload.reg_834,
					she_hum: payload.she_hum,
					fw_v: payload.fw_v,
					fhi: payload.fhi,
				};
				startCounter.current |= 0b100;
			}

			dispatchDeviceData({ type: "UPDATE", payload: newData });

			if (onDataReceived) {
				try {
					onDataReceived(newData);
				} catch (callbackError) {
					console.error("Error in onDataReceived callback:", callbackError);
				}
			}

			if (startCounter.current === 0b111 && !containerPageShown) {
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
			const name = typeof register === "number" ? `reg_${register}` : register;

			const topic = ["reg_64", "reg_65", "reg_71", "reg_68", "reg_75", "reg_76", "reg_77", "reg_78", "reg_33", "reg_35"].includes(name)
				? `/amit_cim/subscribe/${deviceId}/1`
				: `/amit_cim/subscribe/${deviceId}/2`;
			const message = JSON.stringify({
				reg_change: 1,
				[`${name}_change`]: 1,
				[name]: value,
			});
			try {
				await publishMessage(topic, message, { qos: 1 });
			} catch (error) {
				console.error("Failed to publish MQTT message:", error);
			}
		},
		[deviceId, publishMessage]
	);

	const publishMqttExtended = useCallback(
		async (register: number, value: number) => {
			const topic = `/amit_cim/subscribe/${deviceId}/change`;
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
		[deviceId, publishMessage]
	);

	const toggleExtendedParameters = useCallback(async () => {
		const newState = !showExtendedParams;
		setShowExtendedParams(newState);
		if (newState && !isExtendedSubscribed.current) {
			setExtendedReloading(true);
			try {
				const topic = `/amit_cim/publish_s/${deviceId}/params`;
				await subscribeToTopic(topic);
				isExtendedSubscribed.current = true;
				const sendTopic = `/amit_cim/subscribe/${deviceId}/ws`;
				await publishMessage(sendTopic, JSON.stringify({ send: 1 }));
			} catch (err) {
				console.error("Failed to setup extended parameters:", err);
				setShowExtendedParams(false);
			}
		} else if (!newState) {
		}
	}, [showExtendedParams, deviceId, subscribeToTopic, publishMessage]);

	const refreshExtendedData = useCallback(async () => {
		setExtendedReloading(true);
		setExtendedReloadingStart(Date.now());
		setLastExtendedMessageTimestamp(null);
		setShowReloadButton(false);
		try {
			const sendTopic = `/amit_cim/subscribe/${deviceId}/ws`;
			await publishMessage(sendTopic, JSON.stringify({ send: 1 }));
		} catch (err) {
			console.error("Failed to refresh extended parameters:", err);
		}
	}, [deviceId, publishMessage]);

	useEffect(() => {
		if ((deviceConnectionStatus === "disconnected" || deviceConnectionStatus === "offline") && isExtendedSubscribed.current) {
			if (client && connectionStatus === "connected") {
				client.unsubscribe(`/amit_cim/publish_s/${deviceId}/params`);
			}
			isExtendedSubscribed.current = false;
		}
	}, [deviceConnectionStatus, client, connectionStatus, deviceId]);

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
			reg_192: deviceData.reg_192,
			reg_673: deviceData.reg_673,
			reg_674: deviceData.reg_674,
			reg_675: deviceData.reg_675,
			reg_676: deviceData.reg_676,
			reg_677: deviceData.reg_677,
			reg_678: deviceData.reg_678,
			reg_679: deviceData.reg_679,
			reg_680: deviceData.reg_680,
			reg_685: deviceData.reg_685,
			reg_704: deviceData.reg_704,
			reg_705: deviceData.reg_705,
			reg_707: deviceData.reg_707,
			reg_708: deviceData.reg_708,
			reg_681: deviceData.reg_681,
		}),
		[deviceData]
	);

	const stateData = useMemo(
		() => ({
			reg_736: deviceData.reg_736,
			reg_737: deviceData.reg_737,
			reg_739: deviceData.reg_739,
			reg_740: deviceData.reg_740,
			reg_741: deviceData.reg_741,
			reg_608: deviceData.reg_608,
			reg_610: deviceData.reg_610,
			reg_640: deviceData.reg_640,
			reg_646: deviceData.reg_646,
			reg_745: deviceData.reg_745,
			reg_746: deviceData.reg_746,
			reg_512: deviceData.reg_512,
			reg_834: deviceData.reg_834,
			fw_v: deviceData.fw_v,
		}),
		[deviceData]
	);

	const parametersData = useMemo(
		() =>
			showExtendedParams
				? { ...extendedData }
				: {
						reg_33: deviceData.reg_33,
						reg_35: deviceData.reg_35,
						reg_36: deviceData.reg_36,
						reg_38: deviceData.reg_38,
						reg_64: deviceData.reg_64,
						reg_65: deviceData.reg_65,
						// reg_66: deviceData.reg_66,
						reg_68: deviceData.reg_68,
						reg_71: deviceData.reg_71,
						reg_75: deviceData.reg_75,
						reg_76: deviceData.reg_76,
						reg_77: deviceData.reg_77,
						reg_78: deviceData.reg_78,
						reg_96: deviceData.reg_96,
						reg_97: deviceData.reg_97,
						reg_99: deviceData.reg_99,
						reg_108: deviceData.reg_108,
						reg_109: deviceData.reg_109,
						reg_110: deviceData.reg_110,
						reg_111: deviceData.reg_111,
						reg_128: deviceData.reg_128,
						reg_133: deviceData.reg_133,
						// reg_192: deviceData.reg_192,
						reg_193: deviceData.reg_193 !== undefined ? deviceData.reg_193 * 10 : deviceData.reg_193,
						reg_195: deviceData.reg_195 !== undefined ? deviceData.reg_195 * 10 : deviceData.reg_195,
						reg_257: deviceData.reg_257,
						reg_258: deviceData.reg_258,
						reg_260: deviceData.reg_260,
						fhi: deviceData.fhi,
				  },
		[showExtendedParams, extendedData, deviceData]
	);

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
								<TemperaturesChartContainer deviceId={deviceId} />
								<MonthlyTemperaturesContainer deviceId={deviceId} />
							</div>
							<div className="flex gap-8 max-sm:flex-col w-full">
								<TemperatureDisplay data={temperatureData} />
								<DeviceStates data={stateData} />
							</div>
						</div>
					)}
					{activePage === "parameters" && (
						<>
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
							<DeviceParameters
								deviceId={deviceId}
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

	const keysToFormat = ["P4.1", "P4.F", "P8.0", "P8.3", "P8.8", "PC.2"];

	keysToFormat.forEach((key) => {
		const value = formatted[key];
		if (typeof value === "number") {
			formatted[key] = formatInt16(value);
		}
	});

	return formatted;
};

export default RemoteControlMqtt;
