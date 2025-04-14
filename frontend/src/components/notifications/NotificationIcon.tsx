import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/api/notifications/model";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import routes from "@/constants/routes";
import { useTranslation } from "react-i18next";

const NotificationIcon: React.FC = () => {
	const { getUnseenNotifications, markAsSeen } = useNotifications();
	const navigate = useNavigate();
	const { t } = useTranslation("global");

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
		navigate(routes.notifications(deviceId));
	};

	const handleMarkAllAsSeen = async () => {
		if (notifications) {
			await Promise.all(unseenNotifications.map((n: Notification) => markAsSeen(n.id)));
			refetch();
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative hover:bg-transparent focus:bg-transparent focus:ring-0 focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
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
				className="w-80"
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

				<DropdownMenuSeparator />

				<div className="max-h-80 overflow-y-auto overflow-x-hidden  py-1">
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
								{index > 0 && <DropdownMenuSeparator className="my-1" />}
								<div
									className="px-2"
									onClick={(e) => {
										e.preventDefault();
										handleNotificationClick(notification.id, notification.device_id);
									}}
								>
									<div className="flex flex-col w-full p-2 space-y-1 hover:bg-accent rounded-md cursor-pointer">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">
												{t("notifications.device")}: {notification.device_id}
											</span>
											<Badge
												variant={getErrorVariant(notification.error_code)}
												className="text-xs font-mediu pointer-events-none"
											>
												{t("notifications.error")}: {notification.error_code}
											</Badge>
										</div>

										{notification.message && <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>}

										<span className="text-xs text-muted-foreground">{formatTimestamp(notification.created_at)}</span>
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

function formatTimestamp(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 60) {
		return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
	}

	if (date.toDateString() === now.toDateString()) {
		return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) {
		return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	}

	return date.toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default NotificationIcon;
