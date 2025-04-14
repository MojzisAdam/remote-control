import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useNotifications } from "@/hooks/useNotifications";
import DeviceNotFound from "@/components/deviceNotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Bell, Eye, ChevronDown, ChevronUp, Clock, Loader2 } from "lucide-react";
import deviceErrors from "@/utils/deviceErrors";
import PageHeading from "@/components/PageHeading";
import { useQueryClient } from "@tanstack/react-query";
import usePageTitle from "@/hooks/usePageTitle";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";
import { cs, enUS } from "date-fns/locale";

const DeviceNotificationsPage: React.FC = () => {
	const { id: deviceId } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const { t, i18n } = useTranslation("notifications");
	const selectedLocale = i18n.language === "en" ? enUS : cs;

	const { getDeviceNotifications, markAsSeen, notifications, pagination, loadMoreDeviceNotifications } = useNotifications();

	const { toast } = useToast();

	const { setLastVisited } = useUserManagement();
	const { currentDevice, isLoading, notFound, loadDevice } = useDeviceContext();

	const [loadingNotifications, setLoadingNotifications] = useState(true);
	const [expandedNotifications, setExpandedNotifications] = useState<number[]>([]);

	const [loadingMore, setLoadingMore] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	usePageTitle(t("pageTitle", { deviceId }));

	const loadMore = async () => {
		if (currentDevice && typeof deviceId === "string") {
			setLoadingMore(true);
			await loadMoreDeviceNotifications(deviceId);
			setLoadingMore(false);
		}
	};

	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (entry.isIntersecting && pagination?.hasMore && !loadingNotifications && !loadingMore) {
				loadMore();
			}
		},
		[loadingMore, pagination]
	);

	useEffect(() => {
		const observer = new IntersectionObserver(handleObserver, {
			rootMargin: "0px 0px 200px 0px",
			threshold: 0.1,
		});

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}
		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [pagination, loadingNotifications]);

	useEffect(() => {
		const fetchData = async () => {
			if (typeof deviceId === "string") {
				await loadDevice(deviceId);
				if (deviceId) {
					setLastVisited(deviceId);
				}
			}
		};
		fetchData();
	}, [deviceId]);

	const fetchNotifications = async () => {
		if (currentDevice && typeof deviceId === "string") {
			setLoadingNotifications(true);
			const result = await getDeviceNotifications(deviceId);
			if (result.success) {
			}
			setLoadingNotifications(false);
		}
	};

	useEffect(() => {
		if (currentDevice) {
			fetchNotifications();
		}
	}, [currentDevice]);

	const handleMarkAllAsSeen = async () => {
		const unseenNotifications = notifications.filter((n) => !n.seen);
		if (unseenNotifications.length > 0) {
			try {
				await Promise.all(unseenNotifications.map((n) => markAsSeen(n.id)));
				queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
				toast({
					title: t("success"),
					description: t("markedAllAsSeen", { count: unseenNotifications.length }),
					duration: 3000,
				});
			} catch {
				toast({
					title: t("errorTitle"),
					description: t("errorMarkingAllAsSeen"),
					variant: "destructive",
					duration: 5000,
				});
			}
		}
	};

	const handleMarkAsSeen = async (notificationId: number) => {
		try {
			await markAsSeen(notificationId);
			queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
			toast({
				title: t("success"),
				description: t("markedAsSeen"),
				duration: 2000,
			});
		} catch {
			toast({
				title: t("errorTitle"),
				description: t("errorMarkingAsSeen"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const toggleExpand = (notificationId: number) => {
		setExpandedNotifications((prev) => (prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId]));

		// Mark as seen when expanded if not already seen
		const notification = notifications.find((n) => n.id === notificationId);
		if (notification && !notification.seen) {
			handleMarkAsSeen(notificationId);
		}
	};

	const isExpanded = (notificationId: number) => {
		return expandedNotifications.includes(notificationId);
	};

	const getErrorVariant = (errorCode: number): "destructive" | "outline" | "secondary" | "default" => {
		if (errorCode > 0) return "destructive";
		if (errorCode == 0) return "default";
		return "secondary";
	};

	const formatTimestamp = (timestamp: string): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMins = differenceInMinutes(now, date);

		if (diffMins < 60) {
			return diffMins <= 1 ? t("justNow") : t("minutesAgo", { count: diffMins });
		}

		if (isToday(date)) {
			return t("todayAt", { time: format(date, "HH:mm", { locale: selectedLocale }) });
		}

		if (isYesterday(date)) {
			return t("yesterdayAt", { time: format(date, "HH:mm", { locale: selectedLocale }) });
		}

		return format(date, "d. MMM HH:mm", { locale: selectedLocale });
	};

	const getFormattedDate = (timestamp: string): string => {
		const date = new Date(timestamp);
		return format(date, "EEEE, d. MMMM yyyy", { locale: selectedLocale });
	};

	const getFormattedTime = (timestamp: string): string => {
		const date = new Date(timestamp);
		return format(date, "HH:mm:ss", { locale: selectedLocale });
	};

	if (notFound) {
		return <DeviceNotFound />;
	}

	const unseenNotifications = notifications.filter((n) => !n.seen);

	return (
		<>
			<div className="notifications-page flex flex-col gap-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<PageHeading
						icon={Bell}
						heading={t("heading")}
						device={currentDevice}
						initialLoading={isLoading}
					/>

					{!isLoading && !loadingNotifications && unseenNotifications.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleMarkAllAsSeen}
							className="flex items-center gap-1"
						>
							<CheckCircle className="h-4 w-4" />
							{t("markAllAsSeen")}
						</Button>
					)}
				</div>

				{isLoading || loadingNotifications ? (
					<div className="space-y-4">
						<Skeleton className="w-full h-20" />
						<Skeleton className="w-full h-20" />
						<Skeleton className="w-full h-20" />
					</div>
				) : notifications.length === 0 ? (
					<div className="py-12 mt-8 flex flex-col items-center justify-center text-muted-foreground">
						<Bell className="h-12 w-12 mb-4 opacity-30" />
						<p className="text-lg text-center">{t("noNotifications")}</p>
					</div>
				) : (
					<div className="space-y-4">
						{notifications.map((notification, index) => (
							<Card
								key={notification.id}
								className={`overflow-hidden transition-all ${notification.seen ? "bg-muted/40" : "bg-background border-l-primary"}`}
							>
								<div
									className="p-4 cursor-pointer"
									onClick={() => toggleExpand(notification.id)}
								>
									<div className="flex flex-wrap justify-between items-center gap-2">
										<div className="flex items-center gap-2">
											<Badge
												variant={getErrorVariant(notification.error_code)}
												className="text-xs font-medium pointer-events-none"
											>
												{t("error")}: {notification.error_code}
											</Badge>

											{!notification.seen && (
												<Badge
													variant="outline"
													className="bg-blue-100 dark:bg-blue-950 text-xs pointer-events-none"
												>
													{t("new")}
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">{formatTimestamp(notification.created_at)}</span>

											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
											>
												{isExpanded(notification.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
											</Button>
										</div>
									</div>

									{notification.message && <p className="mt-2 text-sm line-clamp-2">{notification.message}</p>}
								</div>

								{isExpanded(notification.id) && (
									<div className="px-4 pb-4 pt-0 bg-muted/20">
										<div className="border-t pt-3 space-y-3">
											<div className="flex flex-col gap-1">
												<h4 className="text-sm font-medium">{t("details")}</h4>
												<div className="text-sm space-y-2">
													<div className="flex items-start gap-2">
														<AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div>
															<span className="font-medium">{t("errorCode")}:</span> <span className="text-muted-foreground">{notification.error_code} </span>
														</div>
													</div>

													{currentDevice && (
														<div className="flex items-start gap-2">
															<AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div>
																<span className="font-medium">{t("errorExplanation")}:</span>{" "}
																<span className="text-muted-foreground">{deviceErrors.error(notification.error_code, parseInt(currentDevice.fw_version || "0"))}</span>
															</div>
														</div>
													)}

													<div className="flex items-start gap-2">
														<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div>
															<div>
																<span className="font-medium">{t("date")}:</span> {getFormattedDate(notification.created_at)}
															</div>
															<div>
																<span className="font-medium">{t("time")}:</span> {getFormattedTime(notification.created_at)}
															</div>
														</div>
													</div>

													{notification.message && (
														<div className="flex items-start gap-2">
															<AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div>
																<span className="font-medium">{t("message")}:</span>
																<div className="mt-1 text-muted-foreground whitespace-pre-wrap">{notification.message}</div>
															</div>
														</div>
													)}

													{notification.additional_data && (
														<div className="flex items-start gap-2">
															<AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div>
																<span className="font-medium">{t("additionalData")}:</span>
																<pre className="mt-1 text-xs p-2 bg-muted rounded-md overflow-x-auto">
																	{typeof notification.additional_data === "object"
																		? JSON.stringify(notification.additional_data, null, 2)
																		: notification.additional_data}
																</pre>
															</div>
														</div>
													)}
												</div>
											</div>

											{!notification.seen && (
												<div className="flex justify-end">
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleMarkAsSeen(notification.id);
														}}
														className="text-xs flex items-center gap-1 h-8"
													>
														<Eye className="h-3 w-3" />
														{t("markAsSeen")}
													</Button>
												</div>
											)}
										</div>
									</div>
								)}
								{index === notifications.length - 1 && (
									<div
										ref={loadMoreRef}
										className="h-1"
									/>
								)}
							</Card>
						))}
						{loadingMore && (
							<div className="flex justify-center py-4">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
							</div>
						)}

						{/* When there are no more notifications to load */}
						{!loadingMore && pagination && !pagination.hasMore && notifications.length > 0 && (
							<div className="text-center py-4 text-sm text-muted-foreground">{t("noMoreNotifications")}</div>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default DeviceNotificationsPage;
