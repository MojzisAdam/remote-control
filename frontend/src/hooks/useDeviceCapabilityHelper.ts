import { useMemo } from "react";
import { useDeviceCapabilities } from "@/provider/DeviceCapabilitiesProvider";
import { Device } from "@/api/devices/model";

export const useDeviceCapabilityHelper = () => {
	const { getCapabilitiesForDeviceId, capabilities, getCapabilitiesForRole, devices } = useDeviceCapabilities();

	// Filter devices by specific capability
	const filterDevicesByCapability = useMemo(() => {
		return (capabilityKey: string) => {
			return devices.filter((device) => {
				if (!device.device_type_id) return false;
				const caps = capabilities[device.device_type_id]?.capabilities || [];
				return caps.some((cap) => cap.key === capabilityKey || cap.key.includes(capabilityKey));
			});
		};
	}, [devices, capabilities]);

	// Get available field options for a device based on role
	const getFieldOptionsForDevice = useMemo(() => {
		return (deviceId: string, role?: "trigger" | "condition" | "action") => {
			// Find the device to get its type
			const device = devices.find((d) => d.id === deviceId);

			if (!device) {
				return [];
			}

			// Use getCapabilitiesForRole directly with the device type ID
			const caps = getCapabilitiesForRole(device.device_type_id || "", role || "action");

			const result = caps.map((cap) => ({
				value: cap.key,
				label:
					cap.label ||
					cap.key
						.split("_")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" "),
				type: cap.type,
				unit: cap.unit,
				min_value: cap.min,
				max_value: cap.max,
				increment_value: 1, // Default increment
				values: cap.options ? cap.options.map((opt, index) => ({ label: cap.labels?.[opt] || opt, value: opt })) : undefined,
				labels: cap.labels,
			}));

			return result;
		};
	}, [devices, getCapabilitiesForRole]);

	// Get operator options based on field type
	const getOperatorOptionsForField = useMemo(() => {
		return (deviceId: string, fieldName: string) => {
			const caps = getCapabilitiesForDeviceId(deviceId);
			const capability = caps.find((cap) => cap.fields?.includes(fieldName));

			if (!capability) {
				return [
					{ value: "=", label: "Equals" },
					{ value: "!=", label: "Not Equals" },
				];
			}

			switch (capability.type) {
				case "number":
					return [
						{ value: "<", label: "Less Than" },
						{ value: "<=", label: "Less Than or Equal" },
						{ value: "=", label: "Equals" },
						{ value: ">=", label: "Greater Than or Equal" },
						{ value: ">", label: "Greater Than" },
						{ value: "!=", label: "Not Equals" },
					];
				case "boolean":
					return [
						{ value: "=", label: "Is" },
						{ value: "!=", label: "Is Not" },
					];
				case "enum":
					return [
						{ value: "=", label: "Is" },
						{ value: "!=", label: "Is Not" },
					];
				default:
					return [
						{ value: "=", label: "Equals" },
						{ value: "!=", label: "Not Equals" },
					];
			}
		};
	}, [getCapabilitiesForDeviceId]);

	// Check if device supports action
	const deviceSupportsAction = useMemo(() => {
		return (deviceId: string, actionType: string) => {
			const caps = getCapabilitiesForDeviceId(deviceId);

			// Map action types to required capabilities
			const actionCapabilityMap: Record<string, string[]> = {
				turn_on: ["power", "control", "on_off"],
				turn_off: ["power", "control", "on_off"],
				toggle: ["power", "control", "on_off"],
				set_temperature: ["temperature", "heating", "cooling"],
				set_value: [], // Generic, always available
			};

			const requiredCaps = actionCapabilityMap[actionType] || [];
			if (requiredCaps.length === 0) return true; // No specific requirement

			return requiredCaps.some((req) => caps.some((cap) => cap.key.toLowerCase().includes(req.toLowerCase())));
		};
	}, [getCapabilitiesForDeviceId]);

	// Get control type options for device
	const getControlOptionsForDevice = useMemo(() => {
		return (deviceId: string) => {
			const caps = getCapabilitiesForDeviceId(deviceId);
			const options: Array<{ value: string; label: string; disabled?: boolean }> = [];

			// Always available
			options.push({ value: "set_value", label: "Set Value" });
			options.push({ value: "custom", label: "Custom Control" });

			// Conditional based on capabilities
			const hasPower = caps.some((c) => c.key.toLowerCase().includes("power") || c.key.toLowerCase().includes("control"));
			const hasTemperature = caps.some((c) => c.key.toLowerCase().includes("temperature"));

			if (hasPower || caps.length === 0) {
				options.unshift(
					{ value: "turn_on", label: "Turn On", disabled: !hasPower },
					{ value: "turn_off", label: "Turn Off", disabled: !hasPower },
					{ value: "toggle", label: "Toggle", disabled: !hasPower }
				);
			}

			if (hasTemperature || caps.length === 0) {
				options.push({ value: "set_temperature", label: "Set Temperature", disabled: !hasTemperature });
			}

			return options;
		};
	}, [getCapabilitiesForDeviceId]);

	// Get capabilities for a given role by deviceId
	const getCapabilitiesForDeviceRole = useMemo(() => {
		return (deviceId: string, role: "trigger" | "condition" | "action") => {
			const device = devices.find((d) => d.id === deviceId);
			if (!device?.device_type_id) return [];

			return getCapabilitiesForRole(device.device_type_id, role).map((cap) => ({
				value: cap.key,
				label: cap.label,
				unit: cap.unit,
				type: cap.type,
				min_value: cap.min,
				max_value: cap.max,
				options: cap.options,
			}));
		};
	}, [devices, getCapabilitiesForRole]);

	return {
		filterDevicesByCapability,
		getFieldOptionsForDevice,
		getOperatorOptionsForField,
		deviceSupportsAction,
		getControlOptionsForDevice,
		getCapabilitiesForDeviceRole,
	};
};
