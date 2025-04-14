import { useState } from "react";
import {
	listUserDevices,
	addDevice,
	fetchDevice,
	fetchDevices,
	fetchDeviceSummary,
	updateUserDevice,
	updateDeviceDescription,
	updateDeviceDescriptionManage,
	getFavoriteDevices,
	fetchDeviceStatusSummary,
	updateFavouriteOrder,
	deleteDevice as apiDeleteDevice,
	getDeviceUsers,
	addDeviceToListApi,
	updateDeviceVersions as updateDeviceVersionsApi,
} from "@/api/devices/actions";
import { ApiHandlerResult, handleApiRequest } from "@/utils/apiHandler";
import { Device, DeviceDescription, DeviceStatusSummary } from "@/api/devices/model";

export const useDevices = () => {
	const [loading, setLoading] = useState(false);
	const [devices, setDevices] = useState<Device[]>([]);
	const [favoriteDevices, setFavoriteDevices] = useState<Device[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [summary, setSummary] = useState<DeviceStatusSummary>({
		total: 0,
		online: 0,
		offline: 0,
		in_error: 0,
	});

	// Fetch all devices added by the user
	const fetchUserDevices = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: listUserDevices,
			successMessage: "Devices fetched successfully",
			statusHandlers: {
				404: () => setError("Devices not found."),
			},
		});
		if (result.success) {
			const processedDevices = (result.data || []).map((device: Device) => ({
				...device,
				status: getDeviceStatus(device),
			}));

			setDevices(processedDevices);
		}
		setLoading(false);
		return result;
	};

	const fetchDevicesWithFilters = async (
		filters: {
			search?: string;
			email?: string;
			status?: "online" | "offline" | "error" | "all";
			page?: number;
			pageSize?: number;
		} = {}
	) => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchDevices(filters),
			successMessage: "Devices fetched successfully",
			statusHandlers: {
				404: () => setError("Devices not found."),
			},
		});
		if (result.success) {
			const processedDevices = (result.data.data || []).map((device: Device) => ({
				...device,
				status: getDeviceStatus(device),
			}));

			setDevices(processedDevices);
		}
		setLoading(false);
		return result;
	};

	const getDeviceSummary = async () => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchDeviceSummary,
			successMessage: "Summary fetched successfully",
		});
		if (result.success) {
			setSummary(result.data.summary || []);
		}
		setLoading(false);
		return result;
	};

	const getDevice = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchDevice(deviceId),
			successMessage: "Device fetched successfully",
			statusHandlers: {
				404: () => setError("Device not found."),
			},
		});
		setLoading(false);
		return result;
	};

	const getStatusSummary = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchDeviceStatusSummary,
			successMessage: "Summary fetched successfully",
		});
		if (result.success) {
			setSummary(result.data.summary || []);
		}
		setLoading(false);
		return result;
	};

	const addNewDevice = async (deviceId: string, password: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => addDevice(deviceId, password),
			successMessage: "Device added successfully",
			statusHandlers: {
				401: () => "Unauthorized to add this device.",
			},
		});
		setLoading(false);
		return result;
	};

	const updateDevice = async (
		deviceId: string,
		data: {
			own_name?: string;
			favourite?: boolean;
			notifications?: boolean;
			favouriteOrder?: number;
		}
	): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateUserDevice(deviceId, data),
			successMessage: "Device updated successfully",
			statusHandlers: {
				403: () => setError("Forbidden to update this device"),
			},
		});
		if (result.success) {
			await fetchUserDevices();
		}
		setLoading(false);
		return result;
	};

	const editDeviceDescription = async (deviceId: string, descriptionData: Partial<DeviceDescription>): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateDeviceDescription(deviceId, descriptionData),
			successMessage: "Device description updated successfully",
			statusHandlers: {
				403: () => setError("Forbidden to edit this device"),
			},
		});
		if (result.success) {
			await fetchUserDevices();
		}
		setLoading(false);
		return result;
	};

	const editDeviceDescriptionManage = async (deviceId: string, descriptionData: Partial<DeviceDescription>): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateDeviceDescriptionManage(deviceId, descriptionData),
			successMessage: "Device description updated successfully",
			statusHandlers: {
				403: () => setError("Forbidden to edit this device"),
			},
		});
		if (result.success) {
			await fetchUserDevices();
		}
		setLoading(false);
		return result;
	};

	// Fetch user's favorite devices
	const fetchFavoriteDevices = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: getFavoriteDevices,
			successMessage: "Favorite devices fetched successfully",
			statusHandlers: {
				404: () => setError("No favorite devices found"),
			},
		});
		if (result.success) {
			setFavoriteDevices(result.data || []);
		}
		setLoading(false);
		return result;
	};

	const editFavouriteOrder = async (newOrder: { deviceId: string; favouriteOrder: number }[]): Promise<ApiHandlerResult> => {
		setLoading(true);

		const result = await handleApiRequest({
			apiCall: () => updateFavouriteOrder(newOrder),
			successMessage: "Favourite devices reordered successfully",
			statusHandlers: {
				404: () => setError("No favorite devices found"),
				500: () => setError("Internal server error, please try again later"),
			},
		});

		setLoading(false);
		return result;
	};

	const getDeviceStatus = (device: Device): "online" | "error" | "offline" => {
		if (!device.last_activity) return "offline";

		const lastActivityTime = new Date(device.last_activity).getTime();
		const fiveMinutesAgo = Date.now() - 10 * 60 * 1000;

		if (lastActivityTime >= fiveMinutesAgo) {
			return device.error_code > 0 ? "error" : "online";
		}

		return "offline";
	};

	const updateDeviceList = (updatedDevice: Device) => {
		setDevices((prevDevices) => prevDevices.map((device) => (device.id === updatedDevice.id ? updatedDevice : device)));
	};

	// Delete a device from the user's list
	const deleteDevice = async (deviceId: string) => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiDeleteDevice(deviceId),
			successMessage: "Device removed successfully",
			statusHandlers: {
				404: () => setError("Device not found."),
				403: () => setError("You are not authorized to remove this device."),
			},
		});

		setLoading(false);
		return result;
	};

	const fetchDeviceUsers = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => getDeviceUsers(deviceId),
			successMessage: "Device users fetched successfully",
			statusHandlers: {
				404: () => setError("Device not found."),
			},
		});
		setLoading(false);
		return result;
	};

	const addDeviceToList = async (deviceId: string, ownName: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => addDeviceToListApi(deviceId, ownName),
			successMessage: "Device added to your list successfully",
			statusHandlers: {
				400: () => "Bad request. Please check your input.",
			},
		});
		setLoading(false);
		return result;
	};

	const updateDeviceVersions = async (deviceId: string, fwVersion: string, scriptVersion: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateDeviceVersionsApi(deviceId, { fw_version: fwVersion, script_version: scriptVersion }),
			successMessage: "Device versions updated successfully",
			statusHandlers: {
				404: () => setError("Device not found."),
				403: () => setError("Forbidden to update this device"),
			},
		});
		setLoading(false);
		return result;
	};

	return {
		devices,
		favoriteDevices,
		loading,
		error,
		summary,
		setDevices,
		fetchUserDevices,
		fetchDevicesWithFilters,
		getDeviceSummary,
		addNewDevice,
		updateDevice,
		editDeviceDescription,
		editDeviceDescriptionManage,
		fetchFavoriteDevices,
		getStatusSummary,
		updateDeviceList,
		getDeviceStatus,
		editFavouriteOrder,
		getDevice,
		deleteDevice,
		fetchDeviceUsers,
		addDeviceToList,
		updateDeviceVersions,
	};
};
