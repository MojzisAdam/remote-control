import { ColumnDef } from "@tanstack/react-table";
import { Device } from "@/api/devices/model";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, FilePenLine, Users, ArrowBigDown } from "lucide-react";
import { getStatusColor } from "@/components/dashboard/DeviceCard";
import { getDisplayTypeName } from "@/utils/displayUtils";

export type DeviceActions = {
	viewDeviceUsers: (device: Device) => void;
	editDeviceDescription: (device: Device) => void;
	addDeviceToList: (device: Device) => void;
};

const isColumnActions = (meta: unknown): meta is DeviceActions => {
	return (
		typeof meta === "object" &&
		meta !== null &&
		"viewDeviceUsers" in meta &&
		"editDeviceDescription" in meta &&
		"addDeviceToList" in meta &&
		typeof (meta as DeviceActions).viewDeviceUsers === "function" &&
		typeof (meta as DeviceActions).editDeviceDescription === "function" &&
		typeof (meta as DeviceActions).addDeviceToList === "function"
	);
};
export const getColumns = (t: (key: string) => string): ColumnDef<Device, DeviceActions>[] => [
	{
		accessorKey: "status",
		header: t("table.status"),
		cell: ({ row }) => <span className={`text-white px-3 py-1 rounded-full text-xs ${getStatusColor(row.original.status)}`}>{t("status." + row.original.status).toUpperCase()}</span>,
	},
	{
		accessorKey: "id",
		header: t("table.id"),
	},
	{
		accessorKey: "display",
		header: t("table.display"),
		cell: ({ row }) => getDisplayTypeName(Number(row.original.display_type || 0)),
	},
	{
		accessorKey: "owner",
		header: t("table.owner"),
		cell: ({ row }) => row.original.description?.owner || "",
	},
	{
		accessorKey: "description",
		header: t("table.description"),
		cell: ({ row }) => {
			const text = row.original.description?.description || "";
			return (
				<div
					className="truncate max-w-64"
					title={text}
				>
					{text}
				</div>
			);
		},
	},
	{
		accessorKey: "location",
		header: t("table.location"),
		cell: ({ row }) => [row.original.description?.address, row.original.description?.city, row.original.description?.zip_code].filter(Boolean).join(", "),
	},

	{
		id: "actions",
		meta: t("table.actions"),
		cell: ({ row, column }) => {
			const device = row.original;
			const { viewDeviceUsers, editDeviceDescription, addDeviceToList } = isColumnActions(column.columnDef.meta)
				? column.columnDef.meta
				: {
						viewDeviceUsers: () => {},
						editDeviceDescription: () => {},
						addDeviceToList: () => {},
				  };
			return (
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="secondary"
							className=""
						>
							<ArrowBigDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						onCloseAutoFocus={(e) => e.preventDefault()}
						className="w-full"
					>
						<DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(device.id)}>{t("table.copyId")}</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => viewDeviceUsers(device)}>
							<Users />
							{t("table.viewUsers")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => editDeviceDescription(device)}>
							<FilePenLine />
							{t("table.editDescription")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => addDeviceToList(device)}>
							<Plus /> {t("table.addDevice")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
