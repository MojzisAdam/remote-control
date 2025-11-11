"use client";

import React, { useState } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, VisibilityState, Column } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Loader2, ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ColumnActions } from "@/components/device-types-management/columns";

interface DataTableProps<TData> {
	columns: ColumnDef<TData, ColumnActions>[];
	data: TData[];
	sorting: SortingState;
	pageSize: number;
	onSortingChange: (sorting: SortingState) => void;
	onSearchChange: (search: string) => void;
	onPageSizeChange: (pageSize: number) => void;
	loading: boolean;
	isInitialLoad: boolean;
}

export function DataTable<TData>({ columns, data, sorting, pageSize, onSortingChange, onSearchChange, onPageSizeChange, loading, isInitialLoad }: DataTableProps<TData>) {
	const { t } = useTranslation("deviceTypes");
	const { t: tPagination } = useTranslation("pagination");

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
			<div className="flex items-center py-4 gap-4">
				{/* Desktop layout */}
				<div className="hidden md:flex items-center gap-4 w-full">
					<Select
						onValueChange={(val) => onPageSizeChange(Number(val))}
						defaultValue={String(pageSize)}
					>
						<SelectTrigger className="w-[120px] ">
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
						placeholder={t("deviceTypes.search")}
						onChange={(e) => onSearchChange(e.target.value)}
						className="max-w-sm"
					/>

					<div className="h-5 w-5">{loading && !isInitialLoad && <Loader2 className="animate-spin h-4 w-4" />}</div>

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
				<div className="flex md:hidden items-center gap-2 w-full">
					<Input
						placeholder={t("deviceTypes.search")}
						onChange={(e) => onSearchChange(e.target.value)}
						className="max-w-48"
					/>

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

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-full"
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
						</PopoverContent>
					</Popover>
					<div className="h-5 w-5">{loading && !isInitialLoad && <Loader2 className="animate-spin h-4 w-4" />}</div>
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading && isInitialLoad ? (
							<>
								{Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={columns.length}>
											<Skeleton className="h-6 my-1 mx-1" />
										</TableCell>
									</TableRow>
								))}
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
