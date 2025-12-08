import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/utils";
import { useDevices } from "@/hooks/useDevices";
import StatusMessage from "@/components/ui/StatusMessage";
import { User } from "@/api/user/model";
import { useTranslation } from "react-i18next";

interface ViewDeviceUsersModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deviceId: string;
}

export function ViewDeviceUsersModal({ open, onOpenChange, deviceId }: ViewDeviceUsersModalProps) {
	const { t } = useTranslation("deviceManagement");
	const { fetchDeviceUsers, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		if (open) {
			loadUsers();
		}
	}, [open, deviceId]);

	const loadUsers = async () => {
		try {
			const result = await fetchDeviceUsers(deviceId);
			setStatusInf(result.status || error || null);

			if (result.success) {
				setUsers(result.data);
				setStatusInf(null);
			}
		} catch {
			setStatusInf(t("errors.somethingWentWrong"));
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("viewUsers.title", { deviceId })}</DialogTitle>
					<DialogDescription>{t("viewUsers.description")}</DialogDescription>
				</DialogHeader>
				{statusInf && (
					<StatusMessage
						className="mb-4"
						status={statusInf}
					/>
				)}
				<div className="mt-4">
					{loading ? (
						<div className="space-y-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("viewUsers.name")}</TableHead>
									<TableHead>{t("viewUsers.email")}</TableHead>
									<TableHead>{t("viewUsers.added")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.length > 0 ? (
									users.map((user) => (
										<TableRow key={user.id}>
											<TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{formatDateTime(user.created_at)}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center"
										>
											{t("viewUsers.noUsers")}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
