"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DeviceHistoryDataTable } from "@/components/history/table/data-table";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { Button } from "@/components/ui/button";
import { DeviceHistory } from "@/api/deviceHistory/model";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";
import { TableColumnsFactory } from "./TableFactory";

interface EnhancedTableContainerProps {
	device: Device;
}

const EnhancedTableContainer: React.FC<EnhancedTableContainerProps> = ({ device }) => {
	const { t } = useTranslation(["pagination", "history"]);

	const { loadPaginatedDeviceHistory, loading } = useDeviceHistory();
	const { toast } = useToast();

	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [deviceHistory, setDeviceHistory] = useState<DeviceHistory[]>([]);

	const [fromDateInput, setFromDateInput] = useState<string | null>(null);
	const [toDateInput, setToDateInput] = useState<string | null>(null);

	const [totalPages, setTotalPages] = useState<number>(0);
	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalRecords, setTotalRecords] = useState<number>(0);

	const [query, setQuery] = useState<{
		page: number;
		pageSize: number;
		fromDate: string | null;
		toDate: string | null;
		errorOnly: boolean;
	}>({
		page: 1,
		pageSize: 25,
		fromDate: null,
		toDate: null,
		errorOnly: false,
	});

	const debouncedFromDate = useDebounce(fromDateInput, 500);
	const debouncedToDate = useDebounce(toDateInput, 500);

	// Get device-specific columns
	const columns = useMemo(() => {
		return TableColumnsFactory.getColumns(device);
	}, [device.display_type]);

	useEffect(() => {
		setQuery((prev) => {
			if (prev.fromDate === debouncedFromDate && prev.toDate === debouncedToDate) {
				return prev;
			}
			return {
				...prev,
				fromDate: debouncedFromDate,
				toDate: debouncedToDate,
				page: 1,
			};
		});
	}, [debouncedFromDate, debouncedToDate]);

	const loadHistoryData = async () => {
		try {
			const response = await loadPaginatedDeviceHistory(device.id, query.page, query.pageSize, query.fromDate || undefined, query.toDate || undefined, query.errorOnly);

			if (response.success && response.data) {
				setDeviceHistory(response.data.data || []);

				if (response.data.meta) {
					setTotalPages(response.data.meta.last_page || 0);
					setFrom(response.data.meta.from || 0);
					setTo(response.data.meta.to || 0);
					setTotalRecords(response.data.meta.total || 0);
				}
			} else {
				toast({
					title: t("history:paginationErrorTitle"),
					description: t("history:paginationErrorDescription"),
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("history:paginationErrorTitle"),
				description: t("history:unexpectedErrorDescription"),
				variant: "destructive",
			});
		} finally {
			if (isInitialLoad) {
				setIsInitialLoad(false);
			}
		}
	};

	useEffect(() => {
		loadHistoryData();
	}, [device.id, query]);

	const handlePreviousPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page - 1,
		}));
	};

	const handleNextPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page + 1,
		}));
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setQuery((prev) => ({
			...prev,
			pageSize: newPageSize,
			page: 1,
		}));
	};

	return (
		<div>
			<div className="">
				<DeviceHistoryDataTable
					columns={columns}
					data={deviceHistory}
					sorting={[]}
					pageSize={query.pageSize}
					onSortingChange={() => {}}
					onPageSizeChange={handlePageSizeChange}
					loading={loading}
					isInitialLoad={isInitialLoad}
					fromDate={fromDateInput}
					onFromDateChange={setFromDateInput}
					toDate={toDateInput}
					onToDateChange={setToDateInput}
					errorOnly={query.errorOnly}
					onErrorOnlyChange={(val) => setQuery((prev) => ({ ...prev, errorOnly: val, page: 1 }))}
				/>{" "}
			</div>
			{/* Pagination Controls */}
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					<p>
						{t("pagination:showing", {
							from,
							to,
							total: totalRecords,
						})}
					</p>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviousPage}
						disabled={query.page <= 1}
					>
						{t("pagination:previous")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={query.page >= totalPages}
					>
						{t("pagination:next")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EnhancedTableContainer;
