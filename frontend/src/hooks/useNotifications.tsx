import { useState } from "react";
import {
	fetchUserNotifications,
	markNotificationAsSeen,
	fetchUnseenNotifications,
	fetchDeviceNotifications,
	markAllNotificationsAsSeen,
	markDeviceNotificationsAsSeen,
} from "@/api/notifications/actions";
import { Notification, PaginationInfo } from "@/api/notifications/model";
import { ApiHandlerResult, handleApiRequest } from "@/lib/api/apiHandler";

export const useNotifications = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [error, setError] = useState<string | null>(null);

	const [pagination, setPagination] = useState<PaginationInfo | null>(null);

	// Fetch all notifications for the current user
	const getUserNotifications = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchUserNotifications,
			successMessage: "Notifications fetched successfully",
			statusHandlers: {
				404: () => setError("Notifications not found."),
			},
		});
		if (result.success) {
			setNotifications(result.data || []);
		}
		setLoading(false);
		return result;
	};

	// Fetch unseen notifications only
	const getUnseenNotifications = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchUnseenNotifications,
			successMessage: "Unseen notifications fetched successfully",
			statusHandlers: {
				404: () => setError("No unseen notifications found."),
			},
		});
		if (result.success) {
			setNotifications(result.data || []);
		}
		setLoading(false);
		return result;
	};

	// Fetch notifications for a specific device by deviceId
	const getDeviceNotifications = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchDeviceNotifications(deviceId),
			successMessage: "Device notifications fetched successfully",
			statusHandlers: {
				404: () => setError("No notifications found for this device."),
			},
		});
		if (result.success) {
			setNotifications(result.data.notifications || []);
			setPagination(result.data.pagination);
		}
		setLoading(false);
		return result;
	};

	const loadMoreDeviceNotifications = async (deviceId: string): Promise<ApiHandlerResult> => {
		// Prevent loading if there are no more pages.
		if (pagination && !pagination.hasMore) {
			return { success: false, data: null, errors: {}, status: "", statusCode: -1 };
		}
		setLoading(true);
		const nextPage = pagination ? Number(pagination.page) + 1 : 2;

		const result = await handleApiRequest({
			apiCall: () => fetchDeviceNotifications(deviceId, nextPage),
			successMessage: "More notifications fetched successfully",
			statusHandlers: {
				404: () => setError("No notifications found for this device."),
			},
		});

		if (result.success) {
			setNotifications((prev) => [...prev, ...(result.data.notifications || [])]);
			setPagination(result.data.pagination);
		}
		setLoading(false);
		return result;
	};

	// Mark a notification as seen
	const markAsSeen = async (notificationId: number): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => markNotificationAsSeen(notificationId),
			successMessage: "Notification marked as seen",
			statusHandlers: {
				404: () => setError("Notification not found."),
			},
		});
		if (result.success) {
			setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, seen: true } : n)));
		}
		setLoading(false);
		return result;
	};

	// Mark all unseen notifications as seen
	const markAllAsSeen = async (limit: number = 100): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => markAllNotificationsAsSeen(limit),
			successMessage: "All notifications marked as seen",
			statusHandlers: {
				404: () => setError("Failed to mark notifications as seen."),
			},
		});
		if (result.success) {
			// Update local state to mark all notifications as seen
			setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
		}
		setLoading(false);
		return result;
	};

	// Mark all unseen notifications for a specific device as seen
	const markDeviceAllAsSeen = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => markDeviceNotificationsAsSeen(deviceId),
			successMessage: "All device notifications marked as seen",
			statusHandlers: {
				404: () => setError("Failed to mark device notifications as seen."),
			},
		});
		if (result.success) {
			// Update local state to mark all notifications for this device as seen
			setNotifications((prev) => prev.map((n) => (n.device_id === deviceId ? { ...n, seen: true } : n)));
		}
		setLoading(false);
		return result;
	};

	return {
		notifications,
		loading,
		error,
		pagination,
		getUserNotifications,
		getUnseenNotifications,
		getDeviceNotifications,
		markAsSeen,
		markAllAsSeen,
		markDeviceAllAsSeen,
		loadMoreDeviceNotifications,
	};
};
