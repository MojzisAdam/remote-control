"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { Label } from "@/components/ui/label";
import { DeleteDeviceAlert } from "@/components/dashboard/DeleteDeviceAlert";
import { useTranslation } from "react-i18next";

interface DeleteDeviceProps {
	deviceId: string;
	onDelete: (deviceId: string) => void;
}

export function DeleteDeviceFromList({ deviceId, onDelete }: DeleteDeviceProps) {
	const { t } = useTranslation("dashboard");
	const { t: globalT } = useTranslation("global");

	const { deleteDevice, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);

	const handleDelete = async () => {
		try {
			const result = await deleteDevice(deviceId);
			setStatusInf(result.status || error || null);
			if (result.success) {
				setStatusInf(null);
				onDelete(deviceId);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	return (
		<>
			<Card className="w-full max-w-md p-2 py-4 max-sm:px-0 h-full">
				<CardContent className="flex items-center justify-between p-2 px-4 gap-4 space-x-2">
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Label>{t("more-info-sheet.delete-button.title")}</Label>
						</div>
						<p className="text-sm text-muted-foreground">{t("more-info-sheet.delete-button.description")}</p>
					</div>
					<div className="relative">
						<Button
							variant="outline"
							onClick={() => setIsAlertOpen(true)}
							disabled={loading}
						>
							{loading ? (
								<Loader2
									className="animate-spin"
									size={16}
								/>
							) : (
								<Trash className="h-5 w-5 text-gray-700 dark:text-white" />
							)}
						</Button>
					</div>
				</CardContent>
				<div className="flex items-center justify-between px-4">
					{statusInf && (
						<AuthSessionStatus
							className="mb-4"
							status={statusInf}
						/>
					)}
				</div>
			</Card>

			<DeleteDeviceAlert
				open={isAlertOpen}
				onOpenChange={setIsAlertOpen}
				onConfirm={handleDelete}
			/>
		</>
	);
}
