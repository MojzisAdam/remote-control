import React from "react";
import { Notification } from "@/api/notifications/model";
import { useTranslation } from "react-i18next";

interface DeviceNotificationItemProps {
	notification: Notification;
	onNotificationClick: (notification: Notification) => void;
	formatTimestamp: (timestamp: string) => string;
}

const DeviceNotificationItem: React.FC<DeviceNotificationItemProps> = ({ notification, onNotificationClick, formatTimestamp }) => {
	const { t } = useTranslation("global");

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
							{notification.error_code !== undefined && (
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
							)}
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
	);
};

export default DeviceNotificationItem;
