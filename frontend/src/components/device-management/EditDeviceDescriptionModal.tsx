import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Device, DeviceDescription } from "@/api/devices/model";
import { format } from "date-fns";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/components/DatePicker";

interface EditDeviceDescriptionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	device: Device;
	onSave: (deviceId: string, data: Partial<DeviceDescription>) => void;
}

export function EditDeviceDescriptionModal({ open, onOpenChange, device, onSave }: EditDeviceDescriptionModalProps) {
	const { t } = useTranslation("deviceManagement");
	const { editDeviceDescriptionManage, loading, error } = useDevices();
	const [formData, setFormData] = useState<Partial<DeviceDescription>>({
		name: "",
		owner: "",
		zip_code: "",
		city: "",
		address: "",
		description: "",
		outdoor_unit_type: "",
		installation_date: null,
	});
	const [statusInf, setStatusInf] = useState<string | null>(null);

	useEffect(() => {
		if (device && device.description) {
			setFormData({
				owner: device.description.owner || "",
				zip_code: device.description.zip_code || "",
				city: device.description.city || "",
				address: device.description.address || "",
				description: device.description.description || "",
				outdoor_unit_type: device.description.outdoor_unit_type || "",
				installation_date: device.description.installation_date || null,
			});
		}
	}, [device]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDateChange = (date: string | null) => {
		setFormData((prev) => ({
			...prev,
			installation_date: date ? format(date, "yyyy-MM-dd") : null,
		}));
	};

	const handleSubmit = async () => {
		try {
			const result = await editDeviceDescriptionManage(device.id, formData);
			setStatusInf(result.status || error || null);

			if (result.success) {
				setStatusInf(null);
				onOpenChange(false);
				onSave(device.id, formData);
			}
		} catch {
			setStatusInf(t("errors.somethingWentWrong"));
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
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("editDevice.title")}</DialogTitle>
					<DialogDescription>{t("editDevice.dialogDescription", { deviceId: device.id })}</DialogDescription>
				</DialogHeader>
				{statusInf && (
					<AuthSessionStatus
						className="mb-4"
						status={statusInf}
					/>
				)}
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="owner">{t("editDevice.owner")}</Label>
							<Input
								id="owner"
								name="owner"
								value={formData.owner}
								onChange={handleChange}
								placeholder={t("editDevice.ownerPlaceholder")}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="address">{t("editDevice.address")}</Label>
							<Input
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
								placeholder={t("editDevice.addressPlaceholder")}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="city">{t("editDevice.city")}</Label>
							<Input
								id="city"
								name="city"
								value={formData.city}
								onChange={handleChange}
								placeholder={t("editDevice.cityPlaceholder")}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="zip_code">{t("editDevice.zipCode")}</Label>
							<Input
								id="zip_code"
								name="zip_code"
								value={formData.zip_code}
								onChange={handleChange}
								placeholder={t("editDevice.zipCodePlaceholder")}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="outdoor_unit_type">{t("editDevice.unitType")}</Label>
							<Input
								id="outdoor_unit_type"
								name="outdoor_unit_type"
								value={formData.outdoor_unit_type}
								onChange={handleChange}
								placeholder={t("editDevice.unitTypePlaceholder")}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="installation_date">{t("editDevice.installationDate")}</Label>
							<DatePicker
								value={formData.installation_date || null}
								onChange={(newDate) => handleDateChange(newDate)}
							/>
						</div>

						<div className="grid gap-2 md:col-span-2">
							<Label htmlFor="description">{t("editDevice.description")}</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder={t("editDevice.descriptionPlaceholder")}
								rows={4}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => customOnOpenChange(false)}
							disabled={loading}
						>
							{t("common.cancel")}
						</Button>
						<ButtonWithSpinner
							onClick={() => handleSubmit()}
							isLoading={loading}
							label={t("editDevice.saveChanges")}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
