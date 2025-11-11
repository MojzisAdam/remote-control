import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HardDrive } from "lucide-react";
import { Device } from "@/api/devices/model";
import { getConditionTypes, DAYS_OF_WEEK, getDayNameKey } from "@/constants/automation";
import { useTranslation } from "react-i18next";

interface ConditionConfigurationProps {
	conditionType: string;
	config: any;
	devices: Device[];
	onConfigChange: (key: string, value: any) => void;
	onConditionTypeChange?: (conditionType: string) => void;
	getCapabilitiesForRole: (deviceId: string) => Array<{
		value: string;
		label: string;
		unit?: string;
		type?: string;
		min_value?: number;
		max_value?: number;
		increment_value?: number;
		values?: Array<{ label: string; value: any }>;
		labels?: Record<string, string>;
	}>;
}

const ConditionConfiguration: React.FC<ConditionConfigurationProps> = ({ conditionType, config, devices, onConfigChange, onConditionTypeChange, getCapabilitiesForRole }) => {
	const { t } = useTranslation("automations");
	const selectedDeviceId = config.device_id;
	const fieldOptions = selectedDeviceId ? getCapabilitiesForRole(selectedDeviceId) : [];

	const selectedField = fieldOptions.find((f) => f.value === config.field);

	const getOperatorOptions = () => {
		if (!selectedField) return [];

		switch (selectedField.type) {
			case "number":
				return [
					{ value: "=", label: t("builder.isEqualTo") },
					{ value: "!=", label: t("builder.isNotEqualTo") },
					{ value: ">", label: t("builder.isGreaterThan") },
					{ value: "<", label: t("builder.isLessThan") },
					{ value: ">=", label: t("builder.isGreaterOrEqual") },
					{ value: "<=", label: t("builder.isLessOrEqual") },
				];
			case "boolean":
			case "enum":
				return [
					{ value: "=", label: t("builder.is") },
					{ value: "!=", label: t("builder.isNot") },
				];
			default:
				return [
					{ value: "=", label: t("builder.isEqualTo") },
					{ value: "!=", label: t("builder.isNotEqualTo") },
				];
		}
	};

	const renderValueInput = () => {
		if (!selectedField) return null;
		switch (selectedField.type) {
			case "boolean": {
				const getBooleanSelectValue = () => {
					if (config.value === null || config.value === undefined) return "";
					const boolValue = config.value === "1" || config.value === true || config.value === "true";
					return boolValue ? "true" : "false";
				};
				return (
					<div>
						<Label htmlFor="value">{t("builder.value")}</Label>
						<Select
							value={getBooleanSelectValue()}
							onValueChange={(value) => onConfigChange("value", value === "true")}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("builder.selectValue")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">{selectedField.labels?.["1"] || "True"}</SelectItem>
								<SelectItem value="false">{selectedField.labels?.["0"] || "False"}</SelectItem>
							</SelectContent>
						</Select>
					</div>
				);
			}
			case "number":
				return (
					<div>
						<Label htmlFor="value">
							{t("builder.value")} {selectedField.unit && `(${selectedField.unit})`}
						</Label>
						<Input
							id="value"
							type="number"
							min={selectedField.min_value}
							max={selectedField.max_value}
							step={selectedField.increment_value || 1}
							value={config.value || ""}
							onChange={(e) => onConfigChange("value", parseFloat(e.target.value))}
							placeholder={
								selectedField.min_value !== undefined && selectedField.max_value !== undefined
									? t("builder.enterValueWithRange", { min: selectedField.min_value, max: selectedField.max_value })
									: t("builder.enterValue")
							}
						/>
					</div>
				);

			case "enum":
				return (
					<div>
						<Label htmlFor="value">{t("builder.value")}</Label>
						<Select
							value={config.value?.toString() || ""}
							onValueChange={(value) => {
								const numValue = parseFloat(value);
								onConfigChange("value", isNaN(numValue) ? value : numValue);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("builder.selectValue")} />
							</SelectTrigger>
							<SelectContent>
								{selectedField.values?.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value.toString()}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				);

			default:
				return (
					<div>
						<Label htmlFor="value">{t("builder.value")}</Label>
						<Input
							id="value"
							type="text"
							value={config.value || ""}
							onChange={(e) => onConfigChange("value", e.target.value)}
							placeholder={t("builder.enterValue")}
						/>
					</div>
				);
		}
	};

	return (
		<div className="space-y-4">
			{/* Condition type */}
			<div>
				<Label htmlFor="condition-type">{t("builder.conditionType")}</Label>
				<Select
					value={conditionType || ""}
					onValueChange={(value) => onConditionTypeChange?.(value)}
				>
					<SelectTrigger>
						<SelectValue placeholder={t("builder.selectConditionType")} />
					</SelectTrigger>
					<SelectContent>
						{getConditionTypes().map((option: any) => (
							<SelectItem
								key={option.value}
								value={option.value}
							>
								{t(option.labelKey)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Simple condition */}
			{conditionType === "simple" && (
				<>
					{/* Device */}
					<div>
						<Label htmlFor="device">{t("builder.device")}</Label>
						<Select
							value={config.device_id || ""}
							onValueChange={(value) => {
								onConfigChange("device_id", value);
								onConfigChange("field", "");
								onConfigChange("operator", "");
								onConfigChange("value", undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("builder.selectDevice")} />
							</SelectTrigger>
							<SelectContent>
								{devices.map((device) => (
									<SelectItem
										key={device.id}
										value={device.id}
									>
										<div className="flex items-center gap-2">
											<HardDrive className="h-4 w-4" />
											{device.own_name || device.id}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Field */}
					{config.device_id && (
						<div>
							<Label htmlFor="field">{t("builder.whatToCheck")}</Label>
							<Select
								value={config.field || ""}
								onValueChange={(value) => {
									onConfigChange("field", value);
									onConfigChange("operator", "");
									onConfigChange("value", undefined);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("builder.selectWhatToCheck")} />
								</SelectTrigger>
								<SelectContent>
									{fieldOptions.length > 0 ? (
										fieldOptions.map((field) => (
											<SelectItem
												key={field.value}
												value={field.value}
											>
												{field.label} {field.unit && `(${field.unit})`}
											</SelectItem>
										))
									) : (
										<SelectItem
											value="__none"
											disabled
										>
											{t("builder.noFieldsAvailable")}
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Operator + value */}
					{config.field && selectedField && (
						<>
							<div>
								<Label htmlFor="operator">{t("builder.condition")}</Label>
								<Select
									value={config.operator || ""}
									onValueChange={(value) => onConfigChange("operator", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("builder.selectCondition")} />
									</SelectTrigger>
									<SelectContent>
										{getOperatorOptions().map((op) => (
											<SelectItem
												key={op.value}
												value={op.value}
											>
												{op.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Dynamic value input */}
							{config.operator && renderValueInput()}
						</>
					)}
				</>
			)}

			{/* Time condition */}
			{conditionType === "time" && (
				<>
					<div>
						<Label htmlFor="time">{t("builder.time")}</Label>
						<Input
							id="time"
							type="time"
							value={config.time || ""}
							onChange={(e) => onConfigChange("time", e.target.value)}
						/>
					</div>
				</>
			)}

			{/* Day of week condition */}
			{conditionType === "day_of_week" && (
				<div>
					<Label htmlFor="days">{t("builder.daysOfWeek")}</Label>
					<div className="grid grid-cols-2 gap-2 mt-2">
						{DAYS_OF_WEEK.map((day) => (
							<label
								key={day}
								className="flex items-center space-x-2"
							>
								<input
									type="checkbox"
									checked={config.days_of_week?.includes(day) || false}
									onChange={(e) => {
										const currentDays = config.days_of_week || [];
										const updatedDays = e.target.checked ? [...currentDays, day] : currentDays.filter((d: string) => d !== day);
										onConfigChange("days_of_week", updatedDays);
									}}
								/>
								<span>{t(getDayNameKey(day))}</span>
							</label>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ConditionConfiguration;
