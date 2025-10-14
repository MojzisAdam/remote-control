const routes = {
	dashboard: "/dashboard",
	history: (deviceId: string) => `/history/${deviceId}/graph`,
	historyTable: (deviceId: string) => `/history/${deviceId}/table`,
	remoteControl: (deviceId: string) => `/remote-control/${deviceId}`,
	notifications: (deviceId: string) => `/notifications/${deviceId}`,
	parameterLog: (deviceId: string) => `/parameter-log/${deviceId}`,
	settings: "/settings",
	apps: "/apps",
	automations: "/automations",
	automationBuilder: "/automations/builder",
	automationBuilderEdit: (automationId: number) => `/automations/builder/${automationId}`,
	automationLogs: (automationId: number) => `/automations/logs/${automationId}`,
	deviceTypesManagement: "/device-types-management",
	deviceTypeCreate: "/device-types-management/create",
	deviceTypeDetail: (deviceTypeId: string) => `/device-types-management/${deviceTypeId}`,
};

export default routes;
