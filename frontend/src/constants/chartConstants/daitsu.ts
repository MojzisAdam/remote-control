interface ChartColumn {
	value: string;
	label: string;
	color: string;
	unit: string;
	valueMap?: Record<string, string>;
}

export const daitsuGraphColumns: ChartColumn[] = [
	{ value: "T1s_z1", label: "T1s z1", color: "#ffffff", unit: "°C" },
	{ value: "T1s_z2", label: "T1s z2", color: "#32a8a6", unit: "°C" },
	{ value: "reg_4", label: "T5s", color: "#6e4900", unit: "°C" },
	{ value: "reg_100", label: "komp", color: "#ff0000", unit: "Hz" },
	{ value: "reg_101", label: "vjedn", color: "#6e4900", unit: "", valueMap: { "0": "OFF", "3": "Cooling", "5": "Heating" } },
	{ value: "reg_104", label: "TW_in", color: "#9500ff", unit: "°C" },
	{ value: "reg_105", label: "TW_out", color: "#0800ff", unit: "°C" },
	{ value: "reg_106", label: "T3", color: "#dbc77d", unit: "°C" },
	{ value: "reg_107", label: "T4", color: "#00d0ff", unit: "°C" },
	{ value: "reg_108", label: "kom_dis", color: "#996e00", unit: "°C" },
	{ value: "reg_109", label: "kom_air", color: "#deca14", unit: "°C" },
	{ value: "reg_110", label: "T1", color: "#4a8f00", unit: "°C" },
	{ value: "reg_111", label: "T1B", color: "#ff8000", unit: "°C" },
	{ value: "reg_112", label: "T2", color: "#9500ff", unit: "°C" },
	{ value: "reg_113", label: "T2B", color: "#fcba03", unit: "°C" },
	{ value: "reg_115", label: "T5", color: "#ede90c", unit: "°C" },
	{ value: "reg_124", label: "chyba", color: "#a10000", unit: "", valueMap: { "0": "No Error", "-6": "Error" } },
	{ value: "reg_128_1", label: "remote", color: "#5f9ea0", unit: "", valueMap: { "0": "OFF", "4": "ON" } },
	{ value: "reg_128_4", label: "rtch", color: "#0022ff", unit: "", valueMap: { "0": "OFF", "3": "ON" } },
	{ value: "reg_128_6", label: "RPT", color: "#ff7700", unit: "", valueMap: { "0": "OFF", "2": "ON" } },
	{ value: "reg_129_0", label: "IBH1", color: "#1b6301", unit: "", valueMap: { "0": "OFF", "5": "ON" } },
	{ value: "reg_129_2", label: "TBH", color: "#ede90c", unit: "", valueMap: { "0": "OFF", "7": "ON" } },
	{ value: "reg_129_13", label: "RUN", color: "#1493e3", unit: "", valueMap: { "0": "OFF", "11": "ON" } },
	{ value: "reg_129_14", label: "ext_heat", color: "#e60000", unit: "", valueMap: { "0": "OFF", "9": "ON" } },
	{ value: "reg_138", label: "wt_flow", color: "#038cfc", unit: "m3/h" },
	{ value: "reg_140", label: "hydrau", color: "#db03fc", unit: "kW" },
];

export const daitsuTableColumns = [
	{ key: "cas", label: "Time" },
	{ key: "T1s_z1", label: "T1s z1" },
	{ key: "T1s_z2", label: "T1s z2" },
	{ key: "reg_4", label: "T5s" },
	{ key: "reg_100", label: "komp" },
	{ key: "reg_101", label: "vjedn" },
	{ key: "reg_104", label: "TW_in" },
	{ key: "reg_105", label: "TW_out" },
	{ key: "reg_106", label: "T3" },
	{ key: "reg_107", label: "T4" },
	{ key: "reg_108", label: "kom_dis" },
	{ key: "reg_109", label: "kom_air" },
	{ key: "reg_110", label: "T1" },
	{ key: "reg_111", label: "T1B" },
	{ key: "reg_112", label: "T2" },
	{ key: "reg_113", label: "T2B" },
	{ key: "reg_115", label: "T5" },
	{ key: "reg_124", label: "chyba" },
	{ key: "reg_128_1", label: "remote" },
	{ key: "reg_128_4", label: "rtch" },
	{ key: "reg_128_6", label: "RPT" },
	{ key: "reg_129_0", label: "IBH1" },
	{ key: "reg_129_2", label: "TBH" },
	{ key: "reg_129_13", label: "RUN" },
	{ key: "reg_129_14", label: "ext_heat" },
	{ key: "reg_138", label: "wt_flow" },
	{ key: "reg_140", label: "hydrau" },
];
