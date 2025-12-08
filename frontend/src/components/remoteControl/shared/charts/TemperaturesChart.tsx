import React, { memo, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/history/ErrorAlert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartLine } from "lucide-react";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "@/lib/error-boundary/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";
import { isDaitsuDisplay } from "@/utils/displayTypeUtils";

const SimpleChart = lazy(() => import("@/components/remoteControl/shared/charts/SimpleChart").then((mod) => ({ default: mod.SimpleChart })));

interface TemperaturesChartContainerProps {
	device: Device;
}

const TemperaturesChartContainer: React.FC<TemperaturesChartContainerProps> = ({ device }) => {
	const { t } = useTranslation("remote-control");
	const { loadCustomGraphData } = useDeviceHistory();

	const selectedMetrics = isDaitsuDisplay(device) ? ["reg_107", "reg_110", "reg_115"] : ["TS1", "TS2", "TS4"];

	const {
		data: customGraphData,
		isLoading: loading,
		error,
	} = useQuery({
		queryKey: ["temperature-chart", device.id, selectedMetrics],
		queryFn: async () => {
			const result = await loadCustomGraphData(device.id, selectedMetrics);
			if (!result.success) {
				throw new Error("Failed to load temperature chart data");
			}
			return result.data.data || [];
		},
		staleTime: 1 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 2,
		refetchOnWindowFocus: false,
	});

	const chartError = error !== null;
	const isDataAvailable = customGraphData && customGraphData.length > 0;
	if (chartError) {
		return (
			<div className="w-full">
				<h2 className="font-medium text-lg mb-4">{t("charts.temperatureTitle")}</h2>
				<ErrorAlert
					title={t("charts.errorTitle")}
					description={t("charts.errorDescription")}
				/>
			</div>
		);
	}

	return (
		<Card className="shadow-lg w-full">
			<CardHeader>
				<CardTitle className="text-xl font-bold flex items-center gap-2">
					<ChartLine />
					{t("charts.temperatures")}
				</CardTitle>
			</CardHeader>

			<CardContent className="relative min-h-[300px] w-full overflow-hidden">
				{loading ? (
					<div className="h-[300px] w-full flex items-center justify-center">
						<Skeleton className="h-[300px] w-full" />
					</div>
				) : !isDataAvailable ? (
					<div className="absolute inset-0 flex items-center justify-center text-center px-4">
						<p className="text-gray-500">{t("charts.noData")}</p>
					</div>
				) : (
					<>
						<ErrorBoundary>
							<Suspense
								fallback={
									<div className="h-[300px] w-full flex items-center justify-center">
										<Skeleton className="h-[300px] w-full" />
									</div>
								}
							>
								<SimpleChart
									data={customGraphData}
									selectedMetrics={selectedMetrics}
								/>
							</Suspense>
						</ErrorBoundary>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default memo(TemperaturesChartContainer, (prevProps, nextProps) => {
	return prevProps.device.id === nextProps.device.id && prevProps.device.display_type === nextProps.device.display_type;
});
