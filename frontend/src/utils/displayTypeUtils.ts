import { Device } from "@/api/devices/model";

export enum DisplayType {
	RPI = "1",
	AMIT = "2",
	DAITSU = "3",
}

export const isStandardDisplay = (device: Device): boolean => {
	return device.display_type === DisplayType.RPI || device.display_type === DisplayType.AMIT;
};

export const isDaitsuDisplay = (device: Device): boolean => {
	return device.display_type === DisplayType.DAITSU;
};

export const getDisplayTypeName = (deviceOrType: Device | string | number): string => {
	let displayType: string;

	if (typeof deviceOrType === "object" && deviceOrType !== null) {
		displayType = deviceOrType.display_type;
	} else {
		displayType = String(deviceOrType);
	}

	switch (displayType) {
		case DisplayType.RPI:
			return "RPI";
		case DisplayType.AMIT:
			return "AMIT";
		case DisplayType.DAITSU:
			return "Daitsu";
		default:
			return "Unknown";
	}
};

export const getErrorField = (device: Device): string => {
	return isDaitsuDisplay(device) ? "reg_124" : "chyba";
};

export const getChartDisplayType = (device: Device): "standard" | "daitsu" => {
	return isDaitsuDisplay(device) ? "daitsu" : "standard";
};
