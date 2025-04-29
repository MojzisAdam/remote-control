import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { subHours, subDays, subWeeks, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import DateRangeFilter from "@/components/history/DateRangeFilter";
import ErrorAlert from "@/components/history/ErrorAlert";
import NoDataMessage from "@/components/history/NoDataMessage";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MonitorDown, MonitorX, Info, Maximize2, Activity } from "lucide-react";
import { useMqttLogger } from "@/hooks/useMqttLogger";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useTranslation } from "react-i18next";

const MainGraph = lazy(() => import("./MainGraph").then((mod) => ({ default: mod.MainGraph })));

interface MainGraphContainerProps {
	deviceId: string;
}

const MainGraphContainer: React.FC<MainGraphContainerProps> = ({ deviceId }) => {
	const { t } = useTranslation("history");
	const { loading, deviceHistory, hiddenLines, loadDeviceHistory, saveGraphPreferences, loadGraphPreferences } = useDeviceHistory();
	const [selectedFrom, setSelectedFrom] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));
	const [selectedTo, setSelectedTo] = useState<Date>(new Date());
	const [isLoading, setIsLoading] = useState(true);
	const [timeRange, setTimeRange] = useState<"day" | "hour" | "week">("day");
	const [isFullscreenDialog, setIsFullscreenDialog] = useState(false);

	const [loadingError, setLoadingError] = useState(false);

	const { toast } = useToast();

	const { logData, isLogging, connectionStatus, stopLogging, startLogging } = useMqttLogger({ deviceId });

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			const result = await Promise.all([loadDeviceHistory(deviceId), loadGraphPreferences(deviceId)]);
			if (!result[0].success || !result[1].success) {
				setLoadingError(true);
			}

			if (deviceHistory.length > 0) {
				const firstEntry = new Date(deviceHistory[0].cas);
				const lastEntry = new Date(deviceHistory[deviceHistory.length - 1].cas);

				setSelectedFrom(firstEntry);
				setSelectedTo(lastEntry);
			}
			setIsLoading(false);
		};

		fetchData();
	}, [deviceId]);

	const toggleFullscreenDialog = () => {
		setIsFullscreenDialog(!isFullscreenDialog);
	};

	const handleFetchData = async (fromDate?: Date, toDate?: Date) => {
		const from = fromDate ?? selectedFrom;
		const to = toDate ?? selectedTo;

		const result = await loadDeviceHistory(deviceId, format(from, "yyyy-MM-dd HH:mm:ss"), format(to, "yyyy-MM-dd HH:mm:ss"));

		if (!result.success) {
			toast({
				title: t("toast.fetchFail.title"),
				description: t("toast.fetchFail.description"),
			});
		}
	};

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

	const saveHiddenLines = async (newHiddenLines: string[]) => {
		const result = await saveGraphPreferences(deviceId, newHiddenLines);
		if (result.success) {
			toast({
				title: t("toast.saveSuccess.title"),
			});
		} else {
			toast({
				title: t("toast.saveError.title"),
				description: t("toast.saveError.description"),
			});
		}
	};

	const renderGraph = (dialogMode = false) => {
		if (isLoading) {
			return <Skeleton className={`w-full ${dialogMode ? "h-full" : "h-96"} rounded-lg`} />;
		}

		if (deviceHistory.length > 0 || (isLogging && logData.length > 0)) {
			return (
				<ErrorBoundary>
					<Suspense fallback={<Skeleton className={`w-full ${dialogMode ? "h-full" : "h-96"} rounded-lg`} />}>
						<MainGraph
							data={isLogging ? logData : deviceHistory}
							hiddenLines={hiddenLines}
							savePreferences={saveHiddenLines}
							className="w-full h-full"
							isFullscreen={dialogMode}
						/>
					</Suspense>
				</ErrorBoundary>
			);
		}

		return <NoDataMessage />;
	};

	return (
		<>
			<Card>
				<CardHeader className="max-sm:px-4">
					<CardTitle>{t("mainGraphTitle")}</CardTitle>
				</CardHeader>
				<CardContent className="max-sm:px-4">
					{loadingError ? (
						<ErrorAlert
							title={t("error.title")}
							description={t("error.description")}
						/>
					) : (
						<>
							<div className="flex flex-col min-[1300px]:flex-row w-full min-[1300px]:gap-4 mb-4">
								<DateRangeFilter
									loading={loading}
									selectedFrom={selectedFrom}
									selectedTo={selectedTo}
									setSelectedFrom={setSelectedFrom}
									setSelectedTo={setSelectedTo}
									fetchData={handleFetchData}
									timeRange={timeRange}
									handleTimeRangeSelect={handleTimeRangeSelect}
									className="items-center flex-1"
								/>

								<div className="flex items-center justify-end gap-2 min-[1300px]:w-auto h-fit max-[1300px]:mb-4 max-[990px]:flex max-[500px]:hidden">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="flex items-center justify-center gap-2 mr-2"
											>
												<Activity className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-80">
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div className="space-y-0.5">
														<h4 className="font-medium">{t("liveLogging.title")}</h4>
														<p className="text-sm text-muted-foreground">{t("liveLogging.description")}</p>
													</div>
													<Switch
														checked={isLogging}
														onCheckedChange={(checked) => (checked ? startLogging() : stopLogging())}
													/>
												</div>

												<div className="pt-2 border-t">
													<div className="flex items-center gap-2 mb-2">
														<Info className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm font-medium">{t("liveLogging.statusTitle")}</span>
													</div>
													<p className="text-sm text-muted-foreground">
														{t("liveLogging.status")}: <span className="font-medium">{t(`mqttStatus.${connectionStatus}`)}</span>
													</p>
													<p className="text-xs text-muted-foreground mt-2">{t("liveLogging.note")}</p>
												</div>
											</div>
										</PopoverContent>
									</Popover>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													onClick={toggleFullscreenDialog}
													variant="outline"
												>
													<Maximize2 className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>{t("fullscreen.expand")}</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>

							{renderGraph(false)}
						</>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={isFullscreenDialog}
				onOpenChange={setIsFullscreenDialog}
			>
				<DialogContent className="max-w-[98vw] max-h-[96vh] w-full h-full p-2 sm:p-2 flex flex-col overflow-scroll">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle className="sr-only">{t("mainGraphTitle")}</DialogTitle>
						<DialogDescription className="hidden sm:block sr-only">{t("fullscreenGraphDescription", "This is a fullscreen view of the device graph.")}</DialogDescription>
					</DialogHeader>
					<div className="flex-grow  pt-6">{renderGraph(true)}</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default MainGraphContainer;
