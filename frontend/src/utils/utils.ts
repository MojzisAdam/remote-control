import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import i18n from "i18next";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string): string {
	const selectedLocale = i18n.language === "en" ? enUS : cs;
	const date = new Date(isoString);
	return format(date, "dd/MM/yyyy HH:mm", { locale: selectedLocale });
}
