import i18n from "i18next";
import { User } from "@/api/user/model";
import { updatePreferredLanguage as apiUpdatePreferredLanguage } from "@/api/user/actions";
import { handleApiRequest } from "@/utils/apiHandler";

export const isCzech = (language?: string): boolean => {
	const lang = (language || i18n.language)?.toLowerCase();
	return lang === "cs" || lang.startsWith("cs-");
};

export const isEnglish = (language?: string): boolean => {
	const lang = (language || i18n.language)?.toLowerCase();
	return lang === "en" || lang.startsWith("en-");
};

export const syncLang = async (user: User | null): Promise<void> => {
	if (user) {
		const dbLanguage = user.preferred_language;
		const localLanguage = localStorage.getItem("i18nextLng") || "cs";

		if (dbLanguage) {
			if (i18n.language !== dbLanguage) {
				i18n.changeLanguage(dbLanguage);
			}
		} else {
			handleApiRequest({
				apiCall: async () => await apiUpdatePreferredLanguage(localLanguage),
				successMessage: "Preferred Languague successfully set.",
			});
		}
	}
};
