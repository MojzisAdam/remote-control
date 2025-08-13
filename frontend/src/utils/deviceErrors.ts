import i18next from "i18next";
import { DeviceType } from "./deviceTypeUtils";

// Abstract base class for device error handling
abstract class BaseDeviceErrors {
	abstract getErrorMessage(errorCode: number, firmwareVersion?: number): string;
	abstract getErrorDescription(errorCode: number, firmwareVersion?: number): string;
	abstract getDisplayErrorCode(errorCode: number): string | number;
}

// Daitsu device error handler
class DaitsuErrors extends BaseDeviceErrors {
	private errorCodeMap: Record<number, string> = {
		0: "0",
		1: "E0",
		2: "E1",
		3: "E2",
		4: "E3",
		5: "E4",
		6: "E5",
		7: "E6",
		8: "E7",
		9: "E8",
		10: "E9",
		11: "EA",
		12: "Eb",
		13: "Ec",
		14: "Vyd",
		15: "EE",
		20: "P0",
		21: "P1",
		23: "P3",
		24: "P4",
		25: "P5",
		26: "P6",
		31: "Pb",
		33: "Pd",
		38: "PP",
		39: "H0",
		40: "H1",
		41: "H2",
		42: "H3",
		43: "H4",
		44: "H5",
		45: "H6",
		46: "H7",
		47: "H8",
		48: "H9",
		49: "HA",
		50: "Hb",
		52: "Hd",
		53: "HE",
		54: "HF",
		55: "HH",
		57: "HP",
		65: "C7",
		112: "bH",
		116: "F1",
		134: "L0",
		135: "L1",
		136: "L2",
		138: "L4",
		139: "L5",
		141: "L7",
		142: "L8",
		143: "L9",
	};

	getDisplayErrorCode(errorCode: number): string {
		return this.errorCodeMap[errorCode] || `E${errorCode}`;
	}

	getErrorMessage(errorCode: number): string {
		if (errorCode === 0) {
			return i18next.t("errors.0", { ns: "daitsuErrors" });
		}

		const errorKey = errorCode.toString();
		const directKey = `errors.${errorKey}`;

		if (i18next.exists(directKey, { ns: "daitsuErrors" })) {
			return i18next.t(directKey, { ns: "daitsuErrors" });
		}

		return i18next.t("errors.unknown", { ns: "daitsuErrors" }) || "Unknown error.";
	}

	getErrorDescription(): string {
		// Daitsu errors don't have descriptions
		return "";
	}
}

// CIM device error handler (RPI, AMIT)
class CimErrors extends BaseDeviceErrors {
	getDisplayErrorCode(errorCode: number): number {
		return errorCode;
	}

	getErrorMessage(errorCode: number, firmwareVersion = 813): string {
		if (errorCode === 0) {
			return i18next.t("errors.0", { ns: "cimErrors" });
		}

		const errorKey = errorCode.toString();

		// Handle firmware version specific errors
		if ([15, 16, 17, 18, 19, 24, 25, 26, 27, 28, 29, 35, 36, 37, 38, 39, 40, 41, 42, 43].includes(errorCode)) {
			const versionKey = firmwareVersion >= 1500 ? "1500" : "default";
			const translationKey = `errors.${errorKey}.${versionKey}`;

			if (i18next.exists(translationKey, { ns: "cimErrors" })) {
				return i18next.t(translationKey, { ns: "cimErrors" });
			}
		}

		// Handle direct key lookup
		const directKey = `errors.${errorKey}`;
		if (i18next.exists(directKey, { ns: "cimErrors" })) {
			return i18next.t(directKey, { ns: "cimErrors" });
		}

		return i18next.t("errors.unknown", { ns: "cimErrors" });
	}

	getErrorDescription(errorCode: number, firmwareVersion = 813): string {
		if (errorCode === 0) {
			return "";
		}

		const errorKey = errorCode.toString();
		const descriptionKey = `errorDescriptions.${errorKey}`;

		// Check for specific error descriptions
		if (i18next.exists(descriptionKey, { ns: "cimErrors" })) {
			return i18next.t(descriptionKey, { ns: "cimErrors" });
		}

		// Firmware version specific service contact messages
		if (firmwareVersion >= 1500) {
			if ((errorCode >= 15 && errorCode <= 22) || (errorCode >= 24 && errorCode <= 32) || (errorCode >= 35 && errorCode <= 46)) {
				return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
			}
		} else {
			if ((errorCode >= 15 && errorCode <= 19) || errorCode === 24 || (errorCode >= 25 && errorCode <= 29) || (errorCode >= 35 && errorCode <= 43)) {
				return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
			}
		}

		// Other error codes that require service contact
		if (errorCode === 6 || errorCode === 8 || errorCode === 9 || errorCode === 10 || errorCode === 14) {
			return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
		}

		if ((errorCode >= 50 && errorCode <= 63) || (errorCode >= 65 && errorCode <= 74) || errorCode === 79) {
			return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
		}

		return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
	}
}

// Main device errors handler
export class DeviceErrors {
	private daitsuHandler = new DaitsuErrors();
	private cimHandler = new CimErrors();

	private getHandler(deviceType: string): BaseDeviceErrors {
		return deviceType === DeviceType.DAITSU ? this.daitsuHandler : this.cimHandler;
	}

	error(errorCode: number, firmwareVersion = 813, deviceType: string = DeviceType.RPI): string {
		if (typeof errorCode !== "number") {
			return "";
		}

		const handler = this.getHandler(deviceType);
		return handler.getErrorMessage(errorCode, firmwareVersion);
	}

	errorDescribe(errorCode: number, firmwareVersion = 813, deviceType: string = DeviceType.RPI): string {
		if (typeof errorCode !== "number") {
			return "";
		}

		const handler = this.getHandler(deviceType);
		return handler.getErrorDescription(errorCode, firmwareVersion);
	}

	getDaitsuErrorCode(errorCode: number): string {
		return this.daitsuHandler.getDisplayErrorCode(errorCode);
	}

	getDisplayErrorCode(errorCode: number, deviceType: string): string | number {
		const handler = this.getHandler(deviceType);
		return handler.getDisplayErrorCode(errorCode);
	}
}

const deviceErrorsInstance = new DeviceErrors();
export default deviceErrorsInstance;
