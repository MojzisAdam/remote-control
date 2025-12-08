import { useState } from "react";
import { ApiHandlerResult, handleApiRequest } from "@/lib/api/apiHandler";
import {
	fetchUsers as fetchUsersApi,
	deleteUser as deleteUserApi,
	registerUser as registerUserApi,
	updateUser as updateUserApi,
	updateLastVisitedDevice,
	getLastVisitedDevice,
	toggleDisplayLastVisitedDevice,
	getDisplayLastVisitedDevice,
	resetUserPassword,
} from "@/api/manageUsers/actions";
import { SortingState } from "@tanstack/react-table";
import { InformationFormData } from "@/components/user-management/edit-user-modal";
import { InformationRegisterFormData } from "@/components/user-management/create-user-modal";
import { useAuthContext } from "@/providers/AuthContextProvider";

export const useUserManagement = () => {
	const [loading, setLoading] = useState(false);
	const { user } = useAuthContext();

	const fetchUsers = async ({ page, pageSize, search, sorting }: { page: number; pageSize: number; search: string; sorting: SortingState }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => fetchUsersApi({ page, pageSize, search, sorting }),
			successMessage: "Users fetched successfuly",
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const registerUser = async (informationFormData: InformationRegisterFormData): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => registerUserApi(informationFormData),
			successMessage: "Registration successful!",
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const deleteUser = async (userId: number): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => deleteUserApi(userId),
			successMessage: "User deleted successfuly.",
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const updateUser = async (userId: number, informationFormData: InformationFormData): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateUserApi(userId, informationFormData),
			successMessage: "User deleted successfuly.",
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	// Fetch last visited device
	const fetchLastVisitedDevice = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: getLastVisitedDevice,
			successMessage: null,
		});
		setLoading(false);
		return result;
	};

	// Update last visited device
	const setLastVisited = async (deviceId: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => updateLastVisitedDevice(deviceId),
			successMessage: "Last visited device updated successfully",
			statusHandlers: {
				401: () => "Unauthorized to update last visited device.",
			},
			onSuccess: () => user && (user.lastVisitedDeviceId = deviceId),
		});
		setLoading(false);
		return result;
	};

	// Toggle the display of last visited device
	const toggleLastVisitedDisplay = async (enabled: boolean): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => toggleDisplayLastVisitedDevice(enabled),
			successMessage: `Last visited device display ${enabled ? "enabled" : "disabled"} successfully`,
			statusHandlers: {
				401: () => "Unauthorized to change display setting.",
			},
		});
		setLoading(false);
		return result;
	};

	// Fetch whether last visited device is displayed
	const fetchDisplayLastVisitedDevice = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: getDisplayLastVisitedDevice,
			successMessage: null,
		});
		setLoading(false);
		return result;
	};

	// Reset user password
	const resetPassword = async (userId: number, password: string, password_confirmation: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => resetUserPassword(userId, password, password_confirmation),
			successMessage: "Password reset successfully",
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	return {
		loading,
		deleteUser,
		fetchUsers,
		updateUser,
		registerUser,
		fetchLastVisitedDevice,
		setLastVisited,
		toggleLastVisitedDisplay,
		fetchDisplayLastVisitedDevice,
		resetPassword,
	};
};
