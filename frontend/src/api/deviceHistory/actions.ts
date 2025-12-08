import axios from "@/lib/api/axios";
import { DeviceHistory, UserGraphPreference, UserCustomGraph, MonthlyTemperatureResponse } from "@/api/deviceHistory/model";

/** Fetch device history data */
export const fetchDeviceHistory = async (deviceId: string, fromDate?: string, toDate?: string): Promise<DeviceHistory[]> => {
	const response = await axios.get(`/device-history/${deviceId}`, {
		params: { from_date: fromDate, to_date: toDate },
	});

	return response.data;
};

/** Fetch user graph preferences (hidden lines) */
export const fetchUserGraphPreferences = async (deviceId: string): Promise<UserGraphPreference> => {
	const response = await axios.get(`/hidden-lines/${deviceId}`);
	return response.data;
};

/** Update user graph preferences (hidden lines) */
export const updateUserGraphPreferences = async (deviceId: string, hiddenLines: string[]): Promise<UserGraphPreference> => {
	const response = await axios.post(`/hidden-lines/${deviceId}`, {
		hidden_lines: hiddenLines,
	});
	return response.data;
};

/** Fetch all custom graphs for a user */
export const fetchUserCustomGraphs = async (deviceId: string): Promise<UserCustomGraph[]> => {
	const response = await axios.get(`/custom-graphs/${deviceId}`);
	return response.data;
};

/** Create a new custom graph */
export const createCustomGraph = async (graphData: Partial<UserCustomGraph>): Promise<UserCustomGraph> => {
	const response = await axios.post(`/custom-graphs/${graphData.deviceId}`, graphData);
	return response.data;
};

/** Update an existing custom graph */
export const updateCustomGraph = async (graphId: number, graphData: Partial<UserCustomGraph>): Promise<UserCustomGraph> => {
	const response = await axios.put(`/custom-graphs/${graphId}`, graphData);
	return response.data;
};

/** Delete a custom graph */
export const deleteCustomGraph = async (graphId: number): Promise<void> => {
	await axios.delete(`/custom-graphs/${graphId}`);
};

/** Fetch a history data only for selected columns */
export const fetchCustomGraphData = async (deviceId: string, selectedMetrics: string[], from?: string, to?: string): Promise<Partial<DeviceHistory[]>> => {
	const response = await axios.post(`/device-history/${deviceId}/custom-graph`, {
		selectedMetrics: selectedMetrics,
		from_date: from,
		to_date: to,
	});
	return response.data;
};

export const fetchMonthlyAverageTemperatures = async (deviceId: string): Promise<MonthlyTemperatureResponse> => {
	const response = await axios.get(`/temperatures/monthly-average/${deviceId}`);
	return response.data;
};

export const fetchPaginatedDeviceHistory = async (
	deviceId: string,
	page: number,
	perPage: number,
	fromDate?: string,
	toDate?: string,
	errorOnly?: boolean
): Promise<{
	data: DeviceHistory[];
	meta: { total: number; page: number; per_page: number };
}> => {
	const response = await axios.get(`/device-history/${deviceId}/paginated`, {
		params: {
			page,
			per_page: perPage,
			from_date: fromDate,
			to_date: toDate,
			error_only: errorOnly ? 1 : undefined,
		},
	});
	return response.data;
};
