import React, { useEffect, useState, lazy, Suspense, useMemo } from "react";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { subHours, subDays, subWeeks, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ErrorAlert from "@/components/history/ErrorAlert";
import DateRangeFilter from "@/components/history/DateRangeFilter";
import NoDataMessage from "@/components/history/NoDataMessage";
import ErrorBoundary from "@/lib/error-boundary/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";
import { ChartConstantsFactory } from "@/constants/chartConstants/factory";

const CustomGraph = lazy(() => import("@/components/history/CustomGraph").then((mod) => ({ default: mod.CustomGraph })));

interface CustomGraphContainerProps {
	selectedMetrics: string[];
	device: Device;
}

const CustomGraphContainer: React.FC<CustomGraphContainerProps> = ({ selectedMetrics, device }) => {
	const { t } = useTranslation("history");
	const { customGraphData, loadCustomGraphData, loading } = useDeviceHistory();

	const [selectedFrom, setSelectedFrom] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));
	const [selectedTo, setSelectedTo] = useState<Date>(new Date());

	const [isLoading, setIsLoading] = useState(true);

	const [timeRange, setTimeRange] = useState<"day" | "hour" | "week">("day");

	const [loadingError, setLoadingError] = useState(false);

	const { toast } = useToast();

	// Get device-specific column configuration
	const availableColumnsConfig = useMemo(() => {
		return ChartConstantsFactory.getGraphColumns(device);
	}, [device]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);

			if (selectedMetrics.length > 0) {
				const result = await loadCustomGraphData(device.id, selectedMetrics, format(selectedFrom, "yyyy-MM-dd HH:mm:ss"), format(selectedTo, "yyyy-MM-dd HH:mm:ss"));
				if (!result.success) {
					setLoadingError(true);
				}
			}

			if (customGraphData.length > 0) {
				const firstEntry = new Date(customGraphData[0].cas);
				const lastEntry = new Date(customGraphData[customGraphData.length - 1].cas);

				setSelectedFrom(firstEntry);
				setSelectedTo(lastEntry);
			}
			setIsLoading(false);
		};

		fetchData();
	}, [device.id, selectedMetrics]);

	const handleFetchData = async (fromDate?: Date, toDate?: Date) => {
		const from = fromDate ?? selectedFrom;
		const to = toDate ?? selectedTo;

		const result = await loadCustomGraphData(device.id, selectedMetrics, format(from, "yyyy-MM-dd HH:mm:ss"), format(to, "yyyy-MM-dd HH:mm:ss"));

		if (!result.success) {
			toast({
				title: t("customGraphs.toast.errorTitle"),
				description: t("customGraphs.toast.errorDescription"),
			});
		}
	};

	const isDataAvailable = customGraphData && customGraphData.length > 0;

	const handleTimeRangeSelect = async (range: "day" | "hour" | "week") => {
		const now = new Date();
		let newFrom: Date;

		if (range === "hour") {
			newFrom = subHours(now, 1);
		} else if (range === "day") {
			newFrom = subDays(now, 1);
		} else {
			newFrom = subWeeks(now, 1);
		}

		setSelectedFrom(newFrom);
		setSelectedTo(now);
		setTimeRange(range);

		handleFetchData(newFrom, now);
	};

	if (loadingError) {
		return (
			<ErrorAlert
				title={t("customGraphs.errorTitle")}
				description={t("customGraphs.errorDescription")}
			/>
		);
	}

	return (
		<div className="space-y-8">
			{/* Date Range Filter */}
			<DateRangeFilter
				loading={loading}
				selectedFrom={selectedFrom}
				selectedTo={selectedTo}
				setSelectedFrom={setSelectedFrom}
				setSelectedTo={setSelectedTo}
				fetchData={handleFetchData}
				timeRange={timeRange}
				handleTimeRangeSelect={handleTimeRangeSelect}
				className="min-[1536px]:flex-col min-[1536px]:items-start max-[1020px]:flex-col max-[990px]:flex-row max-[1020px]:items-start"
			/>

			{/* Chart */}
			{isLoading ? (
				<Skeleton className="h-60 w-full" />
			) : isDataAvailable ? (
				<ErrorBoundary>
					<Suspense fallback={<Skeleton className="h-60 w-full" />}>
						<CustomGraph
							data={customGraphData}
							selectedMetrics={selectedMetrics}
							availableColumnsConfig={availableColumnsConfig}
						/>
					</Suspense>
				</ErrorBoundary>
			) : (
				<NoDataMessage />
			)}
		</div>
	);
};

export default CustomGraphContainer;
