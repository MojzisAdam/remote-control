"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Device } from "@/api/devices/model";
import { useDevices } from "@/hooks/useDevices";
import { useToast } from "@/hooks/use-toast";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import { useTranslation } from "react-i18next";

interface AddDeviceModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	device: Device;
}

export function AddDeviceModal({ open, onOpenChange, device }: AddDeviceModalProps) {
	const { t } = useTranslation("deviceManagement");
	const [ownName, setOwnName] = useState("");
	const { addDeviceToList, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const { toast } = useToast();

	const handleSubmit = async () => {
		try {
			const result = await addDeviceToList(device.id, ownName);
			setStatusInf(result.status || error || null);
			if (result.success) {
				setStatusInf(null);
				toast({
					title: t("addDevice.toastSuccess"),
					description: t("addDevice.toastDescription", { deviceId: device.id, name: ownName }),
				});
				onOpenChange(false);
			}
		} catch {
			toast({
				title: t("addDevice.toastError"),
				description: t("addDevice.toastErrorDescription"),
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		setOwnName("");
		setStatusInf(null);
	}, [device]);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("addDevice.title")}</DialogTitle>
					<DialogDescription>{t("addDevice.description", { deviceId: device.id })}</DialogDescription>
				</DialogHeader>
				{statusInf && (
					<AuthSessionStatus
						className=""
						status={statusInf}
					/>
				)}
				<form onSubmit={handleSubmit}>
					<p className="text-sm">{t("addDevice.instruction")}</p>
					<div className="grid gap-4 py-4">
						<Input
							placeholder={t("addDevice.namePlaceholder")}
							value={ownName}
							onChange={(e) => setOwnName(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							{t("common.cancel")}
						</Button>
						<ButtonWithSpinner
							onClick={() => handleSubmit()}
							isLoading={loading}
							label={t("addDevice.addDevice")}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
