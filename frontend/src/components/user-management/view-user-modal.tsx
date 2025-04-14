import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/api/user/model";
import { formatDateTime } from "@/utils/utils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

type ViewUserModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: User | undefined;
};

export function ViewUserModal({ open, onOpenChange, data }: ViewUserModalProps) {
	const { t } = useTranslation("userManagement");
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("userManagement.viewUser.title")}</DialogTitle>
					<DialogDescription>{t("userManagement.viewUser.description")}</DialogDescription>
				</DialogHeader>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.firstName")}</TableCell>
							<TableCell className="text-right">{data?.first_name}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.lastName")}</TableCell>
							<TableCell className="text-right">{data?.last_name}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.email")}</TableCell>
							<TableCell className="text-right">{data?.email}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.emailVerifiedAt")}</TableCell>
							<TableCell className="text-right">{data?.email_verified_at ? formatDateTime(data.email_verified_at) : "Not Verified"}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.accountCreatedAt")}</TableCell>
							<TableCell className="text-right">{data?.created_at ? formatDateTime(data.created_at) : "Unknown"}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.has2FA")}</TableCell>
							<TableCell className="text-right">{data?.has2FA ? t("userManagement.viewUser.yes") : t("userManagement.viewUser.no")}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.roles")}</TableCell>
							<TableCell className="text-right">
								{data?.roles && data.roles.length > 0 ? (
									<ul>
										{data.roles.map((role, index) => (
											<li key={index}>{role}</li>
										))}
									</ul>
								) : (
									"No roles assigned"
								)}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="font-medium">{t("userManagement.viewUser.permissions")}</TableCell>
							<TableCell className="text-right">
								{data?.permissions && data.permissions.length > 0 ? (
									<ul>
										{data.permissions.map((permission, index) => (
											<li key={index}>{permission}</li>
										))}
									</ul>
								) : (
									t("userManagement.viewUser.noPermissions")
								)}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
