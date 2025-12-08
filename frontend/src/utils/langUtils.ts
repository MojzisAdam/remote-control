import i18n from "i18next";

export const isCzech = (language?: string): boolean => {
	const lang = (language || i18n.language)?.toLowerCase();
	return lang === "cs" || lang.startsWith("cs-");
};

export const isEnglish = (language?: string): boolean => {
	const lang = (language || i18n.language)?.toLowerCase();
	return lang === "en" || lang.startsWith("en-");
};
