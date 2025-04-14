"use client";

import { useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

type DeleteDeviceAlertProps = {
	onConfirm: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeleteDeviceAlert({ onConfirm, open, onOpenChange }: DeleteDeviceAlertProps) {
	const { t } = useTranslation("dashboard");

	const handleConfirm = () => {
		onConfirm();
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
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("more-info-sheet.delete-button.dialog.title")}</AlertDialogTitle>
					<AlertDialogDescription>{t("more-info-sheet.delete-button.dialog.description")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)}>{t("more-info-sheet.delete-button.dialog.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm}>{t("more-info-sheet.delete-button.dialog.delete")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
