"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DeviceType } from "@/api/devices/model";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type ColumnActions = {
	navigateToDeviceType: (deviceType: DeviceType) => void;
};

const isColumnActions = (meta: unknown): meta is ColumnActions => {
	if (typeof meta === "object" && meta !== null) {
		return "navigateToDeviceType" in meta && typeof (meta as { navigateToDeviceType: unknown }).navigateToDeviceType === "function";
	}
	return false;
};

const getStringValue = (value: any): string => {
	return String(value || "");
};

export const getColumns = (t: (key: string) => string): ColumnDef<DeviceType, ColumnActions>[] => [
	{
		accessorKey: "id",
		meta: t("deviceTypes.columns.id"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("deviceTypes.columns.id")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			return <div className="font-mono text-sm">{row.getValue("id")}</div>;
		},
	},
	{
		accessorKey: "name",
		meta: t("deviceTypes.columns.name"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("deviceTypes.columns.name")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			const name = row.getValue("name");
			return <div className="font-medium">{getStringValue(name)}</div>;
		},
	},
	{
		accessorKey: "description",
		meta: t("deviceTypes.columns.description"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("deviceTypes.columns.description")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			const description = row.getValue("description");
			const localizedDescription = getStringValue(description);
			return <div className="max-w-[300px] truncate">{localizedDescription || t("deviceTypes.noDescription")}</div>;
		},
	},
	{
		accessorKey: "capabilities",
		meta: t("deviceTypes.columns.capabilities"),
		header: t("deviceTypes.columns.capabilities"),
		cell: ({ row }) => {
			const capabilities = row.getValue("capabilities") as Record<string, any> | string[];
			let count = 0;

			if (Array.isArray(capabilities)) {
				count = capabilities.length;
			} else if (typeof capabilities === "object" && capabilities !== null) {
				count = Object.keys(capabilities).length;
			}

			return (
				<Badge variant="secondary">
					{count} {count === 1 ? t("deviceTypes.capability") : t("deviceTypes.capabilities")}
				</Badge>
			);
		},
	},
	{
		accessorKey: "created_at",
		meta: t("deviceTypes.columns.createdAt"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("deviceTypes.columns.createdAt")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("created_at"));
			return <div className="text-sm">{date.toLocaleDateString()}</div>;
		},
	},
	{
		id: "actions",
		meta: t("deviceTypes.columns.actions"),
		cell: ({ row, column }) => {
			const deviceType = row.original;
			const { navigateToDeviceType } = isColumnActions(column.columnDef.meta)
				? column.columnDef.meta
				: {
						navigateToDeviceType: () => {},
				  };

			return (
				<Button
					variant="secondary"
					size="sm"
					onClick={() => navigateToDeviceType && navigateToDeviceType(deviceType)}
					className="h-8"
				>
					{t("deviceTypes.actions.more")}
				</Button>
			);
		},
	},
];
