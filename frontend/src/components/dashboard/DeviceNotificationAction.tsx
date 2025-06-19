import React from "react";
import { Device } from "@/api/devices/model";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeviceNotificationActionProps {
	device: Device;
}

const DeviceNotificationAction: React.FC<DeviceNotificationActionProps> = ({ device }) => {
	const { t } = useTranslation("dashboard");
	const navigate = useNavigate();

	const handleViewNotifications = () => {
		navigate(`/notifications/${device.id}`);
	};
	const handleViewParameterLog = () => {
		navigate(`/parameter-log/${device.id}`);
	};
	return (
		<div className="border rounded-lg shadow-lg bg-card text-card-foreground p-6 mb-6 max-sm:px-4">
			<h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">{t("more-info-sheet.actions.description")}</h3>
			<div className="grid grid-cols-2 gap-4">
				<Button
					variant="outline"
					onClick={handleViewNotifications}
					className="w-full"
					title={t("more-info-sheet.actions.notifications-button")}
				>
					<Bell className="mr-2 h-5 w-5" />
					<span className="max-sm:hidden">{t("more-info-sheet.actions.notifications-button")}</span>
				</Button>
				<Button
					variant="outline"
					onClick={handleViewParameterLog}
					className="w-full"
					title={t("more-info-sheet.actions.parameters-button")}
				>
					<ScrollText className="mr-2 h-5 w-5" />
					<span className="max-sm:hidden">{t("more-info-sheet.actions.parameters-button")}</span>
				</Button>
			</div>
		</div>
	);
};

export default DeviceNotificationAction;
