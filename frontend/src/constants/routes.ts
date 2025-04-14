const routes = {
	dashboard: "/dashboard",
	history: (deviceId: string) => `/history/${deviceId}/graph`,
	historyTable: (deviceId: string) => `/history/${deviceId}/table`,
	remoteControl: (deviceId: string) => `/remote-control/${deviceId}`,
	notifications: (deviceId: string) => `/notifications/${deviceId}`,
	parameterLog: (deviceId: string) => `/parameter-log/${deviceId}`,
	settings: "/settings",
};

export default routes;
