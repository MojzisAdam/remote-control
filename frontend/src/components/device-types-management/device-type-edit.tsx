import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Save, X, Settings, AlertCircle, Globe } from "lucide-react";
import { DeviceType } from "@/api/devices/model";
import { useDeviceTypes } from "@/hooks/useDeviceTypes";
import { createDeviceType } from "@/api/devices/actions";
import { CapabilitiesEditor } from "@/components/device-types-management/capabilities-editor";
import { MqttTopicsEditor } from "@/components/device-types-management/mqtt-topics-editor";
import InputError from "@/components/InputError";

interface DeviceTypeEditProps {
	deviceType: DeviceType | null;
	onUpdate: (deviceType: DeviceType) => void;
	onCancel: () => void;
}

export interface EditFormData {
	id: string;
	name: string;
	description: string;
	capabilities: Record<string, any>;
	mqtt_topics: Record<string, any>;
}

export function DeviceTypeEdit({ deviceType, onUpdate, onCancel }: DeviceTypeEditProps) {
	const { t, i18n } = useTranslation("deviceTypes");
	const { loading, updateExistingDeviceType } = useDeviceTypes();

	const isNewDeviceType = !deviceType;

	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [formData, setFormData] = useState<EditFormData>({
		id: "",
		name: "",
		description: "",
		capabilities: {},
		mqtt_topics: {},
	});

	// Initialize form data from device type
	useEffect(() => {
		if (deviceType) {
			setFormData({
				id: deviceType.id || "",
				name: deviceType.name || "",
				description: deviceType.description || "",
				capabilities: deviceType.capabilities || {},
				mqtt_topics: deviceType.mqtt_topics || {},
			});
		}
	}, [deviceType]);

	// Validation function to check for incomplete capabilities and topics
	const validateFormData = () => {
		const validationErrors: Record<string, string[]> = {};

		// Check for empty ID when creating new device type
		if (isNewDeviceType && !formData.id.trim()) {
			validationErrors.id = [t("deviceTypes.validation.idRequired", "ID is required")];
		}

		// Check for capabilities with empty IDs
		if (formData.capabilities && typeof formData.capabilities === "object") {
			const hasEmptyCapabilityIds = Object.keys(formData.capabilities).some((key) => key.startsWith("__temp_"));
			if (hasEmptyCapabilityIds) {
				validationErrors.capabilities = [t("deviceTypes.validation.capabilitiesWithoutId")];
			}
		}

		// Check for topics with empty names
		if (formData.mqtt_topics && typeof formData.mqtt_topics === "object") {
			const hasEmptyTopicNames = Object.keys(formData.mqtt_topics).some((key) => key.startsWith("__temp_"));
			if (hasEmptyTopicNames) {
				validationErrors.mqtt_topics = [t("deviceTypes.validation.topicsWithoutName")];
			}
		}

		return validationErrors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validate form data before submission
		const validationErrors = validateFormData();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		try {
			let result;
			if (isNewDeviceType) {
				// For new device types, use the ID from form data
				const createData = {
					id: formData.id,
					name: formData.name,
					description: formData.description,
					capabilities: formData.capabilities,
					mqtt_topics: formData.mqtt_topics,
				};
				const newDeviceType = await createDeviceType(createData);
				result = { success: true, data: newDeviceType };
			} else {
				const updateData = {
					name: formData.name,
					description: formData.description,
					capabilities: formData.capabilities,
					mqtt_topics: formData.mqtt_topics,
				};
				result = await updateExistingDeviceType(deviceType!.id, updateData);
			}

			if (result.success) {
				onUpdate(result.data);
			} else {
				setErrors(result.errors || {});
			}
		} catch (error: any) {
			setErrors({
				general: [error instanceof Error ? error.message : t("deviceTypes.notifications.genericError")],
			});
		}
	};

	// Function to generate ID from name
	const generateIdFromName = (name: string): string => {
		return name
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");
	};

	const updateField = (field: "id" | "name" | "description", value: string) => {
		setFormData((prev) => {
			const updated = {
				...prev,
				[field]: value,
			};

			// Auto-generate ID when name changes (only for new device types)
			if (field === "name" && isNewDeviceType) {
				updated.id = generateIdFromName(value);
			}

			return updated;
		});
	};

	return (
		<div className="max-w-6xl mx-auto pt-8">
			<div className="w-full">
				<form
					onSubmit={handleSubmit}
					className="space-y-8"
				>
					{/* Error Alert */}
					{errors.general && (
						<div className="flex flew-row gap-2 items-center border-2 rounded-lg border-red-700 text-red-700 px-4 py-3">
							<AlertCircle />
							<AlertDescription>{errors.general[0]}</AlertDescription>
						</div>
					)}

					{/* Basic Information */}
					<Card className="border-0 shadow-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur">
						<CardHeader className="pb-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
									<Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<CardTitle className="text-xl">{t("deviceTypes.detailPage.basicInformation")}</CardTitle>
									<p className="text-sm text-muted-foreground mt-1">{t("deviceTypes.detailPage.basicInformationDescription")}</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Information Fields */}
							<div className="space-y-6">
								{/* Name Field */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label
											htmlFor="name"
											className="text-sm font-medium"
										>
											{t("deviceTypes.columns.name")}
										</Label>
										<Badge
											variant="default"
											className="text-xs"
										>
											{t("deviceTypes.editors.required")}
										</Badge>
									</div>
									<Input
										id="name"
										type="text"
										value={formData.name}
										onChange={(e) => updateField("name", e.target.value)}
										className={`mt-1 transition-all border-primary/30 focus:border-primary ${errors.name ? "border-red-500" : ""}`}
										placeholder={t("deviceTypes.editors.placeholders.name")}
										required
									/>
									{errors.name && (
										<InputError
											messages={errors.name}
											className="mt-2"
										/>
									)}
								</div>

								{/* ID Field - only show for new device types */}
								{isNewDeviceType && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Label
												htmlFor="id"
												className="text-sm font-medium"
											>
												{t("deviceTypes.columns.id", "ID")}
											</Label>
											<Badge
												variant="default"
												className="text-xs"
											>
												{t("deviceTypes.editors.required")}
											</Badge>
										</div>
										<Input
											id="id"
											type="text"
											value={formData.id}
											onChange={(e) => updateField("id", e.target.value)}
											className={`mt-1 transition-all border-primary/30 focus:border-primary ${errors.id ? "border-red-500" : ""}`}
											placeholder={t("deviceTypes.editors.placeholders.id", "Unique identifier (auto-generated from name)")}
											required
										/>
										{errors.id && (
											<InputError
												messages={errors.id}
												className="mt-2"
											/>
										)}
										<p className="text-xs text-muted-foreground">
											{t(
												"deviceTypes.editors.idDescription",
												"This ID will be used to uniquely identify the device type. It's automatically generated from the name but can be customized."
											)}
										</p>
									</div>
								)}

								{/* Description Field */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label
											htmlFor="description"
											className="text-sm font-medium"
										>
											{t("deviceTypes.columns.description")}
										</Label>
										<Badge
											variant="outline"
											className="text-xs"
										>
											{t("deviceTypes.editors.optional")}
										</Badge>
									</div>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) => updateField("description", e.target.value)}
										className={`mt-1 transition-all min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
										placeholder={t("deviceTypes.editors.placeholders.description")}
										rows={4}
									/>
									{errors.description && (
										<InputError
											messages={errors.description}
											className="mt-2"
										/>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Capabilities */}
					<Card className="border-0 shadow-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur">
						<CardHeader className="pb-0"></CardHeader>
						<CardContent>
							<CapabilitiesEditor
								capabilities={formData.capabilities}
								onChange={(capabilities: Record<string, any>) => setFormData((prev) => ({ ...prev, capabilities }))}
							/>
							{errors.capabilities && (
								<InputError
									messages={errors.capabilities}
									className="mt-2"
								/>
							)}
						</CardContent>
					</Card>

					{/* MQTT Topics */}
					<Card className="border-0 shadow-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur">
						<CardHeader className="pb-0"></CardHeader>
						<CardContent>
							<MqttTopicsEditor
								topics={formData.mqtt_topics}
								onChange={(mqtt_topics) => setFormData((prev) => ({ ...prev, mqtt_topics }))}
							/>
							{errors.mqtt_topics && (
								<InputError
									messages={errors.mqtt_topics}
									className="mt-2"
								/>
							)}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="min-w-[120px]"
						>
							<X className="h-4 w-4 mr-2" />
							{t("global:common.actions.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
						>
							{loading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									{t("global:common.saving")}
								</div>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									{t("global:common.actions.save")}
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
