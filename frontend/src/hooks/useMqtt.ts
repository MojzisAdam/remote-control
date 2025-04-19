import { useState, useEffect, useCallback, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import mqttConfig from "@/config/mqttConfig";

interface MqttState {
	client: mqtt.MqttClient | null;
	connectionStatus: "connected" | "disconnected" | "connecting" | "reconnecting" | "error";
	error: Error | null;
}

interface MqttOptions extends mqtt.IClientOptions {
	clientId?: string;
	username?: string;
	password?: string;
	clean?: boolean;
	keepalive?: number;
	connectTimeout?: number;
	reconnectPeriod?: number;
}

interface PublishOptions {
	qos?: 0 | 1 | 2;
	retain?: boolean;
	dup?: boolean;
}

interface SubscribeOptions {
	qos?: 0 | 1 | 2;
}

interface UseMqttReturn {
	client: MqttClient | null;
	connectionStatus: "connected" | "disconnected" | "connecting" | "reconnecting" | "error";
	error: Error | null;
	connectClient: (autoReconnect?: boolean) => Promise<void>;
	disconnectClient: () => Promise<void>;
	publishMessage: (topic: string, message: string, options?: PublishOptions) => Promise<void>;
	subscribeToTopic: (topic: string | string[], options?: SubscribeOptions) => Promise<void>;
	unsubscribeFromTopic: (topic: string | string[]) => Promise<void>;
	isSubscribed: (topic: string) => boolean;
	lastMessage: { topic: string; message: string } | null;
}

export const useMqtt = (): UseMqttReturn => {
	const [state, setState] = useState<MqttState>({
		client: null,
		connectionStatus: "disconnected",
		error: null,
	});

	const [lastMessage, setLastMessage] = useState<{
		topic: string;
		message: string;
	} | null>(null);
	const subscribedTopics = useRef<Set<string>>(new Set());
	const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Connect to MQTT broker
	const connectClient = useCallback(
		async (autoReconnect = false): Promise<void> => {
			return new Promise<void>((resolve, reject) => {
				try {
					if (connectionTimeoutRef.current) {
						clearTimeout(connectionTimeoutRef.current);
						connectionTimeoutRef.current = null;
					}

					if (state.client) {
						state.client.end(true);
					}

					const defaultOptions: MqttOptions = {
						clientId: `mqtt-client-${Math.random().toString(16).substring(2, 10)}`,
						clean: true,
						keepalive: 60,
						reconnectPeriod: autoReconnect ? 3000 : 0,
						connectTimeout: 30000,
						username: mqttConfig.username,
						password: mqttConfig.password,
						port: mqttConfig.port,
						protocolVersion: 4,
					};

					setState((prev) => ({
						...prev,
						connectionStatus: "connecting",
						error: null,
					}));

					const mqttClient = mqtt.connect(mqttConfig.broker, defaultOptions);

					mqttClient.on("connect", () => {
						if (connectionTimeoutRef.current) {
							clearTimeout(connectionTimeoutRef.current);
							connectionTimeoutRef.current = null;
						}

						setState((prev) => ({
							...prev,
							client: mqttClient,
							connectionStatus: "connected",
							error: null,
						}));
						resolve();
					});

					mqttClient.on("reconnect", () => {
						setState((prev) => ({
							...prev,
							connectionStatus: "reconnecting",
						}));
					});

					mqttClient.on("error", (err) => {
						if (connectionTimeoutRef.current) {
							clearTimeout(connectionTimeoutRef.current);
							connectionTimeoutRef.current = null;
						}

						setState((prev) => ({
							...prev,
							connectionStatus: "error",
							error: err,
						}));

						if (!autoReconnect && mqttClient) {
							mqttClient.end(true);
						}

						reject(err);
					});

					mqttClient.on("offline", () => {
						setState((prev) => ({
							...prev,
							connectionStatus: "disconnected",
						}));

						if (!autoReconnect && mqttClient) {
							mqttClient.end(true);
						}
					});

					mqttClient.on("disconnect", () => {
						setState((prev) => ({
							...prev,
							connectionStatus: "disconnected",
						}));
					});

					mqttClient.on("message", (topic, message) => {
						setLastMessage({
							topic,
							message: message.toString(),
						});
					});

					const timeout = defaultOptions.connectTimeout || 30000;
					connectionTimeoutRef.current = setTimeout(() => {
						if (mqttClient && mqttClient.connected !== true) {
							const timeoutError = new Error("Device connection timeout");

							setState((prev) => ({
								...prev,
								connectionStatus: "error",
								error: timeoutError,
							}));

							mqttClient.end(true);
							reject(timeoutError);
						}
					}, timeout);
				} catch (error) {
					if (connectionTimeoutRef.current) {
						clearTimeout(connectionTimeoutRef.current);
						connectionTimeoutRef.current = null;
					}

					setState((prev) => ({
						...prev,
						connectionStatus: "error",
						error: error as Error,
					}));
					reject(error);
				}
			});
		},
		[state]
	);

	// Disconnect from MQTT broker
	const disconnectClient = useCallback(async (): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current);
				connectionTimeoutRef.current = null;
			}

			const { client } = state;
			if (!client) {
				resolve();
				return;
			}

			try {
				client.end(false, {}, () => {
					setState((prev) => ({
						...prev,
						client: null,
						connectionStatus: "disconnected",
					}));
					subscribedTopics.current.clear();
					resolve();
				});
			} catch (error) {
				setState((prev) => ({ ...prev, error: error as Error }));
				reject(error);
			}
		});
	}, [state]);

	// Publish message to a topic
	const publishMessage = useCallback(
		async (topic: string, message: string, options: PublishOptions = {}): Promise<void> => {
			await waitForConnection();
			return new Promise<void>((resolve, reject) => {
				const { client } = state;
				if (!client) {
					reject(new Error("MQTT client not connected"));
					return;
				}

				const publishOptions: PublishOptions = {
					qos: options.qos ?? 0,
					retain: options.retain ?? false,
					dup: options.dup ?? false,
				};

				try {
					client.publish(topic, message, publishOptions, (error) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
				} catch (error) {
					reject(error);
				}
			});
		},
		[state]
	);

	// Subscribe to a topic or array of topics
	const subscribeToTopic = useCallback(
		async (topic: string | string[], options: SubscribeOptions = {}): Promise<void> => {
			await waitForConnection();
			return new Promise<void>((resolve, reject) => {
				const { client } = state;
				if (!client) {
					reject(new Error("MQTT client not connected"));
					return;
				}

				try {
					const finalOptions = { qos: options.qos ?? 1 };
					client.subscribe(topic, finalOptions, (error) => {
						if (error) {
							reject(error);
						} else {
							if (Array.isArray(topic)) {
								topic.forEach((t) => subscribedTopics.current.add(t));
							} else {
								subscribedTopics.current.add(topic);
							}
							resolve();
						}
					});
				} catch (error) {
					reject(error);
				}
			});
		},
		[state]
	);

	// Unsubscribe from a topic or array of topics
	const unsubscribeFromTopic = useCallback(
		async (topic: string | string[]): Promise<void> => {
			await waitForConnection();
			return new Promise<void>((resolve, reject) => {
				const { client } = state;
				if (!client) {
					reject(new Error("MQTT client not connected"));
					return;
				}

				try {
					client.unsubscribe(topic, (error) => {
						if (error) {
							reject(error);
						} else {
							if (Array.isArray(topic)) {
								topic.forEach((t) => subscribedTopics.current.delete(t));
							} else {
								subscribedTopics.current.delete(topic);
							}
							resolve();
						}
					});
				} catch (error) {
					reject(error);
				}
			});
		},
		[state]
	);

	const waitForConnection = async (timeoutMs = 10000): Promise<void> => {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();

			const checkConnection = () => {
				if (state.connectionStatus === "connected") {
					resolve();
				} else if (state.connectionStatus === "error") {
					reject(new Error("Connection failed"));
				} else if (Date.now() - startTime > timeoutMs) {
					reject(new Error("Connection timeout"));
				} else if (state.connectionStatus === "connecting" || state.connectionStatus === "reconnecting") {
					setTimeout(checkConnection, 500);
				}
			};

			checkConnection();
		});
	};

	// Check if a topic is subscribed
	const isSubscribed = useCallback((topic: string): boolean => {
		return subscribedTopics.current.has(topic);
	}, []);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current);
			}

			if (state.client) {
				state.client.end();
			}
		};
	}, [state.client]);

	return {
		client: state.client,
		connectionStatus: state.connectionStatus,
		error: state.error,
		connectClient,
		disconnectClient,
		publishMessage,
		subscribeToTopic,
		unsubscribeFromTopic,
		isSubscribed,
		lastMessage,
	};
};
