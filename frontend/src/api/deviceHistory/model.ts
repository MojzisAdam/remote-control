// Base interface for common fields
interface BaseDeviceHistory {
	deviceId: string;
	cas: string;
}

// Standard device history (types 1 & 2)
export interface StandardDeviceHistory extends BaseDeviceHistory {
	TS1?: number;
	TS2?: number;
	TS3?: number;
	TS4?: number;
	TS5?: number;
	TS6?: number;
	TS7?: number;
	TS8?: number;
	TS9?: number;

	PTO?: number;
	PTUV?: number;
	PTO2?: number;
	komp?: number;
	kvyk?: number;
	run?: number;
	reg?: number;
	vjedn?: number;
	dzto?: number;
	dztuv?: number;
	tstat?: number;
	hdo?: number;
	obd?: number;
	chyba?: number;
	PT?: number;
	PPT?: number;
	RPT?: number;
	Prtk?: number;
	TpnVk?: number;
}

// Daitsu device history (type 3)
export interface DaitsuDeviceHistory extends BaseDeviceHistory {
	T1s_z1?: number;
	T1s_z2?: number;
	reg_4?: number;
	reg_100?: number;
	reg_101?: number;
	reg_104?: number;
	reg_105?: number;
	reg_106?: number;
	reg_107?: number;
	reg_108?: number;
	reg_109?: number;
	reg_110?: number;
	reg_111?: number;
	reg_112?: number;
	reg_113?: number;
	reg_115?: number;
	reg_124?: number;
	reg_128_1?: number;
	reg_128_4?: number;
	reg_128_6?: number;
	reg_129_0?: number;
	reg_129_2?: number;
	reg_129_13?: number;
	reg_129_14?: number;
	reg_138?: number;
	reg_140?: number;
}

// Union type for all device history types
export type DeviceHistory = StandardDeviceHistory | DaitsuDeviceHistory;

// Type guards
export const isStandardDeviceHistory = (history: DeviceHistory): history is StandardDeviceHistory => {
	return "TS1" in history || "chyba" in history;
};

export const isDaitsuDeviceHistory = (history: DeviceHistory): history is DaitsuDeviceHistory => {
	return "T1s_z1" in history || "reg_124" in history;
};

export interface UserGraphPreference {
	deviceId: string;
	hiddenLines: string[];
}

export interface UserCustomGraph {
	id: number;
	deviceId: string;
	graphName: string;
	selectedMetrics: string[];
}

export interface MonthlyTemperatureData {
	year: number;
	month: number;
	month_name: string;
	[key: string]: number | string;
}

export interface MonthlyTemperatureResponse {
	data: MonthlyTemperatureData[];
	meta: {
		period: string;
		start_date: string;
		end_date: string;
		sensors: string[];
		device_id: string;
	};
}

export interface PaginatedDeviceHistoryResponse {
	data: DeviceHistory[];
	meta: {
		total: number;
		page: number;
		per_page: number;
	};
}
