import axios from "@/lib/api/axios";
import { DeviceData } from "@/api/remoteControlApi/model";

export const startSession = async (deviceId: string): Promise<string> => {
	const response = await axios.post(`/remote-control/${deviceId}/start-session`);
	return response.data;
};

export const checkConnection = async (deviceId: string): Promise<string> => {
	const response = await axios.get(`/remote-control/${deviceId}/check-connection`);
	return response.data;
};

export const getDeviceData = async (deviceId: string): Promise<DeviceData> => {
	const response = await axios.get(`/remote-control/${deviceId}/data`);
	return response.data;
};

export const updateParameter = async (deviceId: string, register: number, value: number): Promise<string> => {
	const response = await axios.post(`/remote-control/${deviceId}/update-parameter`, {
		register,
		value,
	});
	return response.data;
};

export const endSession = async (deviceId: string): Promise<string> => {
	const response = await axios.post(`/remote-control/${deviceId}/end-session`);
	return response.data;
};
