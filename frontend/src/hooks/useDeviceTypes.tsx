import { useState, useCallback } from "react";
import { listDeviceTypes, getDeviceType, createDeviceType, updateDeviceType, deleteDeviceType, getDevicesByType, getDeviceCapabilities } from "@/api/devices/actions";
import { ApiHandlerResult, handleApiRequest } from "@/utils/apiHandler";
import { DeviceType, Device } from "@/api/devices/model";

type UpdateDeviceTypePayload = {
	name?: string;
	description?: string;
	capabilities?: string[] | Record<string, any>;
};

export const useDeviceTypes = () => {
	const [loading, setLoading] = useState(false);
	const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
	const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType | null>(null);
	const [devicesByType, setDevicesByType] = useState<Device[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Clear error helper
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Fetch all device types
	const fetchDeviceTypes = useCallback(
		async (search?: string): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => listDeviceTypes(search),
				successMessage: "Device types fetched successfully",
				statusHandlers: {
					404: () => setError("Device types not found."),
				},
			});
			if (result.success) {
				setDeviceTypes(result.data || []);
			}
			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Get a specific device type
	const fetchDeviceType = useCallback(
		async (id: string): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => getDeviceType(id),
				successMessage: "Device type fetched successfully",
				statusHandlers: {
					404: () => setError("Device type not found."),
				},
			});
			if (result.success) {
				setCurrentDeviceType(result.data);
			}
			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Create a new device type
	const createNewDeviceType = useCallback(
		async (data: { id: string; name: string; description?: string; capabilities: string[] | Record<string, any> }): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => createDeviceType(data),
				successMessage: "Device type created successfully",
				statusHandlers: {
					403: () => setError("You don't have permission to create device types."),
					422: () => setError("Invalid data provided."),
				},
			});
			if (result.success) {
				// Refresh the device types list
				await fetchDeviceTypes();
			}
			setLoading(false);
			return result;
		},
		[clearError, fetchDeviceTypes]
	);

	// Update a device type
	const updateExistingDeviceType = useCallback(
		async (id: string, data: UpdateDeviceTypePayload): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => updateDeviceType(id, data),
				successMessage: "Device type updated successfully",
				statusHandlers: {
					403: () => setError("You don't have permission to update device types."),
					404: () => setError("Device type not found."),
					422: () => setError("Invalid data provided."),
				},
			});
			if (result.success) {
				// Update the current device type if it's the one being updated
				if (currentDeviceType?.id === id) {
					setCurrentDeviceType(result.data);
				}
				// Refresh the device types list
				await fetchDeviceTypes();
			}
			setLoading(false);
			return result;
		},
		[clearError, currentDeviceType?.id, fetchDeviceTypes]
	);

	// Delete a device type
	const removeDeviceType = useCallback(
		async (id: string): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => deleteDeviceType(id),
				successMessage: "Device type deleted successfully",
				statusHandlers: {
					403: () => setError("You don't have permission to delete device types."),
					404: () => setError("Device type not found."),
					422: () => setError("Cannot delete device type that is currently in use."),
				},
			});
			if (result.success) {
				// Remove from local state
				setDeviceTypes((prev) => prev.filter((dt) => dt.id !== id));
				// Clear current device type if it was deleted
				if (currentDeviceType?.id === id) {
					setCurrentDeviceType(null);
				}
			}
			setLoading(false);
			return result;
		},
		[clearError, currentDeviceType?.id]
	);

	// Get devices by type
	const fetchDevicesByType = useCallback(
		async (typeId: string): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => getDevicesByType(typeId),
				successMessage: "Devices fetched successfully",
				statusHandlers: {
					404: () => setError("Device type not found."),
				},
			});
			if (result.success) {
				setDevicesByType(result.data || []);
			}
			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Get device capabilities
	const fetchDeviceCapabilities = useCallback(
		async (deviceId: string): Promise<ApiHandlerResult> => {
			clearError();
			setLoading(true);
			const result = await handleApiRequest({
				apiCall: () => getDeviceCapabilities(deviceId),
				successMessage: "Device capabilities fetched successfully",
				statusHandlers: {
					404: () => setError("Device not found or no device type assigned."),
				},
			});
			setLoading(false);
			return result;
		},
		[clearError]
	);

	// Helper function to get capabilities for a device from cached device types
	const getCapabilitiesFromCache = useCallback(
		(deviceTypeId: string): string[] | Record<string, any> | null => {
			const deviceType = deviceTypes.find((dt) => dt.id === deviceTypeId);
			return deviceType?.capabilities || null;
		},
		[deviceTypes]
	);

	// Helper function to check if a device has a specific capability
	const hasCapability = useCallback(
		(device: Device | string, capability: string): boolean => {
			const deviceTypeId = typeof device === "string" ? device : device.device_type_id;
			if (!deviceTypeId) return false;

			const capabilities = getCapabilitiesFromCache(deviceTypeId);
			if (!capabilities) return false;

			if (Array.isArray(capabilities)) {
				return capabilities.includes(capability);
			} else if (typeof capabilities === "object") {
				return capability in capabilities;
			}

			return false;
		},
		[getCapabilitiesFromCache]
	);

	return {
		// State
		deviceTypes,
		currentDeviceType,
		devicesByType,
		loading,
		error,

		// Actions
		fetchDeviceTypes,
		fetchDeviceType,
		createNewDeviceType,
		updateExistingDeviceType,
		removeDeviceType,
		fetchDevicesByType,
		fetchDeviceCapabilities,

		// Helpers
		getCapabilitiesFromCache,
		hasCapability,
		clearError,

		// Setters
		setDeviceTypes,
		setCurrentDeviceType,
		setDevicesByType,
	};
};
