export const graphColumns = [
	{ value: "TS1", label: "TS1" },
	{ value: "TS2", label: "TS2" },
	{ value: "TS3", label: "TS3" },
	{ value: "TS4", label: "TS4" },
	{ value: "TS5", label: "TS5" },
	{ value: "TS6", label: "TS6" },
	{ value: "TS7", label: "TS7" },
	{ value: "TS8", label: "TS8" },
	{ value: "TS9", label: "TS9" },
	{ value: "PT", label: "PT" },
	{ value: "PTO", label: "PTO" },
	{ value: "PTUV", label: "PTUV" },
	{ value: "PPT", label: "PPT" },
	{ value: "PTO2", label: "PTO2" },
	{ value: "komp", label: "komp" },
	{ value: "kvyk", label: "kvyk" },
	{ value: "run", label: "run" },
	{ value: "reg", label: "reg" },
	{ value: "vjedn", label: "vjedn" },
	{ value: "dzto", label: "dzto" },
	{ value: "dztuv", label: "dztuv" },
	{ value: "tstat", label: "tstat" },
	{ value: "hdo", label: "hdo" },
	{ value: "obd", label: "obd" },
	{ value: "RPT", label: "RPT" },
	{ value: "Prtk", label: "Prtk" },
	{ value: "TpnVk", label: "TpnVk" },
	{ value: "chyba", label: "chyba" },
];

export type ChartConfigItem = {
	label: string;
	color: string;
	unit: string;
	valueMap?: { [key: string]: string };
};

export const chartConfig: { [key: string]: ChartConfigItem } = {
	TS1: {
		label: "TS1",
		color: "#0800ff",
		unit: "°C",
	},
	TS2: {
		label: "TS2",
		color: "#00d0ff",
		unit: "°C",
	},
	TS3: {
		label: "TS3",
		color: "#9500ff",
		unit: "°C",
	},
	TS4: {
		label: "TS4",
		color: "#6e4900",
		unit: "°C",
	},
	TS5: {
		label: "TS5",
		color: "#ff8000",
		unit: "°C",
	},
	TS6: {
		label: "TS6",
		color: "#1fa32c",
		unit: "°C",
	},
	TS7: {
		label: "TS7",
		color: "#e817ff",
		unit: "°C",
	},
	TS8: {
		label: "TS8",
		color: "#17ff49",
		unit: "°C",
	},
	TS9: {
		label: "TS9",
		color: "#ec6263",
		unit: "°C",
	},
	PT: {
		label: "PT",
		color: "#dbc77d",
		unit: "°C",
	},
	PTO: {
		label: "PTO",
		color: "#d4d4d4",
		unit: "°C",
	},
	PTUV: {
		label: "PTUV",
		color: "#996e00",
		unit: "°C",
	},
	PPT: {
		label: "PPT",
		color: "#deca14",
		unit: "°C",
	},
	PTO2: {
		label: "PTO2",
		color: "#15cfc2",
		unit: "°C",
	},
	komp: {
		label: "komp",
		color: "#4a8f00",
		unit: "",
		valueMap: {
			"0": "Off",
			"10": "On",
		},
	},
	kvyk: {
		label: "kvyk",
		color: "#ff0000",
		unit: "%",
	},
	run: {
		label: "run",
		color: "#9500ff",
		unit: "",
		valueMap: {
			"0": "Off",
			"6": "On",
		},
	},
	reg: {
		label: "reg",
		color: "#ffffff",
		unit: "",
		valueMap: {
			"0": "Off",
			"5": "TUV",
			"3": "TO",
			"9": "Cooling",
			"11": "Heating",
			"7": "Pool",
			"15": "TO+TUV",
			"13": "Cool.+TUV",
			"17": "Pool+TUV",
		},
	},
	vjedn: {
		label: "vjedn",
		color: "#6e4900",
		unit: "",
		valueMap: {
			"0": "Off",
			"2": "Heating",
			"4": "Defrosting",
			"6": "Cooling",
		},
	},
	dzto: {
		label: "dzto",
		color: "#00ffdd",
		unit: "",
		valueMap: {
			"0": "Off",
			"4": "dz level 1",
			"7": "dz level m",
			"9": "dz level 2",
			"11": "Additional",
		},
	},
	dztuv: {
		label: "dztuv",
		color: "#0022ff",
		unit: "",
		valueMap: {
			"0": "Off",
			"4": "dz level 1",
			"7": "dz level m",
			"9": "dz level 2",
			"11": "Additional",
		},
	},
	tstat: {
		label: "tstat",
		color: "#ff7700",
		unit: "",
		valueMap: {
			"0": "not blocked",
			"-2": "blocks",
		},
	},
	hdo: {
		label: "hdo",
		color: "#9000ff",
		unit: "",
		valueMap: {
			"0": "not blocked",
			"-3": "blocks",
		},
	},
	obd: {
		label: "obd",
		color: "#bfbfbf",
		unit: "",
		valueMap: {
			"3": "Winter",
			"-4": "Summer",
		},
	},
	RPT: {
		label: "RPT",
		color: "#ede90c",
		unit: "°C",
	},
	Prtk: {
		label: "Prtk",
		color: "#1493e3",
		unit: "m3/h",
	},
	TpnVk: {
		label: "TpnVk",
		color: "#a10000",
		unit: "kW",
	},
	chyba: {
		label: "chyba",
		color: "#ff0000",
		unit: "",
		valueMap: {
			"0": "No Error",
			"-6": "Error",
		},
	},
} as const;

export const chartColors = {
	light: {
		axisColor: "#292929",
		gridColor: "#858585",
	},
	dark: {
		axisColor: "#e0e0e0",
		gridColor: "#555555",
	},
} as const;
