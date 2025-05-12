"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Device } from "@/api/devices/model";
import { useDevices } from "@/hooks/useDevices";
import { useToast } from "@/hooks/use-toast";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import { useTranslation } from "react-i18next";

interface AddDeviceToUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	device: Device;
}

export function AddDeviceToUserModal({ open, onOpenChange, device }: AddDeviceToUserModalProps) {
	const { t } = useTranslation("deviceManagement");
	const [ownName, setOwnName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const { addDeviceToUser, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const { toast } = useToast();

	const handleSubmit = async () => {
		try {
			const result = await addDeviceToUser(device.id, userEmail, ownName);
			setStatusInf(result.status || error || null);
			if (result.success) {
				setStatusInf(null);
				toast({
					title: t("addDeviceToUser.toastSuccess"),
					description: t("addDeviceToUser.toastDescription", {
						deviceId: device.id,
						name: ownName,
						email: userEmail,
					}),
				});
				customOnOpenChange(false);
			}
		} catch {
			toast({
				title: t("addDeviceToUser.toastError"),
				description: t("addDeviceToUser.toastErrorDescription"),
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		setOwnName("");
		setUserEmail("");
		setStatusInf(null);
	}, [device]);

	const customOnOpenChange = (open: boolean) => {
		setTimeout(() => {
			setOwnName("");
			setUserEmail("");
			setStatusInf(null);
		}, 500);

		onOpenChange(open);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={customOnOpenChange}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">{t("addDeviceToUser.title")}</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">{t("addDeviceToUser.description", { deviceId: device.id })}</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<p className="text-sm">{t("addDeviceToUser.instruction")}</p>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						className="space-y-6"
					>
						{statusInf && (
							<AuthSessionStatus
								className=""
								status={statusInf}
							/>
						)}

						<div className="grid gap-4">
							<div className="space-y-2">
								<Label
									htmlFor="userEmail"
									className="text-sm font-medium"
								>
									{t("addDeviceToUser.emailLabel")}
								</Label>
								<Input
									id="userEmail"
									type="email"
									placeholder={t("addDeviceToUser.emailPlaceholder")}
									value={userEmail}
									onChange={(e) => setUserEmail(e.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="deviceName"
									className="text-sm font-medium"
								>
									{t("addDeviceToUser.nameLabel")}
								</Label>
								<Input
									id="deviceName"
									placeholder={t("addDeviceToUser.namePlaceholder")}
									value={ownName}
									onChange={(e) => setOwnName(e.target.value)}
								/>
							</div>
						</div>

						<DialogFooter className="pt-4 flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={loading}
							>
								{t("common.cancel")}
							</Button>
							<ButtonWithSpinner
								onClick={handleSubmit}
								isLoading={loading}
								label={t("addDeviceToUser.addDevice")}
							/>
						</DialogFooter>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
