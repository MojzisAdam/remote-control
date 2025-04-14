export interface DeviceHistory {
	deviceId: string;
	cas: string;

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
	avg_ts1: number;
	avg_ts2: number;
	avg_ts4: number;
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
