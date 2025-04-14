import { useEffect, useState, useCallback, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import mqttConfig from "@/config/mqttConfig";

interface UseMqttClientProps {
	deviceId: string;
	topics: string[];
	onMessage?: (payload: { topic: string; message: string }) => void;
	autoConnect?: boolean;
}

const useMqttClient = ({ deviceId, topics, onMessage, autoConnect = true }: UseMqttClientProps) => {
	const [isConnected, setIsConnected] = useState(false);
	const [payload, setPayload] = useState<{ topic: string; message: string }>({
		topic: "",
		message: "",
	});
	const clientRef = useRef<MqttClient | null>(null);

	const connectClient = useCallback(async () => {
		if (clientRef.current) return;

		const clientId = `mqtt_client_${Math.random().toString(16).substr(2, 8)}`;
		const mqttClient = mqtt.connect(mqttConfig.broker, {
			clientId,
			username: mqttConfig.username,
			password: mqttConfig.password,
			port: mqttConfig.port,
			clean: true,
			keepalive: 60,
			reconnectPeriod: 1200000,
			connectTimeout: 30000,
		});

		clientRef.current = mqttClient;
		return new Promise<void>(() => {
			mqttClient.on("connect", () => {
				console.log("Connected to MQTT broker");
				setIsConnected(true);
				if (mqttClient.connected) {
					const mqttPub = `/amit_cim/publish/${deviceId.toUpperCase()}/#`;
					const mqttSub = `/amit_cim/subscribe/${deviceId.toUpperCase()}`;

					mqttClient.subscribe([...topics, mqttPub], { qos: 1 }, (err) => {
						if (err) console.error("Subscription error:", err);
					});

					const message = JSON.stringify({ send: 1 });
					mqttClient.publish(`${mqttSub}/w`, message, { qos: 1 }, (err) => {
						if (err) console.error("Publish error:", err);
					});

					topics.forEach((topic) => {
						mqttClient.subscribe(topic, (err) => {
							if (err) console.error(`Subscription error on ${topic}:`, err);
						});
					});
				} else {
					console.warn("MQTT Client not yet connected, skipping subscription...");
				}
			});

			mqttClient.on("message", (_topic, message) => {
				const payloadMessage = {
					topic: _topic,
					message: message.toString(),
				};
				setPayload(payloadMessage);

				if (onMessage) onMessage(payloadMessage);
			});

			mqttClient.on("error", (err) => console.error("MQTT Error:", err));
			mqttClient.on("reconnect", () => console.log("Reconnecting..."));
			mqttClient.on("close", () => {
				console.log("Disconnected");
				setIsConnected(false);
			});
		});
	}, []);

	const publishMessage = useCallback((topic: string, payload: string) => {
		if (!clientRef.current) {
			console.warn("MQTT Client is not initialized. Cannot publish message.");
			return;
		}

		if (!clientRef.current.connected) {
			console.warn("MQTT Client is not connected. Cannot publish message.");
			return;
		}

		clientRef.current.publish(topic, payload, { qos: 1 }, (err) => {
			if (err) {
				console.error("Publish error:", err);
			}
		});
	}, []);

	const disconnectClient = useCallback(async () => {
		if (clientRef.current) {
			console.log("Disconnecting MQTT client...");
			await new Promise((resolve) => setTimeout(resolve, 500));
			clientRef.current.end(true, () => {
				console.log("MQTT Client disconnected cleanly.");
				clientRef.current = null;
			});
			setIsConnected(false);
		} else {
			console.warn("MQTT Client is already disconnected or not initialized.");
		}
	}, []);
	useEffect(() => {
		if (autoConnect) connectClient();

		return () => {
			const cleanup = async () => {
				await disconnectClient();
			};
			cleanup();
		};
	}, []);

	return {
		isConnected,
		payload,
		publishMessage,
		connectClient,
		disconnectClient,
	};
};

export default useMqttClient;
