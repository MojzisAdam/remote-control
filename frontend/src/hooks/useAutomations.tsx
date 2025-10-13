import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	getAutomations,
	getAutomation,
	createAutomation,
	updateAutomation,
	deleteAutomation,
	toggleAutomation,
	getAutomationLogs,
	getAutomationStats,
	getAutomationLogsStats,
} from "@/api/automation/actions";
import { ApiHandlerResult, handleApiRequest } from "@/utils/apiHandler";
import { Automation, CreateAutomationRequest, UpdateAutomationRequest, AutomationListResponse, AutomationLogsResponse } from "@/api/automation/model";

export const useAutomations = () => {
	const { t } = useTranslation("automations");
	const [loading, setLoading] = useState(false);
	const [automations, setAutomations] = useState<Automation[]>([]);
	const [currentAutomation, setCurrentAutomation] = useState<Automation | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		current_page: 1,
		last_page: 1,
		per_page: 15,
		total: 0,
		from: 0,
		to: 0,
	});
	const [stats, setStats] = useState({
		total: 0,
		enabled: 0,
		disabled: 0,
		withErrors: 0,
	});
	const [statsLoading, setStatsLoading] = useState(false);
	const [toggleLoading, setToggleLoading] = useState<Record<number, boolean>>({});

	// Clear error state
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Fetch all automations with optional filters
	const fetchAutomations = useCallback(
		async (params?: { enabled?: boolean; page?: number; per_page?: number; search?: string }): Promise<ApiHandlerResult> => {
			setLoading(true);
			clearError();

			const result = await handleApiRequest({
				apiCall: () => getAutomations(params),
				successMessage: t("hookMessages.automationsFetched"),
				statusHandlers: {
					404: () => setError(t("hookMessages.noAutomationsFound")),
					403: () => setError(t("hookMessages.notAuthorizedToViewAutomations")),
				},
			});
			if (result.success && result.data) {
				const response = result.data as AutomationListResponse;
				setAutomations(response.data || []);
				setPagination({
					current_page: response.current_page,
					last_page: response.last_page,
					per_page: response.per_page,
					total: response.total,
					from: response.from || 0,
					to: response.to || 0,
				});
			}

			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Fetch automation statistics separately
	const fetchAutomationStats = useCallback(async (params?: { search?: string }): Promise<ApiHandlerResult> => {
		setStatsLoading(true);

		const result = await handleApiRequest({
			apiCall: () => getAutomationStats(params),
			successMessage: t("hookMessages.automationStatsFetched"),
			statusHandlers: {
				403: () => setError(t("hookMessages.notAuthorizedToViewStats")),
			},
		});

		if (result.success && result.data) {
			setStats(result.data);
		}

		setStatsLoading(false);
		return result;
	}, []);

	// Fetch a single automation by ID
	const fetchAutomation = useCallback(
		async (id: number): Promise<ApiHandlerResult> => {
			setLoading(true);
			clearError();

			const result = await handleApiRequest({
				apiCall: () => getAutomation(id),
				successMessage: t("hookMessages.automationFetched"),
				statusHandlers: {
					404: () => setError(t("hookMessages.automationNotFound")),
					403: () => setError(t("hookMessages.notAuthorizedToView")),
				},
			});
			if (result.success && result.data) {
				setCurrentAutomation(result.data.data as Automation);
			}

			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Create a new automation
	const createNewAutomation = async (data: CreateAutomationRequest): Promise<ApiHandlerResult> => {
		setLoading(true);
		clearError();

		// Note: Validation is now handled by validateFlow in useAutomationFlow before calling this function
		const result = await handleApiRequest({
			apiCall: () => createAutomation(data),
			successMessage: t("hookMessages.automationCreated"),
			statusHandlers: {
				422: () => setError(t("hookMessages.validationFailed")),
				403: () => setError(t("hookMessages.noAccessToDevices")),
			},
		});

		if (result.success) {
			// Refresh the automations list
			await fetchAutomations();
		}

		setLoading(false);
		return result;
	};

	// Update an existing automation
	const updateExistingAutomation = async (id: number, data: UpdateAutomationRequest): Promise<ApiHandlerResult> => {
		setLoading(true);
		clearError();

		const result = await handleApiRequest({
			apiCall: () => updateAutomation(id, data),
			successMessage: t("hookMessages.automationUpdated"),
			statusHandlers: {
				404: () => setError(t("hookMessages.automationNotFound")),
				403: () => setError(t("hookMessages.notAuthorizedToUpdate")),
				422: () => setError(t("hookMessages.validationFailed")),
			},
		});

		if (result.success) {
			// Update the current automation if it's the one being edited
			if (currentAutomation?.id === id) {
				setCurrentAutomation(result.data as Automation);
			}
			// Refresh the automations list
			await fetchAutomations();
		}

		setLoading(false);
		return result;
	};

	// Delete an automation
	const deleteExistingAutomation = async (id: number): Promise<ApiHandlerResult> => {
		setLoading(true);
		clearError();

		const result = await handleApiRequest({
			apiCall: () => deleteAutomation(id),
			successMessage: t("hookMessages.automationDeleted"),
			statusHandlers: {
				404: () => setError(t("hookMessages.automationNotFound")),
				403: () => setError(t("hookMessages.notAuthorizedToDelete")),
			},
		});

		if (result.success) {
			setAutomations((prev) => prev.filter((automation) => automation.id !== id));

			// Clear current automation if it was deleted
			if (currentAutomation?.id === id) {
				setCurrentAutomation(null);
			}
		}

		setLoading(false);
		return result;
	};

	// Toggle automation enabled/disabled status
	const toggleAutomationStatus = async (id: number): Promise<ApiHandlerResult> => {
		setToggleLoading((prev) => ({ ...prev, [id]: true }));
		clearError();

		const result = await handleApiRequest({
			apiCall: () => toggleAutomation(id),
			successMessage: t("hookMessages.automationStatusUpdated"),
			statusHandlers: {
				404: () => setError(t("hookMessages.automationNotFound")),
				403: () => setError(t("hookMessages.notAuthorizedToModify")),
			},
		});

		if (result.success) {
			const updatedEnabled = result.data?.enabled;

			setAutomations((prev) => prev.map((automation) => (automation.id === id ? { ...automation, enabled: updatedEnabled } : automation)));

			if (currentAutomation?.id === id) {
				setCurrentAutomation((prev) => (prev ? { ...prev, enabled: updatedEnabled } : null));
			}

			// Update stats to reflect the change
			setStats((prevStats) => {
				const newStats = { ...prevStats };
				if (updatedEnabled) {
					newStats.enabled += 1;
					newStats.disabled -= 1;
				} else {
					newStats.enabled -= 1;
					newStats.disabled += 1;
				}
				return newStats;
			});
		}

		setToggleLoading((prev) => ({ ...prev, [id]: false }));
		return result;
	};

	// Get automation execution logs
	const fetchAutomationLogs = async (
		id: number,
		params?: {
			status?: "success" | "failed" | "skipped" | "partial" | "warning" | "all";
			page?: number;
			per_page?: number;
			search?: string;
		}
	): Promise<ApiHandlerResult> => {
		setLoading(true);
		clearError();

		const result = await handleApiRequest({
			apiCall: () => getAutomationLogs(id, params),
			successMessage: t("hookMessages.automationLogsFetched"),
			statusHandlers: {
				404: () => setError(t("hookMessages.automationNotFound")),
				403: () => setError(t("hookMessages.notAuthorizedToViewLogs")),
			},
		});

		setLoading(false);
		return result;
	};

	// Get automation logs statistics
	const fetchAutomationLogsStats = async (
		id: number,
		params?: {
			status?: "success" | "failed" | "skipped" | "partial" | "warning" | "all";
			search?: string;
		}
	): Promise<ApiHandlerResult> => {
		const result = await handleApiRequest({
			apiCall: () => getAutomationLogsStats(id, params),
			successMessage: t("hookMessages.automationLogsStatsFetched"),
			statusHandlers: {
				404: () => setError(t("hookMessages.automationNotFound")),
				403: () => setError(t("hookMessages.notAuthorizedToViewLogsStats")),
			},
		});

		return result;
	};

	// Helper function to get automation by ID from current list
	const getAutomationById = useCallback(
		(id: number): Automation | undefined => {
			return automations.find((automation) => automation.id === id);
		},
		[automations]
	);

	// Helper function to check if automation is enabled
	const isAutomationEnabled = useCallback(
		(id: number): boolean => {
			const automation = getAutomationById(id);
			return automation?.enabled ?? false;
		},
		[getAutomationById]
	);

	return {
		// State
		loading,
		automations,
		currentAutomation,
		error,
		pagination,
		stats,
		statsLoading,
		toggleLoading,

		// Actions
		fetchAutomations,
		fetchAutomation,
		fetchAutomationStats,
		createNewAutomation,
		updateExistingAutomation,
		deleteExistingAutomation,
		toggleAutomationStatus,
		fetchAutomationLogs,
		fetchAutomationLogsStats,

		// Helpers
		clearError,
		getAutomationById,
		isAutomationEnabled,

		// Setters
		setCurrentAutomation,
		setAutomations,
	};
};

export default useAutomations;
