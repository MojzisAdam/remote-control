const mqttConfig = {
	broker: import.meta.env.VITE_MQTT_HOST || "",
	username: import.meta.env.VITE_MQTT_USERNAME || "",
	password: import.meta.env.VITE_MQTT_PASSWORD || "",
	port: parseInt(import.meta.env.VITE_MQTT_PORT || "1883"),
};

export default mqttConfig;
