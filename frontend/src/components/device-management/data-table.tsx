"use client";

import React, { useState } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, useReactTable, VisibilityState, Column } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ListFilter } from "lucide-react";
import { DeviceActions } from "@/components/device-management/columns";
import { useTranslation } from "react-i18next";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
			<div className="flex items-center py-4 gap-4 w-full">
				{/* Desktop layout */}
				<div className="hidden lg:flex items-center gap-4 w-full">
					{/* Rows selector as Select */}
					<Select
						onValueChange={(val) => onPageSizeChange(Number(val))}
						defaultValue={String(pageSize)}
					>
						<SelectTrigger className="w-[120px] min-w-[120px]">
							<SelectValue placeholder={`${pageSize} ${tPagination("rows")}`} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{pageSizes.map((size) => (
									<SelectItem
										key={size}
										value={String(size)}
									>
										{size} {tPagination("rows")}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Input
						placeholder={t("search.devicePlaceholder")}
						value={deviceSearch}
						onChange={(e) => onDeviceSearchChange(e.target.value)}
						className="border p-2 rounded max-w-[300px]"
					/>

					<Input
						placeholder={t("search.emailPlaceholder")}
						value={emailSearch}
						onChange={(e) => onEmailSearchChange(e.target.value)}
						className="border p-2 rounded max-w-[300px]"
					/>

					{/* Status filter dropdown */}
					<Select
						onValueChange={(val) => onStatusFilterChange(val as "all" | "online" | "offline" | "error")}
						defaultValue={statusFilter}
					>
						<SelectTrigger className="w-[120px] min-w-[120px]">
							<SelectValue placeholder={t(`status.${statusFilter}`)} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{["all", "online", "offline", "error"].map((status) => (
									<SelectItem
										key={status}
										value={status}
									>
										{t(`status.${status}`)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<div className="h-5 w-5">{loading && !isInitialLoad && <Loader2 className="animate-spin h-4 w-4" />}</div>

					{/* Columns visibility dropdown */}
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
								.filter((col: Column<TData, unknown>) => col.getCanHide())
								.map((col: Column<TData, unknown>) => (
									<DropdownMenuCheckboxItem
										key={col.id}
										className="capitalize"
										checked={col.getIsVisible()}
										onCheckedChange={(value) => col.toggleVisibility(!!value)}
									>
										{typeof col.columnDef.meta === "string" ? col.columnDef.meta : col.id}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Mobile layout */}
				<div className="flex flex-col lg:hidden w-full gap-2">
					<Input
						placeholder={t("search.devicePlaceholder")}
						value={deviceSearch}
						onChange={(e) => onDeviceSearchChange(e.target.value)}
						className="border p-2 rounded max-w-[300px]"
					/>

					<Input
						placeholder={t("search.emailPlaceholder")}
						value={emailSearch}
						onChange={(e) => onEmailSearchChange(e.target.value)}
						className="border p-2 rounded max-w-[300px]"
					/>

					<div className="flex items-center justify-start gap-2 pt-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
								>
									<ListFilter />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-4 space-y-4 w-auto">
								{/* Rows selector */}
								<Select
									onValueChange={(val) => onPageSizeChange(Number(val))}
									defaultValue={String(pageSize)}
								>
									<SelectTrigger className="w-[160px]">
										<SelectValue placeholder={`${pageSize} ${tPagination("rows")}`} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{pageSizes.map((size) => (
												<SelectItem
													key={size}
													value={String(size)}
												>
													{size} {tPagination("rows")}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>

								{/* Status filter */}
								<Select
									onValueChange={(val) => onStatusFilterChange(val as "all" | "online" | "offline" | "error")}
									defaultValue={statusFilter}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t(`status.${statusFilter}`)} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{["all", "online", "offline", "error"].map((status) => (
												<SelectItem
													key={status}
													value={status}
												>
													{t(`status.${status}`)}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</PopoverContent>
						</Popover>

						<div className="h-5 w-5">{loading && !isInitialLoad && <Loader2 className="animate-spin h-4 w-4" />}</div>
					</div>
				</div>
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
