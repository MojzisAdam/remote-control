import { useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

type DeleteCustomGraphAlertProps = {
	onSuccess: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeleteCustomGraphAlert({ onSuccess, open, onOpenChange }: DeleteCustomGraphAlertProps) {
	const { t } = useTranslation("history");

	const handleConfirm = () => {
		if (onSuccess) {
			onSuccess();
		}
		onOpenChange(false);
	};

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				handleConfirm();
			}
		};

		if (open) {
			document.addEventListener("keydown", handleKeyPress);
		}

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	}, [open]);

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("customGraphs.deleteConfirmTitle")}</AlertDialogTitle>
					<AlertDialogDescription>{t("customGraphs.deleteConfirmDescription")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)}>{t("cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm}>{t("continue")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
