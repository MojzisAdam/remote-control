import i18n from "i18next";
import { User } from "@/api/user/model";
import { updatePreferredLanguage as apiUpdatePreferredLanguage } from "@/api/user/actions";
import { handleApiRequest } from "@/lib/api/apiHandler";

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
