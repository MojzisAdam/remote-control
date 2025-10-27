import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DeviceHistory, StandardDeviceHistory, DaitsuDeviceHistory } from "@/api/deviceHistory/model";
import { HoverClickPopover } from "@/components/ui/hover-popover";
import { Device } from "@/api/devices/model";
import { ChartConstantsFactory } from "@/constants/chartConstants/factory";
import { isDaitsuDisplay, DisplayType } from "@/utils/displayTypeUtils";

// Common formatting functions
const formatTemperature = (value: number | undefined) => {
	if (value === undefined || value === null || value == -128) return "---";
	return `${value.toFixed(1)} °C`;
};

const formatCustomValue = (value: number | undefined, unit: string) => {
	if (value === undefined || value === null) return "---";
	return `${value.toFixed(1)} ${unit}`;
};

const formatValue = (value: number | undefined) => {
	if (value === undefined || value === null) return "---";
	if (value === 0 || value === 1) {
		return value === 1 ? "ON" : "OFF";
	}
	return value.toString();
};

// Helper function for binary state tooltips (ON/OFF)
const getBinaryTooltip = (value: number | undefined, onText: string = "zapnuto", offText: string = "vypnuto") => {
	if (value === undefined || value === null) return null;
	return value === 1 ? onText : offText;
};

// Helper function for REG mode tooltips
const getRegModeTooltip = (value: number | undefined) => {
	if (value === undefined || value === null) return null;

	switch (value) {
		case 0:
			return "nečinný";
		case 1:
			return "tuv";
		case 2:
			return "to";
		case 3:
			return "chlazení";
		case 4:
			return "topení";
		case 5:
			return "bazén";
		case 6:
			return "to+tuv";
		case 7:
			return "chlazení+tuv";
		case 8:
			return "bazén+tuv";
		default:
			return `mode ${value}`;
	}
};

// Helper function for VJEDN mode tooltips
const getVjednModeTooltip = (value: number | undefined) => {
	if (value === undefined || value === null) return null;

	switch (value) {
		case 0:
			return "vypnuto";
		case 1:
			return "topení";
		case 2:
			return "odtávání";
		case 3:
			return "chlazení";
		default:
			return `mode ${value}`;
	}
};

const getVjednModeTooltipDaitsu = (value: number | undefined) => {
	if (value === undefined || value === null) return null;

	switch (value) {
		case 0:
			return "vypnuto";
		case 3:
			return "topení";
		case 2:
			return "chlazení";
		default:
			return `mode ${value}`;
	}
};

// Helper function for DZ mode tooltips
const getDzModeTooltip = (value: number | undefined) => {
	if (value === undefined || value === null) return null;

	switch (value) {
		case 0:
			return "vypnuto";
		case 1:
			return "dz level 1";
		case 2:
			return "dz level m";
		case 3:
			return "dz level 2";
		case 4:
			return "přidavný";
		default:
			return `mode ${value}`;
	}
};

// Helper function for OBD tooltips
const getObdTooltip = (value: number | undefined) => {
	if (value === undefined || value === null) return null;
	return value === 0 ? "zima" : "léto";
};

// Render cell with tooltip when needed
const renderWithTooltip = (displayValue: string | number, tooltip: string | null) => {
	if (!tooltip) return displayValue;

	return (
		<HoverClickPopover
			content={<div className="p-2 text-sm">{tooltip}</div>}
			className="cursor-help"
		>
			<span>{displayValue}</span>
		</HoverClickPopover>
	);
};

// Common time column
const getTimeColumn = (): ColumnDef<DeviceHistory> => ({
	accessorKey: "cas",
	header: "Time",
	cell: ({ row }) => {
		const timestamp = row.original.cas;
		const date = new Date(timestamp);
		return date.toLocaleString();
	},
});

