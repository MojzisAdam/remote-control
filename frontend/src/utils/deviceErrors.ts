import i18next from "i18next";

export class CimErrors {
	error(chyba: number, cim_fw = 813) {
		if (typeof chyba !== "number") {
			return "";
		}

		if (chyba === 0) {
			return i18next.t("errors.0", { ns: "cimErrors" });
		}

		const errorKey = chyba.toString();

		if ([15, 16, 17, 18, 19, 24, 25, 26, 27, 28, 29, 35, 36, 37, 38, 39, 40, 41, 42, 43].includes(chyba)) {
			const versionKey = cim_fw >= 1500 ? "1500" : "default";

			const translationKey = `errors.${errorKey}.${versionKey}`;
			if (i18next.exists(translationKey, { ns: "cimErrors" })) {
				return i18next.t(translationKey, { ns: "cimErrors" });
			}
		}

		const directKey = `errors.${errorKey}`;
		if (i18next.exists(directKey, { ns: "cimErrors" })) {
			return i18next.t(directKey, { ns: "cimErrors" });
		}

		return i18next.t("errors.unknown", { ns: "cimErrors" });
	}

	errorDescribe(chyba: number, cim_fw = 813) {
		if (typeof chyba !== "number") {
			return "";
		}

		if (chyba === 0) {
			return "";
		}

		const errorKey = chyba.toString();
		const descriptionKey = `errorDescriptions.${errorKey}`;

		if (i18next.exists(descriptionKey, { ns: "cimErrors" })) {
			return i18next.t(descriptionKey, { ns: "cimErrors" });
		}

		if (cim_fw >= 1500) {
			if ((chyba >= 15 && chyba <= 22) || (chyba >= 24 && chyba <= 32) || (chyba >= 35 && chyba <= 46)) {
				return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
			}
		} else {
			if ((chyba >= 15 && chyba <= 19) || chyba === 24 || (chyba >= 25 && chyba <= 29) || (chyba >= 35 && chyba <= 43)) {
				return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
			}
		}

		if (chyba === 6 || chyba === 8 || chyba === 9 || chyba === 10 || chyba === 14) {
			return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
		}

		if ((chyba >= 50 && chyba <= 63) || (chyba >= 65 && chyba <= 74) || chyba === 79) {
			return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
		}

		return i18next.t("errorDescriptions.serviceContact", { ns: "cimErrors" });
	}
}

const cimErrorsInstance = new CimErrors();
export default cimErrorsInstance;
