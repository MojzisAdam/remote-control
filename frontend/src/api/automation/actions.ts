import { Automation, CreateAutomationRequest, UpdateAutomationRequest, AutomationListResponse, AutomationLogsResponse } from "./model";
import axios from "@/lib/api/axios";

// Get all automations for the authenticated user
export const getAutomations = async (params?: { enabled?: boolean; page?: number; per_page?: number; search?: string }): Promise<AutomationListResponse> => {
	const response = await axios.get("/automations", { params });
	return response.data;
};

// Get automation statistics
export const getAutomationStats = async (params?: { search?: string }): Promise<{ total: number; enabled: number; disabled: number; withErrors: number }> => {
	const response = await axios.get("/automations/stats", { params });
	return response.data;
};

// Get a specific automation by ID
export const getAutomation = async (id: number): Promise<Automation> => {
	const response = await axios.get(`/automations/${id}`);
	return response.data;
};

// Create a new automation
export const createAutomation = async (data: CreateAutomationRequest): Promise<Automation> => {
	const response = await axios.post("/automations", data);
	return response.data;
};

// Update an existing automation
export const updateAutomation = async (id: number, data: UpdateAutomationRequest): Promise<Automation> => {
	const response = await axios.put(`/automations/${id}`, data);
	return response.data;
};

// Delete an automation
export const deleteAutomation = async (id: number): Promise<void> => {
	await axios.delete(`/automations/${id}`);
};

// Toggle automation enabled/disabled status
export const toggleAutomation = async (id: number): Promise<{ message: string; enabled: boolean }> => {
	const response = await axios.put(`/automations/${id}/toggle`);
	return response.data;
};

// Get automation execution logs
export const getAutomationLogs = async (
	id: number,
	params?: {
		status?: "success" | "failed" | "skipped" | "partial" | "warning" | "all";
		page?: number;
		per_page?: number;
		search?: string;
	}
): Promise<AutomationLogsResponse> => {
	const response = await axios.get(`/automations/${id}/logs`, { params });
	return response.data;
};

// Get automation logs statistics
export const getAutomationLogsStats = async (
	id: number,
	params?: {
		status?: "success" | "failed" | "skipped" | "partial" | "warning" | "all";
		search?: string;
	}
): Promise<{
	total_stats: {
		total: number;
		successful: number;
		failed: number;
		skipped: number;
		partial: number;
		warning: number;
	};
	filtered_stats: {
		total: number;
		successful: number;
		failed: number;
		skipped: number;
		partial: number;
		warning: number;
	};
}> => {
	const response = await axios.get(`/automations/${id}/logs/stats`, { params });
	return response.data;
};
