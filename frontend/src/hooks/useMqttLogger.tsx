import { useState, useEffect, useCallback } from "react";
import { useMqtt } from "./useMqtt";
import { DeviceHistory } from "@/api/deviceHistory/model";

interface UseMqttLoggerProps {
	deviceId: string;
}

interface UseMqttLoggerReturn {
	logData: DeviceHistory[];
	isLogging: boolean;
	startLogging: () => Promise<void>;
	stopLogging: () => Promise<void>;
	clearLogs: () => void;
	connectionStatus: "connected" | "disconnected" | "connecting" | "reconnecting" | "error";
	error: Error | null;
}

const MAX_LOG_ENTRIES = 10000;

export const useMqttLogger = ({ deviceId }: UseMqttLoggerProps): UseMqttLoggerReturn => {
	const { connectClient, disconnectClient, subscribeToTopic, publishMessage, connectionStatus, error, lastMessage, client } = useMqtt(deviceId);

	const [logData, setLogData] = useState<DeviceHistory[]>([]);
	const [isLogging, setIsLogging] = useState<boolean>(false);
	const [isStartingLogging, setIsStartingLogging] = useState<boolean>(false);

	const deviceTopics = [`/amit_cim/web_log/${deviceId}/data`];

	const publishTopic = `/amit_cim/web_log_sub/${deviceId}/wc`;

	useEffect(() => {
		const subscribeToTopics = async () => {
			if (isStartingLogging && connectionStatus === "connected" && client) {
				try {
					await Promise.all(deviceTopics.map((topic) => subscribeToTopic(topic)));
					await publishMessage(publishTopic, '{"send": 1}', {
						qos: 1,
					});
					setIsLogging(true);
					setIsStartingLogging(false);
				} catch (error) {
					console.error("Failed to subscribe to topics:", error);
					setIsStartingLogging(false);
				}
			}
		};

		subscribeToTopics();
	}, [isStartingLogging, connectionStatus, client, deviceTopics, subscribeToTopic]);

	const startLogging = useCallback(async (): Promise<void> => {
		try {
			setIsStartingLogging(true);

			if (connectionStatus !== "connected") {
				await connectClient();
			} else {
				await Promise.all(deviceTopics.map((topic) => subscribeToTopic(topic)));
				await publishMessage(publishTopic, '{"send": 1}', { qos: 1 });
				setIsLogging(true);
				setIsStartingLogging(false);
			}
		} catch (error) {
			console.error("Failed to start logging:", error);
			setIsStartingLogging(false);
			throw error;
		}
	}, [connectClient, subscribeToTopic, connectionStatus, deviceTopics]);

	const stopLogging = useCallback(async (): Promise<void> => {
		try {
			await publishMessage(publishTopic, '{"send": 0}', { qos: 1 });
			await disconnectClient();
			clearLogs();
			setIsLogging(false);
		} catch (error) {
			console.error("Failed to stop logging:", error);
			throw error;
		}
	}, [disconnectClient]);

	const clearLogs = useCallback((): void => {
		setLogData([]);
	}, []);

	useEffect(() => {
		if (isLogging && lastMessage && lastMessage.topic) {
			const isDeviceMessage = deviceTopics.some((topic) => lastMessage.topic.startsWith(topic) || lastMessage.topic.includes(`/${deviceId}/`));

			if (isDeviceMessage) {
				const parsedMessage = JSON.parse(lastMessage.message);

				const newEntry: DeviceHistory = {
					cas: new Date().toISOString(),
					...parsedMessage,
				};

				setLogData((prevData) => {
					const updatedData = [...prevData, newEntry];

					return updatedData.length > MAX_LOG_ENTRIES ? updatedData.slice(-MAX_LOG_ENTRIES) : updatedData;
				});
			}
		}
	}, [lastMessage]);

	useEffect(() => {
		return () => {
			disconnectClient();
		};
	}, [disconnectClient]);

	return {
		logData,
		isLogging,
		startLogging,
		stopLogging,
		clearLogs,
		connectionStatus,
		error,
	};
};
