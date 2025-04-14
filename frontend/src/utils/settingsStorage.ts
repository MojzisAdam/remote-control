export interface AppSettings {
	showFavoriteDevices: boolean;
	defaultDashboardView: "grid" | "list";
}

// Default settings
export const defaultSettings: AppSettings = {
	showFavoriteDevices: true,
	defaultDashboardView: "grid",
};

// Storage key
const SETTINGS_STORAGE_KEY = "app_settings";

/**
 * Get all settings from local storage
 */
export const getSettings = (): AppSettings => {
	try {
		const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
		if (storedSettings) {
			return { ...defaultSettings, ...JSON.parse(storedSettings) };
		}
	} catch (error) {
		console.error("Failed to parse settings from localStorage:", error);
	}

	return defaultSettings;
};

/**
 * Get a specific setting value
 */
export const getSetting = <K extends keyof AppSettings>(key: K): AppSettings[K] => {
	const settings = getSettings();
	return settings[key];
};

/**
 * Update settings (partial or complete)
 */
export const updateSettings = (newSettings: Partial<AppSettings>): AppSettings => {
	try {
		const currentSettings = getSettings();
		const updatedSettings = { ...currentSettings, ...newSettings };

		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
		return updatedSettings;
	} catch (error) {
		console.error("Failed to update settings in localStorage:", error);
		return getSettings();
	}
};

/**
 * Update a single setting
 */
export const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings => {
	return updateSettings({ [key]: value } as Partial<AppSettings>);
};

/**
 * Reset settings to default
 */
export const resetSettings = (): AppSettings => {
	try {
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
		return defaultSettings;
	} catch (error) {
		console.error("Failed to reset settings in localStorage:", error);
		return getSettings();
	}
};
