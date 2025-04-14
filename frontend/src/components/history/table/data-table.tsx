"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, useReactTable, VisibilityState } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Calendar } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeviceHistoryDataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	sorting: SortingState;
	pageSize: number;
	onSortingChange: (sorting: SortingState) => void;
	onPageSizeChange: (pageSize: number) => void;
	loading: boolean;
	isInitialLoad: boolean;
	fromDate: string | null;
	onFromDateChange: (value: string) => void;
	toDate: string | null;
	onToDateChange: (value: string) => void;
	errorOnly: boolean;
	onErrorOnlyChange: (value: boolean) => void;
}

export function DeviceHistoryDataTable<TData>({
	columns,
	data,
	sorting,
	pageSize,
	onSortingChange,
	onPageSizeChange,
	loading,
	isInitialLoad,
	fromDate,
	onFromDateChange,
	toDate,
	onToDateChange,
	errorOnly,
	onErrorOnlyChange,
}: DeviceHistoryDataTableProps<TData>) {
	const { t } = useTranslation(["pagination", "history"]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const [open, setOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const handleApply = () => {
		setOpen(false);
		onFromDateChange("");
		onToDateChange("");
	};

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 1200);
		};

		checkIfMobile();
		window.addEventListener("resize", checkIfMobile);

		return () => {
			window.removeEventListener("resize", checkIfMobile);
		};
	}, []);

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

	const pageSizes = [25, 50, 100, 200];

	return (
		<div className="mt-2">
			{/* Filter Controls */}
			<div className="flex items-center py-4 gap-4 max-sm:items-start relative justify-between">
				<div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								{pageSize} {t("pagination:rows")}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{pageSizes.map((size) => (
								<DropdownMenuCheckboxItem
									key={size}
									onClick={() => onPageSizeChange(size)}
									checked={pageSize === size}
								>
									{size} {t("pagination:rows")}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<div className="flex items-center gap-4">
						{isMobile ? (
							<Popover
								open={open}
								onOpenChange={setOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										title="Select Date Range"
									>
										<Calendar className="h-5 w-5" /> {t("history:dateRange")}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 h-full">
									<div className="flex flex-col gap-1 relative mt-6">
										<label className="text-sm font-medium absolute bottom-10">{t("history:from")}</label>
										<DatePicker
											value={fromDate}
											onChange={(date) => onFromDateChange(date ?? "")}
											className="max-w-80"
										/>
									</div>
									<div className="flex flex-col gap-1 relative mt-8">
										<label className="text-sm font-medium absolute bottom-10">{t("history:to")}</label>
										<DatePicker
											value={toDate}
											onChange={(date) => onToDateChange(date ?? "")}
											className="max-w-80"
										/>
									</div>
									<Button
										variant="outline"
										onClick={() => handleApply()}
										disabled={loading}
										className="mt-4"
									>
										{t("history:clear")}
									</Button>
								</PopoverContent>
							</Popover>
						) : (
							<>
								<div className="flex flex-col gap-1 relative max-md:mt-4">
									<label className="text-sm font-medium absolute bottom-10">{t("history:from")}</label>
									<DatePicker
										value={fromDate}
										onChange={(date) => onFromDateChange(date ?? "")}
										className="max-w-[200px]"
									/>
								</div>
								<div className="flex flex-col gap-1 relative max-md:mt-4">
									<label className="text-sm font-medium absolute bottom-10">{t("history:to")}</label>
									<DatePicker
										value={toDate}
										onChange={(date) => onToDateChange(date ?? "")}
										className="max-w-[200px]"
									/>
								</div>
								<Button
									variant="outline"
									onClick={() => {
										onFromDateChange("");
										onToDateChange("");
									}}
									disabled={loading}
								>
									{t("history:clear")}
								</Button>
							</>
						)}

						{loading && !isInitialLoad && <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />}
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center space-x-2">
								<CircleAlert className="h-4 w-4" />
								<Switch
									checked={errorOnly}
									onCheckedChange={onErrorOnlyChange}
									id="errorOnly"
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent>{t("history:showOnlyErrors")}</TooltipContent>
					</Tooltip>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="ml-auto"
							>
								{t("pagination:columns")}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="overflow-y-scroll h-96"
						>
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
			</div>

			<div className="w-full">
				<div className="rounded-md border w-full">
					<Table className="relative">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											className="px-6 whitespace-nowrap"
											key={header.id}
										>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{loading && isInitialLoad ? (
								<>
									{Array(10)
										.fill(0)
										.map((_, index) => (
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
												className="px-6 whitespace-nowrap"
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
										{t("pagination:noResults")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
