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

export function getBit(value: number, bitPosition: number): number {
	if (bitPosition < 0) {
		throw new Error("Bit position must be non-negative");
	}

	return (value >> bitPosition) & 1;
}

export function getBitRange(value: number, startBit: number, endBit: number): number {
	if (startBit < 0 || endBit < 0) {
		throw new Error("Bit positions must be non-negative");
	}

	if (startBit > endBit) {
		throw new Error("Start bit must be less than or equal to end bit");
	}

	const numBits = endBit - startBit + 1;
	const mask = (1 << numBits) - 1;

	return (value >> startBit) & mask;
}

export function getLowerByte(value: number): number {
	return value & 0xff;
}

export function getUpperByte(value: number): number {
	return (value >> 8) & 0xff;
}
