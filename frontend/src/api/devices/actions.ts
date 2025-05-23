import axios from "@/utils/axios";
import { Device, DeviceDescription, DeviceUser, DeviceParameterLog } from "@/api/devices/model";
import { AxiosResponse } from "axios";
import { User } from "@/api/user/model";

// List all devices added by the user
export const listUserDevices = async (): Promise<Device[]> => {
	const response = await axios.get("/devices");
	return response.data.devices;
};

export const fetchDevices = async (
	filters: {
		search?: string;
		email?: string;
		status?: string;
		page?: number;
		pageSize?: number;
	} = {}
): Promise<Device[]> => {
	const response = await axios.get("/manage-devices", { params: filters });
	return response.data;
};

export const fetchDeviceSummary = async (): Promise<{
	total: number;
	online: number;
	offline: number;
	error: number;
}> => {
	const response = await axios.get("/manage-devices/summary");
	return response.data;
};

export const fetchDevice = async (deviceId: string): Promise<Device> => {
	const response = await axios.get(`/devices/${deviceId}`);
	return response.data;
};

// Add a device to the user's list
export const addDevice = async (deviceId: string, password: string): Promise<void> => {
	await axios.post("/devices/add", { device_id: deviceId, password });
};

// Update a device's own_name and favourite status
export const updateUserDevice = async (deviceId: string, data: Partial<Pick<DeviceUser, "own_name" | "favourite" | "notifications" | "web_notifications">>): Promise<AxiosResponse<string, string>> => {
	const result = await axios.put(`/devices/${deviceId}`, data);
	return result;
};

// Edit a device's description
export const updateDeviceDescription = async (deviceId: string, descriptionData: Partial<DeviceDescription>): Promise<void> => {
	await axios.put(`/devices/${deviceId}/description`, descriptionData);
};

// Edit a device's description admin
export const updateDeviceDescriptionManage = async (deviceId: string, descriptionData: Partial<DeviceDescription>): Promise<void> => {
	await axios.put(`/manage-devices/${deviceId}/description`, descriptionData);
};

// Get user's favorite devices
export const getFavoriteDevices = async (): Promise<Device[]> => {
	const response = await axios.get("/devices/favorites");
	return response.data.devices;
};

// Get devices summary
export const fetchDeviceStatusSummary = async (): Promise<Device[]> => {
	const response = await axios.get("/devices/status-summary");
	return response.data;
};

export const updateFavouriteOrder = async (newOrder: { deviceId: string; favouriteOrder: number }[]): Promise<string> => {
	const response = await axios.post("/devices/update-favourite-order", {
		devices: newOrder,
	});

	return response.data;
};

// Delete a device from the user's list
export const deleteDevice = async (deviceId: string): Promise<void> => {
	await axios.delete(`/devices/${deviceId}`);
};

export const getDeviceUsers = async (deviceId: string): Promise<User[]> => {
	const response = await axios.get(`/devices/${deviceId}/users`);
	return response.data.users;
};

export const addDeviceToListApi = async (deviceId: string, ownName: string): Promise<string> => {
	const response = await axios.post("/manage-devices/add", { device_id: deviceId, own_name: ownName });
	return response.data;
};

export const logParameterChange = async (
	deviceId: string,
	data: {
		parameter: string;
		old_value: string;
		new_value: string;
	}
): Promise<DeviceParameterLog> => {
	const response = await axios.post(`/device/${deviceId}/log-parameter-change`, data);
	return response.data;
};

export const fetchParameterLogs = async (
	deviceId: string,
	filters: {
		search?: string;
		page?: number;
		pageSize?: number;
		sorting?: string;
	} = {}
): Promise<DeviceParameterLog[]> => {
	const response = await axios.get(`/device/${deviceId}/parameter-logs`, {
		params: filters,
	});
	return response.data;
};

export const updateDeviceVersions = async (
	deviceId: string,
	data: {
		fw_version: string;
		script_version: string;
	}
): Promise<void> => {
	await axios.put(`/devices/${deviceId}/versions`, data);
};

export const addDeviceToUser = async (deviceId: string, email: string, ownName: string): Promise<string> => {
	const response = await axios.post("/manage-devices/add-to-user", {
		device_id: deviceId,
		user_email: email,
		own_name: ownName,
	});
	return response.data;
};
