import { ColumnDef } from "@tanstack/react-table";
import { StandardDeviceHistory } from "@/api/deviceHistory/model";
import { HoverClickPopover } from "@/components/ui/hover-popover";

const formatTemperature = (value: number | undefined) => {
	if (value === undefined || value === null || value == -128) return "---";
	return `${value.toFixed(1)} °C`;
};

const formatCustomValue = (value: number | undefined, unit: string) => {
	if (value === undefined || value === null) return "---";
	return `${value.toFixed(1)} ${unit}`;
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

const formatValue = (value: number | undefined) => {
	if (value === undefined || value === null) return "---";

	if (value === 0 || value === 1) {
		return value === 1 ? "ON" : "OFF";
	}

	return value.toString();
};

export const columns: ColumnDef<StandardDeviceHistory>[] = [
	{
		accessorKey: "cas",
		header: "Time",
		cell: ({ row }) => {
			const timestamp = row.original.cas;
			const date = new Date(timestamp);
			return date.toLocaleString();
		},
	},
	{
		accessorKey: "TS1",
		header: "TS1",
		cell: ({ row }) => formatTemperature(row.original.TS1),
	},
	{
		accessorKey: "TS2",
		header: "TS2",
		cell: ({ row }) => formatTemperature(row.original.TS2),
	},
	{
		accessorKey: "TS3",
		header: "TS3",
		cell: ({ row }) => formatTemperature(row.original.TS3),
	},
	{
		accessorKey: "TS4",
		header: "TS4",
		cell: ({ row }) => formatTemperature(row.original.TS4),
	},
	{
		accessorKey: "TS5",
		header: "TS5",
		cell: ({ row }) => formatTemperature(row.original.TS5),
	},
	{
		accessorKey: "TS6",
		header: "TS6",
		cell: ({ row }) => formatTemperature(row.original.TS6),
	},
	{
		accessorKey: "TS7",
		header: "TS7",
		cell: ({ row }) => formatTemperature(row.original.TS7),
	},
	{
		accessorKey: "TS8",
		header: "TS8",
		cell: ({ row }) => formatTemperature(row.original.TS8),
	},
	{
		accessorKey: "TS9",
		header: "TS9",
		cell: ({ row }) => formatTemperature(row.original.TS9),
	},
	{
		accessorKey: "PTO",
		header: "PTO",
		cell: ({ row }) => formatTemperature(row.original.PTO),
	},
	{
		accessorKey: "PTUV",
		header: "PTUV",
		cell: ({ row }) => formatTemperature(row.original.PTUV),
	},
	{
		accessorKey: "PTO2",
		header: "PTO2",
		cell: ({ row }) => formatTemperature(row.original.PTO2),
	},
	{
		accessorKey: "komp",
		header: "Komp",
		cell: ({ row }) => {
			const value = row.original.komp;
			const displayValue = formatValue(value);
			const tooltip = getBinaryTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "kvyk",
		header: "Kvyk",
		cell: ({ row }) => formatCustomValue(row.original.kvyk, "%"),
	},
	{
		accessorKey: "run",
		header: "Run",
		cell: ({ row }) => {
			const value = row.original.run;
			const displayValue = formatValue(value);
			const tooltip = getBinaryTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "reg",
		header: "Reg",
		cell: ({ row }) => {
			const value = row.original.reg;
			const displayValue = value !== undefined ? value.toString() : "---";
			const tooltip = getRegModeTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "vjedn",
		header: "Vjedn",
		cell: ({ row }) => {
			const value = row.original.vjedn;
			const displayValue = value !== undefined ? value.toString() : "---";
			const tooltip = getVjednModeTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "dzto",
		header: "DZTO",
		cell: ({ row }) => {
			const value = row.original.dzto;
			const displayValue = value !== undefined ? value.toString() : "---";
			const tooltip = getDzModeTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "dztuv",
		header: "DZTUV",
		cell: ({ row }) => {
			const value = row.original.dztuv;
			const displayValue = value !== undefined ? value.toString() : "---";
			const tooltip = getDzModeTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "tstat",
		header: "TStat",
		cell: ({ row }) => {
			const value = row.original.tstat;
			const displayValue = formatValue(value);
			const tooltip = getBinaryTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "hdo",
		header: "HDO",
		cell: ({ row }) => {
			const value = row.original.hdo;
			const displayValue = formatValue(value);
			const tooltip = getBinaryTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "obd",
		header: "OBD",
		cell: ({ row }) => {
			const value = row.original.obd;
			const displayValue = value !== undefined ? value.toString() : "---";
			const tooltip = getObdTooltip(value);
			return renderWithTooltip(displayValue, tooltip);
		},
	},
	{
		accessorKey: "PT",
		header: "PT",
		cell: ({ row }) => formatTemperature(row.original.PT),
	},
	{
		accessorKey: "PPT",
		header: "PPT",
		cell: ({ row }) => formatTemperature(row.original.PPT),
	},
	{
		accessorKey: "RPT",
		header: "RPT",
		cell: ({ row }) => formatTemperature(row.original.RPT),
	},
	{
		accessorKey: "Prtk",
		header: "Prtk",
		cell: ({ row }) => formatCustomValue(row.original.Prtk, "m3/h"),
	},
	{
		accessorKey: "TpnVk",
		header: "TpnVk",
		cell: ({ row }) => formatCustomValue(row.original.TpnVk, "kW"),
	},
	{
		accessorKey: "chyba",
		header: "Chyba",
		cell: ({ row }) => row.original.chyba,
	},
];
