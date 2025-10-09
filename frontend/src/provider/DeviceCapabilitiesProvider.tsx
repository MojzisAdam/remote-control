import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useDeviceTypes } from "@/hooks/useDeviceTypes";
import { DeviceType } from "@/api/devices/model";

// Normalized capability structure
export interface NormalizedCapability {
	key: string;
	label: string;
	type: "boolean" | "number" | "string" | "enum";
	unit?: string;
	min?: number;
	max?: number;
	options?: string[]; // For enum types
	fields?: string[];
	roles?: ("trigger" | "condition" | "action")[];
	description?: string;
	labels?: Record<string, string>; // for enum or boolean descriptive labels
}

export interface DeviceCapabilities {
	[deviceTypeId: string]: {
		deviceType: DeviceType;
		capabilities: NormalizedCapability[];
	};
}

interface DeviceCapabilitiesContextValue {
	capabilities: DeviceCapabilities;
	devices: any[];
	loading: boolean;
	error: string | null;
	getCapabilitiesForDevice: (deviceTypeId: string) => NormalizedCapability[];
	getCapabilitiesForDeviceId: (deviceId: string) => NormalizedCapability[];
	hasCapability: (deviceTypeId: string, capabilityKey: string) => boolean;
	getFieldsForCapability: (deviceTypeId: string, capabilityKey: string) => string[];
	refreshCapabilities: () => Promise<void>;
	getCapabilitiesForRole: (deviceTypeId: string, role: "trigger" | "condition" | "action") => NormalizedCapability[];
}

const DeviceCapabilitiesContext = createContext<DeviceCapabilitiesContextValue | undefined>(undefined);

// Normalize capabilities from various formats to a consistent structure
function normalizeCapabilities(rawCapabilities: string[] | Record<string, any>): NormalizedCapability[] {
	const normalized: NormalizedCapability[] = [];
	// Object with detailed capability definitions
	Object.entries(rawCapabilities).forEach(([key, value]) => {
		if (typeof value === "object" && value !== null) {
			normalized.push({
				key,
				label: value.label || value.description || formatCapabilityLabel(key),
				type: value.type || "boolean",
				unit: value.unit,
				min: value.min_value || value.min,
				max: value.max_value || value.max,
				options: value.values?.map((v: any) => (typeof v === "object" ? v.value : v)),
				fields: [key],
				roles: value.role || ["trigger", "condition", "action"],
				description: value.description,
				labels: value.labels || (value.values ? Object.fromEntries(value.values.map((v: any) => [v.value, v.label])) : undefined),
			});
		} else {
			normalized.push({
				key,
				label: formatCapabilityLabel(key),
				type: typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "string",
				fields: [key],
				roles: ["trigger", "condition", "action"],
			});
		}
	});

	return normalized;
}

// Format capability key to human-readable label
function formatCapabilityLabel(key: string): string {
	return key
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export const DeviceCapabilitiesProvider: React.FC<{
	children: React.ReactNode;
	devices?: any[];
}> = ({ children, devices = [] }) => {
	const [capabilities, setCapabilities] = useState<DeviceCapabilities>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { fetchDeviceTypes } = useDeviceTypes();

	const loadCapabilities = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await fetchDeviceTypes();

			if (result.success && result.data) {
				const deviceTypes = result.data as DeviceType[];
				const capabilitiesMap: DeviceCapabilities = {};

				deviceTypes.forEach((deviceType) => {
					capabilitiesMap[deviceType.id] = {
						deviceType,
						capabilities: normalizeCapabilities(deviceType.capabilities),
					};
				});
				setCapabilities(capabilitiesMap);
			} else {
				setError("Failed to load device capabilities");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error loading capabilities");
		} finally {
			setLoading(false);
		}
	}, [fetchDeviceTypes]);

	// Load capabilities on mount
	useEffect(() => {
		loadCapabilities();
	}, [loadCapabilities]);

	// Get capabilities for a specific device type
	const getCapabilitiesForDevice = useCallback(
		(deviceTypeId: string): NormalizedCapability[] => {
			return capabilities[deviceTypeId]?.capabilities || [];
		},
		[capabilities]
	);

	// Get capabilities for a device by device ID (looks up device type first)
	const getCapabilitiesForDeviceId = useCallback(
		(deviceId: string): NormalizedCapability[] => {
			const device = devices.find((d) => d.id === deviceId);
			if (!device?.device_type_id) return [];
			return getCapabilitiesForDevice(device.device_type_id);
		},
		[devices, getCapabilitiesForDevice]
	);

	// Check if device type has a specific capability
	const hasCapability = useCallback(
		(deviceTypeId: string, capabilityKey: string): boolean => {
			const caps = getCapabilitiesForDevice(deviceTypeId);
			return caps.some((cap) => cap.key === capabilityKey);
		},
		[getCapabilitiesForDevice]
	);

	// Get available fields for a capability
	const getFieldsForCapability = useCallback(
		(deviceTypeId: string, capabilityKey: string): string[] => {
			const caps = getCapabilitiesForDevice(deviceTypeId);
			const capability = caps.find((cap) => cap.key === capabilityKey);
			return capability?.fields || [];
		},
		[getCapabilitiesForDevice]
	);

	// Get capabilities valid for a specific role
	const getCapabilitiesForRole = useCallback(
		(deviceTypeId: string, role: "trigger" | "condition" | "action"): NormalizedCapability[] => {
			const caps = getCapabilitiesForDevice(deviceTypeId);

			return caps.filter((cap) => !cap.roles || cap.roles.includes(role));
		},
		[getCapabilitiesForDevice]
	);

	const value: DeviceCapabilitiesContextValue = {
		capabilities,
		devices,
		loading,
		error,
		getCapabilitiesForDevice,
		getCapabilitiesForDeviceId,
		hasCapability,
		getFieldsForCapability,
		refreshCapabilities: loadCapabilities,
		getCapabilitiesForRole,
	};

	return <DeviceCapabilitiesContext.Provider value={value}>{children}</DeviceCapabilitiesContext.Provider>;
};

// Hook to use device capabilities
export const useDeviceCapabilities = () => {
	const context = useContext(DeviceCapabilitiesContext);
	if (!context) {
		throw new Error("useDeviceCapabilities must be used within DeviceCapabilitiesProvider");
	}
	return context;
};
