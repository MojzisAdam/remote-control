import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DeviceType } from "@/api/devices/model";
import { useTranslation } from "react-i18next";

type DeleteDeviceTypeAlertProps = {
	onSuccess: (confirmed: boolean, deviceType: DeviceType | undefined) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deviceType: DeviceType | undefined;
};

export function DeleteDeviceTypeAlert({ onSuccess, open, onOpenChange, deviceType }: DeleteDeviceTypeAlertProps) {
	const { t } = useTranslation("deviceTypes");

	const getStringValue = (value: any): string => {
		return String(value || "");
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("deviceTypes.deleteAlert.title")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("deviceTypes.deleteAlert.description", {
							name: deviceType?.name ? getStringValue(deviceType.name) : t("deviceTypes.deleteAlert.unknownName"),
						})}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onSuccess(false, deviceType)}>{t("deviceTypes.deleteAlert.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={() => onSuccess(true, deviceType)}>{t("deviceTypes.deleteAlert.delete")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
