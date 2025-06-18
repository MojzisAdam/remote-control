import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import InputError from "@/components/InputError";
import { Separator } from "@/components/ui/separator";
import { useDevices } from "@/hooks/useDevices";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "@/components/ui/password-input";

interface AddDeviceModalProps {
	onSuccess: (deviceId: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddDeviceModal({ onSuccess, open, onOpenChange }: AddDeviceModalProps) {
	const { t } = useTranslation("dashboard");
	const { t: globalT } = useTranslation("global");

	const { addNewDevice, loading } = useDevices();
	const [deviceId, setDeviceId] = useState("");
	const [devicePass, setDevicePass] = useState("");

	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);

	const handleSubmit = async () => {
		try {
			const result = await addNewDevice(deviceId, devicePass);

			setErrorsInf(result.errors || {});
			setStatusInf(result.status || null);

			if (result.success) {
				onSuccess(deviceId);

				setTimeout(() => {
					setDeviceId("");
					setDevicePass("");
				});

				customOnOpenChange(false);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	const customOnOpenChange = (open: boolean) => {
		setTimeout(() => {
			setStatusInf(null);
		}, 500);

		onOpenChange(open);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={customOnOpenChange}
		>
			<DialogContent className="max-w-[450px]">
				<DialogHeader>
					<DialogTitle>{t("add-device-modal.modal-title")}</DialogTitle>
					<DialogDescription>{t("add-device-modal.modal-description")}</DialogDescription>
				</DialogHeader>
				{statusInf && (
					<AuthSessionStatus
						className="mt-2"
						status={statusInf}
					/>
				)}
				<div className="gap-4 flex flex-col">
					<input
						type="text"
						name="dummyUsername"
						autoComplete="username"
						style={{ display: "none" }}
					/>
					<input
						type="password"
						name="dummyPassword"
						autoComplete="new-password"
						style={{ display: "none" }}
					/>
					<div>
						<Label htmlFor="device_id">{t("add-device-modal.input-placeholder")}</Label>
						<Input
							id="device_id"
							type="text"
							value={deviceId}
							name="device_id"
							className="block mt-1 w-full"
							onChange={(e) => setDeviceId(e.target.value)}
							required
						/>
						{errorsInf.device_id && (
							<InputError
								messages={errorsInf.device_id}
								className="mt-2"
							/>
						)}
					</div>
					<div>
						<Label htmlFor="devicePass">{t("add-device-modal.password-placeholder")}</Label>

						<PasswordInput
							id="devicePass"
							name="devicePass"
							value={devicePass}
							className="block mt-1 w-full"
							onChange={(e) => setDevicePass(e.target.value)}
							required
							autoComplete="new-password"
						/>

						<InputError
							messages={errorsInf.password}
							className="mt-2"
						/>
					</div>
					<Separator className="my-4" />
				</div>
				<DialogFooter>
					<ButtonWithSpinner
						onClick={handleSubmit}
						className="py-3 font-medium"
						isLoading={loading}
						label={t("add-device-modal.add-button")}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
