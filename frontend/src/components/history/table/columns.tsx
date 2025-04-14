import { ColumnDef } from "@tanstack/react-table";
import { DeviceHistory } from "@/api/deviceHistory/model";
const formatTemperature = (value: number | undefined) => {
	if (value === undefined || value === null) return "---";
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

export const columns: ColumnDef<DeviceHistory>[] = [
	{
		accessorKey: "cas",
		header: "Timestamp",
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
		cell: ({ row }) => formatValue(row.original.komp),
	},
	{
		accessorKey: "kvyk",
		header: "Kvyk",
		cell: ({ row }) => formatCustomValue(row.original.kvyk, "%"),
	},
	{
		accessorKey: "run",
		header: "Run",
		cell: ({ row }) => formatValue(row.original.run),
	},
	{
		accessorKey: "reg",
		header: "Reg",
		cell: ({ row }) => row.original.reg,
	},
	{
		accessorKey: "vjedn",
		header: "Vjedn",
		cell: ({ row }) => row.original.vjedn,
	},
	{
		accessorKey: "dzto",
		header: "DZTO",
		cell: ({ row }) => formatValue(row.original.dzto),
	},
	{
		accessorKey: "dztuv",
		header: "DZTUV",
		cell: ({ row }) => formatValue(row.original.dztuv),
	},
	{
		accessorKey: "tstat",
		header: "TStat",
		cell: ({ row }) => formatValue(row.original.tstat),
	},
	{
		accessorKey: "hdo",
		header: "HDO",
		cell: ({ row }) => formatValue(row.original.hdo),
	},
	{
		accessorKey: "obd",
		header: "OBD",
		cell: ({ row }) => row.original.obd,
	},
	{
		accessorKey: "chyba",
		header: "Error",
		cell: ({ row }) => row.original.chyba,
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
];
