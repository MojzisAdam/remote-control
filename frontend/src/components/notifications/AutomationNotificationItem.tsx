import React from "react";
import { Notification } from "@/api/notifications/model";
import { useTranslation } from "react-i18next";
import { Bot } from "lucide-react";

interface AutomationNotificationItemProps {
	notification: Notification;
	onNotificationClick: (notification: Notification) => void;
	formatTimestamp: (timestamp: string) => string;
}

const AutomationNotificationItem: React.FC<AutomationNotificationItemProps> = ({ notification, onNotificationClick, formatTimestamp }) => {
	const { t } = useTranslation("notifications");

	return (
		<div
			className="px-2"
			onClick={(e) => {
				e.preventDefault();
				onNotificationClick(notification);
			}}
		>
			<div className="flex flex-col w-full p-3 space-y-2.5 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-800">
				<div className="flex flex-col gap-2">
					<div className="flex flex-row justify-between items-center w-full">
						<span className="text-xs text-muted-foreground">{formatTimestamp(notification.created_at)}</span>
						<div className="flex items-center gap-1">
							<Bot className="h-3 w-3" />
							<span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{t("automation")}</span>
						</div>
					</div>
					<div className="flex flex-col w-full">
						<span
							className="font-medium text-sm truncate"
							title={t("automationNotificationTitle")}
						>
							{t("automationNotificationTitle")}
						</span>
					</div>
				</div>
				{notification.message && (
					<div className="pt-1 border-t border-gray-200 dark:border-gray-700">
						<p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default AutomationNotificationItem;
