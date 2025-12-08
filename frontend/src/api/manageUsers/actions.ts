import { User } from "@/api/user/model";
import axios from "@/lib/api/axios";
import { Device } from "../devices/model";
import { SortingState } from "@tanstack/react-table";

// API call to register a new user
export const registerUser = async (userData: Partial<User>): Promise<User> => {
	const response = await axios.post("/users", userData);
	return response.data.data;
};

export const fetchUsers = async ({ page, pageSize, search, sorting }: { page: number; pageSize: number; search?: string; sorting?: SortingState }) => {
	const response = await axios.get("/users", {
		params: {
			page,
			pageSize,
			search,
			sorting: sorting?.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(","),
		},
	});
	return response.data;
};

// API call to fetch a single user by ID
export const fetchUserById = async (id: number): Promise<User> => {
	const response = await axios.get(`/users/${id}`);
	return response.data.data;
};

// API call to update a user
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
	const response = await axios.put(`/users/${id}`, userData);
	return response.data.data;
};

// API call to delete a user
export const deleteUser = async (id: number): Promise<void> => {
	const response = await axios.delete(`/users/${id}`);
	return response.data.data;
};

// Update the last visited device ID for the user
export const updateLastVisitedDevice = async (deviceId: string): Promise<void> => {
	await axios.put("/user/last-visited-device", { device_id: deviceId });
};

// Get the last visited device ID
export const getLastVisitedDevice = async (): Promise<Device> => {
	const response = await axios.get("/user/last-visited-device");
	return response.data;
};

// Toggle the display of the last visited device
export const toggleDisplayLastVisitedDevice = async (enabled: boolean): Promise<void> => {
	await axios.put("/user/toggle-display-last-visited-device", {
		displayLastVisitedDevice: enabled,
	});
};

// Get the setting for displaying the last visited device
export const getDisplayLastVisitedDevice = async (): Promise<{ display_last_visited_device: boolean }> => {
	const response = await axios.get("/user/display-last-visited-device");
	return response.data;
};

// Reset user's password
export const resetUserPassword = async (userId: number, password: string, password_confirmation: string): Promise<void> => {
	await axios.post(`/users/${userId}/reset-password`, { password, password_confirmation });
};
