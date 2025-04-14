import { useState } from "react";
import { handleApiRequest } from "@/utils/apiHandler";
import { logParameterChange, fetchParameterLogs } from "@/api/devices/actions";
import { DeviceParameterLog } from "@/api/devices/model";

export const useDeviceParameterLogs = () => {
	const [logs, setLogs] = useState<DeviceParameterLog[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const logChange = async (deviceId: string, data: { parameter: string; old_value: string; new_value: string }) => {
		setLoading(true);
		setError(null);
		const result = await handleApiRequest({
			apiCall: () => logParameterChange(deviceId, data),
			successMessage: "Parameter change logged successfully",
			statusHandlers: {
				404: () => "Device not found",
				500: () => "Server error while logging parameter change",
			},
		});
		setLoading(false);
		if (!result.success) {
			setError(result.status || "Error logging parameter change");
		}
		return result;
	};

	const fetchLogs = async (
		deviceId: string,
		filters: {
			search?: string;
			page?: number;
			pageSize?: number;
			sorting?: string;
		} = {}
	) => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchParameterLogs(deviceId, filters),
			successMessage: "Logs fetched successfully",
			statusHandlers: {
				404: () => setError("Logs not found."),
			},
		});
		if (result.success) {
			const logsData = result.data.data || [];
			setLogs(logsData);
		}
		setLoading(false);
		return result;
	};

	return {
		logs,
		loading,
		error,
		logChange,
		fetchLogs,
	};
};

export default useDeviceParameterLogs;
