const mqttConfig = {
	broker: import.meta.env.MQTT_HOST || "",
	username: import.meta.env.MQTT_USERNAME || "",
	password: import.meta.env.MQTT_PASSWORD || "",
	port: parseInt(import.meta.env.MQTT_PORT || "1883"),
};

export default mqttConfig;
