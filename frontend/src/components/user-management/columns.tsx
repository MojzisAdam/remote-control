"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, User as IconUser, UserCog, UserX, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/utils";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/api/user/model";

export type ColumnActions = {
	viewUser: (user: User) => void;
	editUser: (user: User) => void;
	deleteUserModal: (user: User) => void;
};

const isColumnActions = (meta: unknown): meta is ColumnActions => {
	if (typeof meta === "object" && meta !== null) {
		return (
			"viewUser" in meta &&
			typeof (meta as { viewUser: unknown }).viewUser === "function" &&
			"editUser" in meta &&
			typeof (meta as { editUser: unknown }).editUser === "function" &&
			"deleteUserModal" in meta &&
			typeof (meta as { deleteUserModal: unknown }).deleteUserModal === "function"
		);
	}
	return false;
};

export const getColumns = (t: (key: string) => string): ColumnDef<User, ColumnActions>[] => [
	{
		accessorKey: "first_name",
		meta: t("userManagement.table.firstName"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("userManagement.table.firstName")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
	},
	{
		accessorKey: "last_name",
		meta: t("userManagement.table.lastName"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("userManagement.table.lastName")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
	},
	{
		accessorKey: "email",
		meta: t("userManagement.table.email"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("userManagement.table.email")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
	},
	{
		accessorKey: "email_verified_at",
		meta: t("userManagement.table.emailVerifiedAt"),
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={(e) => (e.shiftKey ? column.toggleSorting(undefined, false) : column.toggleSorting())}
				>
					{t("userManagement.table.emailVerifiedAt")}
					{column.getIsSorted() ? column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			const rowData = row.getValue("email_verified_at") as string | undefined;

			return rowData ? formatDateTime(rowData) : t("userManagement.table.notVerified");
		},
	},
	{
		id: "actions",
		meta: t("userManagement.actions.title"),
		cell: ({ row, column }) => {
			const user = row.original;
			const { viewUser, editUser, deleteUserModal } = isColumnActions(column.columnDef.meta)
				? column.columnDef.meta
				: {
						viewUser: () => {},
						editUser: () => {},
						deleteUserModal: () => {},
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
					>
						<DropdownMenuLabel>{t("userManagement.actions.title")}</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>{t("userManagement.actions.copyEmail")}</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => viewUser && viewUser(user)}>
							<IconUser /> {t("userManagement.actions.viewUser")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => editUser && editUser(user)}>
							<UserCog />
							{t("userManagement.actions.editUser")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => deleteUserModal && deleteUserModal(user)}>
							<UserX />
							{t("userManagement.actions.deleteUser")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
