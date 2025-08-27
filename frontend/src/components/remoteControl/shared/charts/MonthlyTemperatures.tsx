import React, { memo, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/history/ErrorAlert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";
import { getChartDeviceType } from "@/utils/deviceTypeUtils";

const SimpleChart = lazy(() => import("./MonthlyTemperatureChart").then((mod) => ({ default: mod.SimpleChart })));

interface MonthlyTemperaturesContainerProps {
	device: Device;
}

const MonthlyTemperaturesContainer: React.FC<MonthlyTemperaturesContainerProps> = ({ device }) => {
	const { t } = useTranslation("remote-control");
	const { loadMonthlyTemperatures } = useDeviceHistory();

	const deviceType = getChartDeviceType(device);

	const {
		data: temperatureResponse,
		isLoading: loading,
		error,
	} = useQuery({
		queryKey: ["temperature-chart", device.id],
		queryFn: async () => {
			const result = await loadMonthlyTemperatures(device.id);
			if (!result.success) {
				throw new Error("Failed to load temperature chart data");
			}
			return result.data;
		},
		staleTime: 1 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 2,
		refetchOnWindowFocus: false,
	});

	const chartError = error !== null;
	const temperatureData = temperatureResponse?.data || [];
	const sensors = temperatureResponse?.meta?.sensors || [];
	const isDataAvailable = temperatureData && temperatureData.length > 0;

	if (chartError) {
		return (
			<div className="w-full">
				<h2 className="font-medium text-lg mb-4">{t("charts.monthlyTitle")}</h2>
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
					<BarChart3 />
					{t("charts.monthlyAverages")}
				</CardTitle>
			</CardHeader>

			<CardContent className="relative min-h-[300px] w-full overflow-hidden">
				{loading ? (
					<div className="h-[300px] w-full flex items-center justify-center">
						<Skeleton className="h-[300px] w-full" />
					</div>
				) : !isDataAvailable ? (
					<div className="absolute inset-0 flex items-center justify-center text center px-4">
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
									data={temperatureData}
									sensors={sensors}
								/>
							</Suspense>
						</ErrorBoundary>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default memo(MonthlyTemperaturesContainer, (prevProps, nextProps) => {
	return prevProps.device.id === nextProps.device.id && prevProps.device.display_type === nextProps.device.display_type;
});
