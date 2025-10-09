import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import { setLanguageHeader } from "@/utils/axios";

i18next
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		interpolation: { escapeValue: false },
		fallbackLng: "cs",
		ns: ["global", "user", "dashboard", "cimErrors", "daitsuErrors"],
		defaultNS: "global",
		supportedLngs: ["cs", "en"],
		lowerCaseLng: true,
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},
		detection: {
			order: ["cookie", "localStorage", "navigator"],

			lookupCookie: "i18next",
			lookupLocalStorage: "i18nextLng",
			caches: ["localStorage", "cookie"],
			cookieMinutes: 99999999,
			cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN || "localhost",
			cookieOptions: { path: "/" },
		},
		debug: false,
	})
	.then(() => {
		const currentLanguage = i18next.language || "cs";
		setLanguageHeader(currentLanguage);
	});

i18next.on("languageChanged", (lang) => {
	// console.log(`Language changed to: ${lang}`);
	setLanguageHeader(lang);
});

export default i18next;
