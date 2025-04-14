"use client";

import React, { useState } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, useReactTable, VisibilityState } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { DeviceActions } from "@/components/device-management/columns";
import { useTranslation } from "react-i18next";

interface DataTableProps<TData> {
	columns: ColumnDef<TData, DeviceActions>[];
	data: TData[];
	sorting: SortingState;
	pageSize: number;
	onSortingChange: (sorting: SortingState) => void;
	onPageSizeChange: (pageSize: number) => void;
	loading: boolean;
	isInitialLoad: boolean;
	deviceSearch: string;
	onDeviceSearchChange: (value: string) => void;
	emailSearch: string;
	onEmailSearchChange: (value: string) => void;
	statusFilter: "all" | "online" | "offline" | "error";
	onStatusFilterChange: (value: "all" | "online" | "offline" | "error") => void;
}

export function DataTable<TData>({
	columns,
	data,
	sorting,
	pageSize,
	onSortingChange,
	onPageSizeChange,
	loading,
	isInitialLoad,
	deviceSearch,
	onDeviceSearchChange,
	emailSearch,
	onEmailSearchChange,
	statusFilter,
	onStatusFilterChange,
}: DataTableProps<TData>) {
	const { t } = useTranslation("deviceManagement");
	const { t: tPagination } = useTranslation("pagination");
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: (updatedSorting) => {
			if (typeof updatedSorting === "function") {
				const newSorting = updatedSorting(sorting);
				onSortingChange(newSorting);
			} else {
				onSortingChange(updatedSorting);
			}
		},
		state: {
			columnVisibility,
			sorting,
		},
	});

	const pageSizes = [10, 20, 50];

	return (
		<div>
			{/* Extra Filter Controls */}
			<div className="flex items-center py-4 gap-4">
				<div className="flex items-center gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								{pageSize} {tPagination("rows")}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{pageSizes.map((size) => (
								<DropdownMenuCheckboxItem
									key={size}
									onClick={() => onPageSizeChange(size)}
									checked={pageSize === size}
								>
									{size} {tPagination("rows")}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<Input
						placeholder={t("search.devicePlaceholder")}
						value={deviceSearch}
						onChange={(e) => onDeviceSearchChange(e.target.value)}
						className="border p-2 rounded max-w-sm"
					/>
					<Input
						placeholder={t("search.emailPlaceholder")}
						value={emailSearch}
						onChange={(e) => onEmailSearchChange(e.target.value)}
						className="border p-2 rounded max-w-sm"
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">{t(`status.${statusFilter}`)}</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuCheckboxItem
								onClick={() => onStatusFilterChange("all")}
								checked={statusFilter === "all"}
							>
								{t("status.all")}
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								onClick={() => onStatusFilterChange("online")}
								checked={statusFilter === "online"}
							>
								{t("status.online")}
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								onClick={() => onStatusFilterChange("offline")}
								checked={statusFilter === "offline"}
							>
								{t("status.offline")}
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								onClick={() => onStatusFilterChange("error")}
								checked={statusFilter === "error"}
							>
								{t("status.error")}
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{loading && !isInitialLoad ? <Loader2 className="animate-spin h-4 w-4" /> : null}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="ml-auto"
						>
							{tPagination("columns")}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{typeof column.columnDef.meta === "string" ? column.columnDef.meta : column.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										className="px-6"
										key={header.id}
									>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading && isInitialLoad /* || (table.getRowModel().rows?.length === 0 && loading) */ ? (
							<>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={columns.length}>
										<Skeleton className="h-6 my-1 mx-1" />
									</TableCell>
								</TableRow>
							</>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="px-6"
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{tPagination("noResults")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
