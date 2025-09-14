import { createContext, useContext, useEffect, useState } from "react";

export type AccentColor = "default" | "blue" | "green" | "purple" | "red";

interface AccentColorContextType {
	accentColor: AccentColor;
	setAccentColor: (color: AccentColor) => void;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

export function useAccentColor() {
	const context = useContext(AccentColorContext);
	if (context === undefined) {
		throw new Error("useAccentColor must be used within an AccentColorProvider");
	}
	return context;
}

// Storage key for accent color
const ACCENT_COLOR_STORAGE_KEY = "app-accent-color";

// Hook to manage accent color state and localStorage
export function useAccentColorState(): AccentColorContextType {
	const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
		try {
			const stored = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
			return (stored as AccentColor) || "default";
		} catch {
			return "default";
		}
	});

	const setAccentColor = (color: AccentColor) => {
		setAccentColorState(color);
		localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, color);

		// Apply accent color class to document
		applyAccentColor(color);
	};

	useEffect(() => {
		// Apply initial accent color
		applyAccentColor(accentColor);
	}, [accentColor]);

	return { accentColor, setAccentColor };
}

// Function to apply accent color class to document
function applyAccentColor(color: AccentColor) {
	const root = document.documentElement;

	// Remove all accent color classes
	root.classList.remove("accent-blue", "accent-green", "accent-purple", "accent-red");

	// Add the new accent color class (skip for 'default')
	if (color !== "default") {
		root.classList.add(`accent-${color}`);
	}
}

export { AccentColorContext };
