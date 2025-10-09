import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HardDrive } from "lucide-react";

import { Device } from "@/api/devices/model";
import { getActionTypes } from "@/constants/automation";

interface ActionConfigurationProps {
	actionType: string;
	config: any;
	devices: Device[];
	onConfigChange: (key: string, value: any) => void;
	onActionTypeChange?: (actionType: string) => void;
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

const ActionConfiguration: React.FC<ActionConfigurationProps> = ({ actionType, config, devices, onConfigChange, onActionTypeChange, getCapabilitiesForRole }) => {
	const selectedDeviceId = config.device_id;
	const fieldOptions = selectedDeviceId ? getCapabilitiesForRole(selectedDeviceId) : [];

	const selectedField = fieldOptions.find((f) => f.value === config.field);

	const renderValueInput = () => {
		if (!selectedField) return null;

		switch (selectedField.type) {
			case "boolean":
				return (
					<div>
						<Label htmlFor="value">Value</Label>
						<Select
							value={config.value?.toString() || ""}
							onValueChange={(value) => onConfigChange("value", value === "true")}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select value" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">{selectedField.labels?.["1"] || "True"}</SelectItem>
								<SelectItem value="false">{selectedField.labels?.["0"] || "False"}</SelectItem>
							</SelectContent>
						</Select>
					</div>
				);

			case "number":
				const min = selectedField.min_value;
				const max = selectedField.max_value;
				const step = selectedField.increment_value || 1;

				return (
					<div>
						<Label htmlFor="value">
							Value {selectedField.unit && `(${selectedField.unit})`}
							{min !== undefined && max !== undefined && (
								<span className="text-xs text-muted-foreground ml-2">
									Range: {min} - {max}
								</span>
							)}
						</Label>
						<Input
							id="value"
							type="number"
							min={min}
							max={max}
							step={step}
							value={config.value || ""}
							onChange={(e) => onConfigChange("value", parseFloat(e.target.value))}
							placeholder={`Enter value${min !== undefined ? ` (${min}-${max})` : ""}`}
						/>
					</div>
				);

			case "enum":
				return (
					<div>
						<Label htmlFor="value">Value</Label>
						<Select
							value={config.value?.toString() || ""}
							onValueChange={(value) => {
								// Try to parse as number if it looks like a number
								const numValue = parseFloat(value);
								onConfigChange("value", isNaN(numValue) ? value : numValue);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select value" />
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
						<Label htmlFor="value">Value</Label>
						<Input
							id="value"
							type="text"
							value={config.value || ""}
							onChange={(e) => onConfigChange("value", e.target.value)}
							placeholder="Enter value"
						/>
					</div>
				);
		}
	};

	return (
		<div className="space-y-4">
			{/* Action type */}
			<div>
				<Label htmlFor="action-type">Action Type</Label>
				<Select
					value={actionType || ""}
					onValueChange={(value) => onActionTypeChange?.(value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select action type" />
					</SelectTrigger>
					<SelectContent>
						{getActionTypes().map((option: any) => (
							<SelectItem
								key={option.value}
								value={option.value}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Device Control */}
			{actionType === "device_control" && (
				<>
					{/* Device */}
					<div>
						<Label htmlFor="device">Device</Label>
						<Select
							value={config.device_id || ""}
							onValueChange={(value) => {
								onConfigChange("device_id", value);
								onConfigChange("field", "");
								onConfigChange("control_type", "");
								onConfigChange("value", undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a device" />
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
							<Label htmlFor="field">Field to Control</Label>
							<Select
								value={config.field || ""}
								onValueChange={(value) => {
									onConfigChange("field", value);
									// Always use set_value control type
									onConfigChange("control_type", "set_value");
									onConfigChange("value", undefined);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a field" />
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
											No controllable fields available
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Value input (always set_value mode) */}
					{config.field && renderValueInput()}
				</>
			)}

			{/* Notification */}
			{actionType === "notify" && (
				<div>
					<Label htmlFor="message">Notification Message</Label>
					<Textarea
						id="message"
						value={config.message || ""}
						onChange={(e) => onConfigChange("message", e.target.value)}
						placeholder="Enter notification message"
						rows={3}
					/>
				</div>
			)}

			{/* Log */}
			{actionType === "log" && (
				<div>
					<Label htmlFor="message">Log Message</Label>
					<Textarea
						id="message"
						value={config.message || ""}
						onChange={(e) => onConfigChange("message", e.target.value)}
						placeholder="Enter log message"
						rows={3}
					/>
				</div>
			)}
		</div>
	);
};

export default ActionConfiguration;
