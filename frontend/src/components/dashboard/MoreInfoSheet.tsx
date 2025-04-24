import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Device } from "@/api/devices/model";
import { NotificationToggle } from "@/components/dashboard/NotificationToggle";
import { WebNotificationToggle } from "@/components/dashboard/WebNotificationToggle";
import { FavoriteToggle } from "@/components/dashboard/FavoriteToggle";
import { DeviceBasicInfo } from "@/components/dashboard/DeviceBasicInfo";
import DeviceNameEditor from "@/components/dashboard/DeviceNameEditor";
import DeviceDescriptionEditor from "@/components/dashboard/DeviceDescriptionEditor";
import { DeleteDeviceFromList } from "@/components/dashboard/DeleteDeviceFromList";
import DeviceNotificationAction from "@/components/dashboard/DeviceNotificationAction";
import { useTranslation } from "react-i18next";

interface MoreInfoSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	device: Device | undefined;
	updateDeviceSheet: (updateDeviceSheet: Device) => void;
	deleteDeviceSheet: (deviceId: string) => void;
	showNotificationActions?: boolean;
}

export function MoreInfoSheet({ open, onOpenChange, device, updateDeviceSheet, deleteDeviceSheet, showNotificationActions = true }: MoreInfoSheetProps) {
	const { t } = useTranslation("dashboard");

	if (!device) {
		return null;
	}

	const setNotifications = (enabled: boolean) => {
		device.notifications = enabled;
	};

	const setWebNotifications = (enabled: boolean) => {
		device.web_notifications = enabled;
	};

	const setFavorite = (enabled: boolean) => {
		device.favourite = enabled;
		device.favouriteOrder = 9999;
		updateDeviceSheet(device);
	};

	const onDelete = (deviceId: string) => {
		onOpenChange(false);
		deleteDeviceSheet(deviceId);
	};

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				className="!max-w-[800px] max-md:w-full max-sm:px-4"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<SheetHeader>
					<SheetTitle>
						<DeviceNameEditor
							device={device}
							updateDeviceSheet={updateDeviceSheet}
						/>
					</SheetTitle>
					<SheetDescription className="text-left">{t("more-info-sheet.description")}</SheetDescription>
				</SheetHeader>
				<div className="space-y-4 mt-4">
					{showNotificationActions && <DeviceNotificationAction device={device} />}

					<DeviceBasicInfo device={device} />

					<DeviceDescriptionEditor
						device={device}
						updateDeviceSheet={updateDeviceSheet}
					/>

					<div className="flex gap-8 max-[1100px]:flex-col  max-[1100px]:gap-4 items-stretch">
						<div className="pt-2">
							<NotificationToggle
								enabled={device.notifications ? device.notifications : false}
								onChange={setNotifications}
								deviceId={device.id}
							/>
						</div>
						<div className="pt-2">
							<WebNotificationToggle
								enabled={device.web_notifications ?? true}
								onChange={setWebNotifications}
								deviceId={device.id}
							/>
						</div>
					</div>
					<div className="flex gap-8 max-[1100px]:flex-col  max-[1100px]:gap-4 items-stretch">
						<div className="pt-2">
							<FavoriteToggle
								isFavorite={device.favourite ? device.favourite : false}
								onChange={setFavorite}
								deviceId={device.id}
							/>
						</div>
						<div className="pt-2">
							<DeleteDeviceFromList
								deviceId={device.id}
								onDelete={onDelete}
							/>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
