import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "@/api/user/model";
import { useTranslation } from "react-i18next";

type DeleteUserAlertProps = {
	onSuccess: (confirmed: boolean, user: User | undefined) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | undefined;
};

export function DeleteUserAlert({ onSuccess, open, onOpenChange, user }: DeleteUserAlertProps) {
	const { t } = useTranslation("userManagement");
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("userManagement.deleteUser.title")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("userManagement.deleteUser.description", {
							email: user?.email ? user.email : t("userManagement.deleteUser.unknownEmail"),
						})}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onSuccess(false, user)}>{t("userManagement.deleteUser.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={() => onSuccess(true, user)}>{t("userManagement.deleteUser.delete")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
