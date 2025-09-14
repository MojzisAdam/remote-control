import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import InputError from "@/components/InputError";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { Device, DeviceDescription } from "@/api/devices/model";
import { InfoItem } from "@/components/dashboard/DeviceBasicInfo";
import { DatePicker } from "@/components/DatePicker";
import { useTranslation } from "react-i18next";

interface DeviceDescriptionEditorProps {
	device: Device;
	updateDeviceSheet: (updateDeviceSheet: Device) => void;
}

const DeviceDescriptionEditor: React.FC<DeviceDescriptionEditorProps> = ({ device, updateDeviceSheet }) => {
	const { t } = useTranslation("dashboard");
	const { t: global } = useTranslation("global");
	const { editDeviceDescription, loading, error } = useDevices();

	const [isEditing, setIsEditing] = useState(false);
	const [editedDescription, setEditedDescription] = useState<DeviceDescription | null>(device.description || null);
	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);

	const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});

	if (!device || !editedDescription) {
		return null;
	}

	const handleSave = async () => {
		try {
			if (!editedDescription) {
				setStatusInf(global("errors.empty-inputs"));
				return;
			}
			const result = await editDeviceDescription(device.id, editedDescription);
			setErrorsInf(result.errors || {});
			setStatusInf(result.status || error || null);

			if (result.success) {
				device.description = editedDescription;
				setIsEditing(false);
				setErrorsInf({});
				setStatusInf(null);
				setEditedFields({});
				updateDeviceSheet(device);
			}
		} catch {
			setStatusInf(global("general-error-message"));
		}
	};

	const handleInputChange = (field: string, value: string | boolean | number | null) => {
		setEditedDescription((prev) => {
			if (!prev) return prev;
			return { ...prev, [field]: value };
		});

		setEditedFields((prev) => {
			const originalValue = device.description ? device.description[field as keyof DeviceDescription] : null;
			const isEdited = value !== (originalValue ?? null);
			if (!isEdited) {
				const rest = Object.fromEntries(Object.entries(prev).filter(([key]) => key !== field));
				return rest;
			}

			return { ...prev, [field]: true };
		});
	};

	const handleCancel = () => {
		if (!device.description) return;

		setEditedDescription(device.description);
		setIsEditing(false);
		setErrorsInf({});
		setStatusInf(null);

		setEditedFields({});
	};

	return (
		<div className="relative border rounded-lg shadow-lg bg-card text-card-foreground p-6 mb-6 max-sm:px-4">
			<h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">{t("more-info-sheet.device-description.title")}</h3>
			{!isEditing ? (
				device.description &&
				(device.description.owner ||
				device.description.zip_code ||
				device.description.city ||
				device.description.address ||
				device.description.outdoor_unit_type ||
				device.description.installation_date ||
				device.description.description ? (
					<div className="space-y-3 text-gray-700">
						{device.description.owner && (
							<InfoItem
								label={t("more-info-sheet.device-description.owner")}
								value={device.description.owner}
							/>
						)}
						{(device.description.zip_code || device.description.city || device.description.address) && (
							<InfoItem
								label={t("more-info-sheet.device-description.location")}
								value={[device.description.address, device.description.city, device.description.zip_code].filter(Boolean).join(", ")}
							/>
						)}
						{device.description.outdoor_unit_type && (
							<InfoItem
								label={t("more-info-sheet.device-description.outdoor_unit_type")}
								value={device.description.outdoor_unit_type}
							/>
						)}
						{device.description.installation_date && (
							<InfoItem
								label={t("more-info-sheet.device-description.Installed_on")}
								value={new Date(device.description.installation_date).toLocaleDateString()}
							/>
						)}
						{device.description.description && (
							<InfoItem
								label={t("more-info-sheet.device-description.description")}
								value={device.description.description}
							/>
						)}
					</div>
				) : (
					<p className="text-gray-500">{t("more-info-sheet.device-description.not-set")}</p>
				))
			) : (
				<div className="space-y-3">
					<div>
						{statusInf && (
							<AuthSessionStatus
								className="mb-4"
								status={statusInf}
							/>
						)}
					</div>
					{/* Input Fields */}
					{[
						{ label: t("more-info-sheet.device-description.owner"), field: "owner" as keyof DeviceDescription },
						{ label: t("more-info-sheet.device-description.city"), field: "city" as keyof DeviceDescription },
						{ label: t("more-info-sheet.device-description.address"), field: "address" as keyof DeviceDescription },
						{ label: t("more-info-sheet.device-description.zip_code"), field: "zip_code" as keyof DeviceDescription },
						{ label: t("more-info-sheet.device-description.outdoor_unit_type"), field: "outdoor_unit_type" as keyof DeviceDescription },
						{ label: t("more-info-sheet.device-description.description"), field: "description" as keyof DeviceDescription },
					].map(({ label, field }) => (
						<div key={field}>
							<Label htmlFor={field}>{label}</Label>
							<Input
								name={field}
								id={field}
								value={editedDescription[field] || ""}
								onChange={(e) => handleInputChange(field, e.target.value)}
								className={editedFields[field] ? "border-2 border-blue-500 ring-blue-500 focus-visible:ring-blue-500" : ""}
							/>
							{errorsInf?.[field] && (
								<InputError
									messages={errorsInf[field]}
									className="mt-2"
								/>
							)}
						</div>
					))}

					{/* Date Picker */}
					<div className="flex flex-col gap-y-1 pt-2">
						<Label htmlFor="installation_date">{t("more-info-sheet.device-description.installation_date")}</Label>
						<DatePicker
							value={editedDescription.installation_date || null}
							onChange={(newDate) => handleInputChange("installation_date", newDate)}
							className={editedFields["installation_date"] ? "border-2 border-blue-500 ring-blue-500 focus-visible:ring-blue-500" : ""}
						/>
						{errorsInf?.["installation_date"] && (
							<InputError
								messages={errorsInf.installation_date}
								className="mt-2"
							/>
						)}
					</div>
				</div>
			)}
			{/* Actions */}
			<div className="absolute top-4 right-4">
				<div className="flex justify-end gap-2">
					{isEditing ? (
						loading ? (
							<Button
								variant="secondary"
								size="icon"
								disabled
							>
								<Loader2 className="animate-spin" />
							</Button>
						) : (
							<>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleCancel}
								>
									<X />
								</Button>
								<Button
									variant="secondary"
									size="icon"
									onClick={handleSave}
								>
									<Check />
								</Button>
							</>
						)
					) : (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsEditing(true)}
						>
							<Pencil />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DeviceDescriptionEditor;
