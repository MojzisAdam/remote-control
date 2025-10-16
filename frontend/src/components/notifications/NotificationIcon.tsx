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
import { isDeviceNotification, isAutomationNotification } from "@/constants/notificationTypes";
import DeviceNotificationItem from "./DeviceNotificationItem";
import AutomationNotificationItem from "./AutomationNotificationItem";
import GenericNotificationItem from "./GenericNotificationItem";

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

	const handleNotificationClick = async (notification: Notification) => {
		await markAsSeen(notification.id);
		refetch();
		setOpen(false);

		// Handle different notification types
		if (isDeviceNotification(notification.type?.id) && notification.device_id) {
			// Device notification - navigate to device notifications
			queryClient.invalidateQueries({ queryKey: ["device-notifications", notification.device_id] });
			queryClient.setQueryData(["highlighted-notification"], notification.id);
			navigate(routes.notifications(notification.device_id));
		} else if (isAutomationNotification(notification.type?.id)) {
			// Automation notification - navigate to automations page
			navigate(routes.automations);
		} else {
			// Other notifications - for now just log, could navigate to a general notifications page
			console.log("Unhandled notification type:", notification.type);
		}
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
						<div className="absolute text-xs top-0 right-0 p-1 leading-none translate-x-1/4 -translate-y-1/4 rounded-full h-4 w-auto min-w-4 text-center flex items-center justify-center text-white dark:text-black bg-black dark:bg-white">
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
								{isDeviceNotification(notification.type?.id) ? (
									<DeviceNotificationItem
										notification={notification}
										onNotificationClick={handleNotificationClick}
										formatTimestamp={formatTimestamp}
									/>
								) : isAutomationNotification(notification.type?.id) ? (
									<AutomationNotificationItem
										notification={notification}
										onNotificationClick={handleNotificationClick}
										formatTimestamp={formatTimestamp}
									/>
								) : (
									<GenericNotificationItem
										notification={notification}
										onNotificationClick={handleNotificationClick}
										formatTimestamp={formatTimestamp}
									/>
								)}
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

export default NotificationIcon;