// Standard device columns
const getStandardDeviceColumns = (): ColumnDef<StandardDeviceHistory>[] => {
	const tableColumns = ChartConstantsFactory.getTableColumns(DisplayType.RPI);
	const getHeaderLabel = (key: string) => tableColumns.find((col) => col.key === key)?.label || key;

	return [
		{
			accessorKey: "TS1",
			header: getHeaderLabel("TS1"),
			cell: ({ row }) => formatTemperature(row.original.TS1),
		},
		{
			accessorKey: "TS2",
			header: getHeaderLabel("TS2"),
			cell: ({ row }) => formatTemperature(row.original.TS2),
		},
		{
			accessorKey: "TS3",
			header: getHeaderLabel("TS3"),
			cell: ({ row }) => formatTemperature(row.original.TS3),
		},
		{
			accessorKey: "TS4",
			header: getHeaderLabel("TS4"),
			cell: ({ row }) => formatTemperature(row.original.TS4),
		},
		{
			accessorKey: "TS5",
			header: getHeaderLabel("TS5"),
			cell: ({ row }) => formatTemperature(row.original.TS5),
		},
		{
			accessorKey: "TS6",
			header: getHeaderLabel("TS6"),
			cell: ({ row }) => formatTemperature(row.original.TS6),
		},
		{
			accessorKey: "TS7",
			header: getHeaderLabel("TS7"),
			cell: ({ row }) => formatTemperature(row.original.TS7),
		},
		{
			accessorKey: "TS8",
			header: getHeaderLabel("TS8"),
			cell: ({ row }) => formatTemperature(row.original.TS8),
		},
		{
			accessorKey: "TS9",
			header: getHeaderLabel("TS9"),
			cell: ({ row }) => formatTemperature(row.original.TS9),
		},
		{
			accessorKey: "PTO",
			header: getHeaderLabel("PTO"),
			cell: ({ row }) => formatTemperature(row.original.PTO),
		},
		{
			accessorKey: "PTUV",
			header: getHeaderLabel("PTUV"),
			cell: ({ row }) => formatTemperature(row.original.PTUV),
		},
		{
			accessorKey: "PTO2",
			header: getHeaderLabel("PTO2"),
			cell: ({ row }) => formatTemperature(row.original.PTO2),
		},
		{
			accessorKey: "komp",
			header: getHeaderLabel("komp"),
			cell: ({ row }) => {
				const value = row.original.komp;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "kvyk",
			header: getHeaderLabel("kvyk"),
			cell: ({ row }) => formatCustomValue(row.original.kvyk, "%"),
		},
		{
			accessorKey: "run",
			header: getHeaderLabel("run"),
			cell: ({ row }) => {
				const value = row.original.run;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg",
			header: getHeaderLabel("reg"),
			cell: ({ row }) => {
				const value = row.original.reg;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getRegModeTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "vjedn",
			header: getHeaderLabel("vjedn"),
			cell: ({ row }) => {
				const value = row.original.vjedn;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getVjednModeTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "dzto",
			header: getHeaderLabel("dzto"),
			cell: ({ row }) => {
				const value = row.original.dzto;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getDzModeTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "dztuv",
			header: getHeaderLabel("dztuv"),
			cell: ({ row }) => {
				const value = row.original.dztuv;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getDzModeTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "tstat",
			header: getHeaderLabel("tstat"),
			cell: ({ row }) => {
				const value = row.original.tstat;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "hdo",
			header: getHeaderLabel("hdo"),
			cell: ({ row }) => {
				const value = row.original.hdo;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "obd",
			header: getHeaderLabel("obd"),
			cell: ({ row }) => {
				const value = row.original.obd;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getObdTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "PT",
			header: getHeaderLabel("PT"),
			cell: ({ row }) => formatTemperature(row.original.PT),
		},
		{
			accessorKey: "PPT",
			header: getHeaderLabel("PPT"),
			cell: ({ row }) => formatTemperature(row.original.PPT),
		},
		{
			accessorKey: "RPT",
			header: getHeaderLabel("RPT"),
			cell: ({ row }) => formatTemperature(row.original.RPT),
		},
		{
			accessorKey: "Prtk",
			header: getHeaderLabel("Prtk"),
			cell: ({ row }) => formatCustomValue(row.original.Prtk, "m3/h"),
		},
		{
			accessorKey: "TpnVk",
			header: getHeaderLabel("TpnVk"),
			cell: ({ row }) => formatCustomValue(row.original.TpnVk, "kW"),
		},
		{
			accessorKey: "chyba",
			header: getHeaderLabel("chyba"),
			cell: ({ row }) => row.original.chyba,
		},
	];
};

// Daitsu device columns
const getDaitsuDeviceColumns = (): ColumnDef<DaitsuDeviceHistory>[] => {
	const tableColumns = ChartConstantsFactory.getTableColumns(DisplayType.DAITSU);
	const getHeaderLabel = (key: string) => tableColumns.find((col) => col.key === key)?.label || key;

	return [
		{
			accessorKey: "T1s_z1",
			header: getHeaderLabel("T1s_z1"),
			cell: ({ row }) => formatTemperature(row.original.T1s_z1),
		},
		{
			accessorKey: "T1s_z2",
			header: getHeaderLabel("T1s_z2"),
			cell: ({ row }) => formatTemperature(row.original.T1s_z2),
		},
		{
			accessorKey: "reg_4",
			header: getHeaderLabel("reg_4"),
			cell: ({ row }) => formatTemperature(row.original.reg_4),
		},
		{
			accessorKey: "reg_100",
			header: getHeaderLabel("reg_100"),
			cell: ({ row }) => formatCustomValue(row.original.reg_100, "Hz"),
		},
		{
			accessorKey: "reg_101",
			header: getHeaderLabel("reg_101"),
			cell: ({ row }) => {
				const value = row.original.reg_101;
				const displayValue = value !== undefined ? value.toString() : "---";
				const tooltip = getVjednModeTooltipDaitsu(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_104",
			header: getHeaderLabel("reg_104"),
			cell: ({ row }) => formatTemperature(row.original.reg_104),
		},
		{
			accessorKey: "reg_105",
			header: getHeaderLabel("reg_105"),
			cell: ({ row }) => formatTemperature(row.original.reg_105),
		},
		{
			accessorKey: "reg_106",
			header: getHeaderLabel("reg_106"),
			cell: ({ row }) => formatTemperature(row.original.reg_106),
		},
		{
			accessorKey: "reg_107",
			header: getHeaderLabel("reg_107"),
			cell: ({ row }) => formatTemperature(row.original.reg_107),
		},
		{
			accessorKey: "reg_108",
			header: getHeaderLabel("reg_108"),
			cell: ({ row }) => formatTemperature(row.original.reg_108),
		},
		{
			accessorKey: "reg_109",
			header: getHeaderLabel("reg_109"),
			cell: ({ row }) => formatTemperature(row.original.reg_109),
		},
		{
			accessorKey: "reg_110",
			header: getHeaderLabel("reg_110"),
			cell: ({ row }) => formatTemperature(row.original.reg_110),
		},
		{
			accessorKey: "reg_111",
			header: getHeaderLabel("reg_111"),
			cell: ({ row }) => formatTemperature(row.original.reg_111),
		},
		{
			accessorKey: "reg_112",
			header: getHeaderLabel("reg_112"),
			cell: ({ row }) => formatTemperature(row.original.reg_112),
		},
		{
			accessorKey: "reg_113",
			header: getHeaderLabel("reg_113"),
			cell: ({ row }) => formatTemperature(row.original.reg_113),
		},
		{
			accessorKey: "reg_115",
			header: getHeaderLabel("reg_115"),
			cell: ({ row }) => formatTemperature(row.original.reg_115),
		},
		{
			accessorKey: "reg_128_1",
			header: getHeaderLabel("reg_128_1"),
			cell: ({ row }) => {
				const value = row.original.reg_128_1;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_128_4",
			header: getHeaderLabel("reg_128_4"),
			cell: ({ row }) => {
				const value = row.original.reg_128_4;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_128_6",
			header: getHeaderLabel("reg_128_6"),
			cell: ({ row }) => {
				const value = row.original.reg_128_6;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_129_0",
			header: getHeaderLabel("reg_129_0"),
			cell: ({ row }) => {
				const value = row.original.reg_129_0;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_129_2",
			header: getHeaderLabel("reg_129_2"),
			cell: ({ row }) => {
				const value = row.original.reg_129_2;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_129_13",
			header: getHeaderLabel("reg_129_13"),
			cell: ({ row }) => {
				const value = row.original.reg_129_13;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_129_14",
			header: getHeaderLabel("reg_129_14"),
			cell: ({ row }) => {
				const value = row.original.reg_129_14;
				const displayValue = formatValue(value);
				const tooltip = getBinaryTooltip(value);
				return renderWithTooltip(displayValue, tooltip);
			},
		},
		{
			accessorKey: "reg_138",
			header: getHeaderLabel("reg_138"),
			cell: ({ row }) => formatCustomValue(row.original.reg_138, "m3/h"),
		},
		{
			accessorKey: "reg_140",
			header: getHeaderLabel("reg_140"),
			cell: ({ row }) => formatCustomValue(row.original.reg_140, "kW"),
		},
		{
			accessorKey: "reg_124",
			header: getHeaderLabel("reg_124"),
			cell: ({ row }) => row.original.reg_124,
		},
	];
};

export class TableColumnsFactory {
	static getColumns(device: Device): ColumnDef<DeviceHistory>[] {
		const timeColumn = getTimeColumn();

		if (isDaitsuDisplay(device)) {
			return [timeColumn, ...getDaitsuDeviceColumns()] as ColumnDef<DeviceHistory>[];
		}

		return [timeColumn, ...getStandardDeviceColumns()] as ColumnDef<DeviceHistory>[];
	}
}
