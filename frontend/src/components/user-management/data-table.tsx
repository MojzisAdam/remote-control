"use client";

import React, { useState } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, VisibilityState } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ColumnActions } from "@/components/user-management/columns";

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
	const { t } = useTranslation("userManagement");
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
						placeholder={t("userManagement.search")}
						onChange={(e) => onSearchChange(e.target.value)}
						className="max-w-sm"
					/>
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
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									>
										{typeof column.columnDef.meta === "string" ? column.columnDef.meta : column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
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
						{loading && isInitialLoad /* || (table.getRowModel().rows?.length == 0 && loading) */ ? (
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
