import axios from "@/utils/axios";
import { Notification, PaginatedResponse } from "@/api/notifications/model";
import { AxiosResponse } from "axios";

// Fetch all notifications for the authenticated user
export const fetchUserNotifications = async (): Promise<Notification[]> => {
	const response: AxiosResponse = await axios.get("/notifications");
	return response.data;
};

// Mark a notification as seen
export const markNotificationAsSeen = async (notificationId: number): Promise<Notification> => {
	const response: AxiosResponse = await axios.put(`/notifications/${notificationId}/mark-as-seen`);
	return response.data;
};

export const fetchUnseenNotifications = async (): Promise<Notification[]> => {
	const response: AxiosResponse = await axios.get("/notifications/unseen");
	return response.data;
};

// Fetch notifications for a specific device
export const fetchDeviceNotifications = async (deviceId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Notification>> => {
	const response: AxiosResponse = await axios.get(`/notifications/device/${deviceId}?page=${page}&limit=${limit}`);
    return response.data;
};
