import { Device } from "@/api/devices/model";

export enum DeviceType {
	RPI = "1",
	AMIT = "2",
	DAITSU = "3",
}

export const isStandardDevice = (device: Device): boolean => {
	return device.display_type === DeviceType.RPI || device.display_type === DeviceType.AMIT;
};

export const isDaitsuDevice = (device: Device): boolean => {
	return device.display_type === DeviceType.DAITSU;
};

export const getDeviceTypeName = (deviceOrType: Device | string | number): string => {
	let deviceType: string;

	if (typeof deviceOrType === "object" && deviceOrType !== null) {
		deviceType = deviceOrType.display_type;
	} else {
		deviceType = String(deviceOrType);
	}

	switch (deviceType) {
		case DeviceType.RPI:
			return "RPI";
		case DeviceType.AMIT:
			return "AMIT";
		case DeviceType.DAITSU:
			return "Daitsu";
		default:
			return "Unknown";
	}
};

export const getErrorField = (device: Device): string => {
	return isDaitsuDevice(device) ? "reg_124" : "chyba";
};
