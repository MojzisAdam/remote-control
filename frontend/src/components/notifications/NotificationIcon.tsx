import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/api/notifications/model";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import routes from "@/constants/routes";
import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";
import { cs, enUS } from "date-fns/locale";

const NotificationIcon: React.FC = () => {
	const { getUnseenNotifications, markAsSeen, markAllAsSeen } = useNotifications();
	const navigate = useNavigate();
	const { t } = useTranslation("global");
	const { t: tNotifications, i18n } = useTranslation("notifications");
	const selectedLocale = i18n.language === "en" ? enUS : cs;
	const queryClient = useQueryClient();
	const [open, setOpen] = React.useState(false);

	const formatTimestamp = (timestamp: string): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMins = differenceInMinutes(now, date);

		if (diffMins < 60) {
			return diffMins <= 1 ? tNotifications("justNow") : tNotifications("minutesAgo", { count: diffMins });
		}

		if (isToday(date)) {
			return tNotifications("todayAt", { time: format(date, "HH:mm", { locale: selectedLocale }) });
		}

		if (isYesterday(date)) {
			return tNotifications("yesterdayAt", { time: format(date, "HH:mm", { locale: selectedLocale }) });
		}

		return format(date, "d. MMM HH:mm", { locale: selectedLocale });
	};

	const {
		data: notifications,
		isLoading,
		error,
		refetch,
	} = useQuery<Notification[], Error>({
		queryKey: ["user-notifications"],
		queryFn: async () => {
			const result = await getUnseenNotifications();
			if (!result.success) {
				throw new Error(t("notifications.failedToLoad"));
			}
			return result.data || [];
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		refetchOnWindowFocus: false,
	});

	const unseenNotifications = notifications?.filter((n: Notification) => !n.seen) || [];
	const unseenCount = unseenNotifications.length;
	const handleNotificationClick = async (notificationId: number, deviceId: string) => {
		await markAsSeen(notificationId);
		refetch();
		// Invalidate device-specific notifications query if it exists
		queryClient.invalidateQueries({ queryKey: ["device-notifications", deviceId] });
		// Store the highlighted notification ID in React Query cache
		queryClient.setQueryData(["highlighted-notification"], notificationId);
		setOpen(false);
		navigate(routes.notifications(deviceId));
	};
	const handleMarkAllAsSeen = async () => {
		if (notifications) {
			// Use the batch method to mark all notifications as seen (limit 100)
			await markAllAsSeen(100);
			refetch();
			// Also invalidate any device notification queries that might be open
			queryClient.invalidateQueries({
				queryKey: ["device-notifications"],
				exact: false,
			});
		}
	};
	return (
		<DropdownMenu
			open={open}
			onOpenChange={setOpen}
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-transparent focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
					size="icon"
				>
					<Bell className="h-6 w-6" />
					{unseenCount > 0 && (
						<div className="absolute text-xs top-0 right-0 p-1 leading-none translate-x-1/4 -translate-y-1/4 rounded-full h-4 w-auto min-w-4 text-center flex items-center justify-center text-white dark:text-black bg-primary dark:bg-primary">
							{unseenCount > 9 ? "9+" : unseenCount}
						</div>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-80 sm:w-96 max-w-[90vw]"
			>
				<div className="flex items-center justify-between p-2">
					<DropdownMenuLabel className="font-semibold text-base m-0">{t("notifications.title")}</DropdownMenuLabel>
					{unseenCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								handleMarkAllAsSeen();
							}}
							className="h-8 px-2 text-xs hover:text-primary"
						>
							{t("notifications.markAllAsSeen")}
						</Button>
					)}
				</div>

				<DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />

				<div className="max-h-80 overflow-y-auto overflow-x-hidden py-2">
					{isLoading ? (
						<div className="p-4 text-center text-muted-foreground">
							<span className="inline-block animate-pulse">{t("notifications.loading")}</span>
						</div>
					) : error ? (
						<div className="p-4 flex items-center justify-center text-destructive gap-2">
							<AlertCircle className="h-4 w-4" />
							<span>{t("notifications.failedToLoad")}</span>
						</div>
					) : unseenCount === 0 ? (
						<div className="p-4 text-center text-muted-foreground">
							<p>{t("notifications.noNew")}</p>
						</div>
					) : (
						unseenNotifications.map((notification, index) => (
							<React.Fragment key={notification.id}>
								{index > 0 && <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />}
								<div
									className="px-2"
									onClick={(e) => {
										e.preventDefault();
										handleNotificationClick(notification.id, notification.device_id);
									}}
								>
									<div className="flex flex-col w-full p-3 space-y-2.5 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-800">
										<div className="flex flex-col gap-2">
											<div className="flex flex-row justify-between items-center w-full">
												{" "}
												<span className="text-xs text-muted-foreground">{formatTimestamp(notification.created_at)}</span>
												<div className="flex items-center gap-1">
													<span
														className={`text-xs px-2 py-0.5 rounded-full ${
															notification.error_code > 0
																? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
																: notification.error_code === 0
																? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
																: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
														}`}
													>
														{t("notifications.error")}: {notification.error_code}
													</span>
												</div>
											</div>
											<div className="flex flex-col w-full">
												{notification.own_name ? (
													<>
														<span
															className="font-medium text-sm truncate"
															title={`${notification.own_name} (${notification.device_id})`}
														>
															{notification.own_name}
														</span>
														<span className="text-xs text-muted-foreground">ID: {notification.device_id}</span>
													</>
												) : (
													<span className="font-medium text-sm">ID: {notification.device_id}</span>
												)}
											</div>
										</div>
										{notification.message && (
											<div className="pt-1 border-t border-gray-200 dark:border-gray-700">
												<p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
											</div>
										)}
									</div>
								</div>
							</React.Fragment>
						))
					)}
					{unseenCount > 99 && (
						<div className="p-4 text-center text-muted-foreground text-xs">
							<p>{t("notifications.maxLimit")}</p>
						</div>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

// Helper functions
function getErrorVariant(errorCode: number): "destructive" | "outline" | "secondary" | "default" {
	if (errorCode > 0) return "destructive";
	if (errorCode == 0) return "default";
	return "secondary";
}

// Returns CSS classes for error status indicators
function getErrorStatusClasses(errorCode: number): string {
	if (errorCode > 0) {
		return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
	}
	if (errorCode == 0) {
		return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
	}
	return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export default NotificationIcon;
