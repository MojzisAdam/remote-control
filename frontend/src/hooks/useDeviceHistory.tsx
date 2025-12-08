import { useState, useRef } from "react";
import { handleApiRequest, ApiHandlerResult } from "@/lib/api/apiHandler";
import {
	fetchDeviceHistory,
	fetchUserGraphPreferences,
	updateUserGraphPreferences,
	fetchUserCustomGraphs,
	createCustomGraph,
	updateCustomGraph,
	deleteCustomGraph,
	fetchCustomGraphData,
	fetchMonthlyAverageTemperatures,
	fetchPaginatedDeviceHistory,
} from "@/api/deviceHistory/actions";
import { DeviceHistory, UserCustomGraph, MonthlyTemperatureData, MonthlyTemperatureResponse } from "@/api/deviceHistory/model";

export const useDeviceHistory = () => {
	const [loading, setLoading] = useState(false);
	const deviceHistoryRef = useRef<DeviceHistory[]>([]);
	const [hiddenLines, setHiddenLines] = useState<string[]>([]);
	const [customGraphs, setCustomGraphs] = useState<UserCustomGraph[]>([]);
	const customGraphDataRef = useRef<DeviceHistory[]>([]);

	const [temperatures, setTemperatures] = useState<MonthlyTemperatureData[]>([]);
	const [metadata, setMetadata] = useState<MonthlyTemperatureResponse["meta"] | null>(null);

	/**  Fetch device history */
	const loadDeviceHistory = async (deviceId: string, fromDate?: string, toDate?: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchDeviceHistory(deviceId, fromDate, toDate),
			successMessage: "Device history loaded successfully.",
		});
		if (result.success) {
			if (result.data.data) deviceHistoryRef.current = result.data.data;
		}
		setLoading(false);
		return result;
	};

	const loadPaginatedDeviceHistory = async (deviceId: string, page: number, perPage: number, fromDate?: string, toDate?: string, errorOnly?: boolean): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchPaginatedDeviceHistory(deviceId, page, perPage, fromDate, toDate, errorOnly),
			successMessage: "Paginated device history loaded successfully.",
		});
		if (result.success && result.data.data) {
			deviceHistoryRef.current = result.data.data;
		}
		setLoading(false);
		return result;
	};

	/**  Fetch user graph preferences */
	const loadGraphPreferences = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchUserGraphPreferences(deviceId),
			successMessage: "Graph preferences loaded.",
		});
		if (result.success) {
			setHiddenLines(result.data);
		}

		setLoading(false);
		return result;
	};

	/**  Update user graph preferences */
	const saveGraphPreferences = async (deviceId: string, hiddenLines: string[]): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateUserGraphPreferences(deviceId, hiddenLines),
			successMessage: "Graph preferences saved.",
		});
		if (result.success) {
			setHiddenLines(hiddenLines);
		}
		setLoading(false);
		return result;
	};

	/**  Fetch all custom graphs */
	const loadUserCustomGraphs = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchUserCustomGraphs(deviceId),
			successMessage: "Custom graphs loaded.",
		});
		if (result.success) {
			setCustomGraphs(result.data.data);
		}
		setLoading(false);
		return result;
	};

	// Function to load custom graph data
	const loadCustomGraphData = async (deviceId: string, selectedMetrics: string[], from?: string, to?: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchCustomGraphData(deviceId, selectedMetrics, from, to),
			successMessage: "Device history loaded successfully.",
		});
		if (result.success) {
			customGraphDataRef.current = result.data;
			if (result.data.data) customGraphDataRef.current = result.data.data;
		}
		setLoading(false);
		return result;
	};

	/**  Create a new custom graph */
	const createGraph = async (graphData: Partial<UserCustomGraph>): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => createCustomGraph(graphData),
			successMessage: "Custom graph created successfully.",
		});
		setLoading(false);
		return result;
	};

	/**  Update an existing custom graph */
	const updateGraph = async (graphId: number, graphData: Partial<UserCustomGraph>): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateCustomGraph(graphId, graphData),
			successMessage: "Custom graph updated.",
		});
		if (result.success) {
			if (result.success) {
				setCustomGraphs((prevGraphs) => prevGraphs.map((graph) => (graph.id === graphId ? { ...graph, ...graphData } : graph)));
			}
		}
		setLoading(false);
		return result;
	};

	/**  Delete a custom graph */
	const deleteGraph = async (graphId: number): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => deleteCustomGraph(graphId),
			onSuccess: () => {
				setCustomGraphs((prev) => prev.filter((graph) => graph.id !== graphId));
			},
			successMessage: "Custom graph deleted.",
		});
		setLoading(false);
		return result;
	};

	const loadMonthlyTemperatures = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchMonthlyAverageTemperatures(deviceId),
			successMessage: "Monthly temperature data loaded.",
		});

		if (result.success && result.data) {
			setTemperatures(result.data.data);
			setMetadata(result.data.meta);
		}

		setLoading(false);
		return result;
	};

	return {
		loading,
		deviceHistory: deviceHistoryRef.current,
		hiddenLines,
		customGraphs,
		loadDeviceHistory,
		loadGraphPreferences,
		saveGraphPreferences,
		loadUserCustomGraphs,
		loadPaginatedDeviceHistory,
		customGraphData: customGraphDataRef.current,
		loadCustomGraphData,
		createGraph,
		updateGraph,
		deleteGraph,
		setCustomGraphs,
		temperatures,
		metadata,
		loadMonthlyTemperatures,
	};
};
