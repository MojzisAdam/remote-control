import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HardDrive } from "lucide-react";

import { Device } from "@/api/devices/model";
import { getTriggerTypes } from "@/constants/automation";

interface TriggerConfigurationProps {
	triggerType: string;
	config: any;
	devices: Device[];
	onConfigChange: (key: string, value: any) => void;
	onTriggerTypeChange?: (triggerType: string) => void;
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

const TriggerConfiguration: React.FC<TriggerConfigurationProps> = ({ triggerType, config, devices, onConfigChange, onTriggerTypeChange, getCapabilitiesForRole }) => {
	const selectedDeviceId = config.device_id;
	const fieldOptions = selectedDeviceId ? getCapabilitiesForRole(selectedDeviceId) : [];

	return (
		<div className="space-y-4">
			{/* Trigger Type Selector */}
			<div>
				<Label htmlFor="trigger-type">Trigger Type</Label>
				<Select
					value={triggerType || ""}
					onValueChange={(value) => onTriggerTypeChange?.(value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select trigger type" />
					</SelectTrigger>
					<SelectContent>
						{getTriggerTypes().map((option: any) => (
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

			{/* State Change Trigger */}
			{triggerType === "state_change" && (
				<>
					{/* Device */}
					<div>
						<Label htmlFor="device">Device</Label>
						<Select
							value={config.device_id || ""}
							onValueChange={(value) => onConfigChange("device_id", value)}
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

					{/* Field (dynamic from capabilities) */}
					<div>
						<Label htmlFor="field">Field</Label>
						<Select
							value={config.field || ""}
							onValueChange={(value) => onConfigChange("field", value)}
							disabled={!selectedDeviceId}
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
										{selectedDeviceId ? "No fields available for this device" : "Select a device first"}
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
				</>
			)}

			{/* Time Trigger */}
			{triggerType === "time" && (
				<div>
					<Label htmlFor="time">Time</Label>
					<Input
						id="time"
						type="time"
						value={config.time || ""}
						onChange={(e) => onConfigChange("time", e.target.value)}
					/>
				</div>
			)}

			{/* Interval Trigger */}
			{triggerType === "interval" && (
				<div>
					<Label htmlFor="interval">Interval (minutes)</Label>
					<Input
						id="interval"
						type="number"
						min="1"
						value={config.interval || ""}
						onChange={(e) => onConfigChange("interval", parseInt(e.target.value, 10))}
						placeholder="Enter interval in minutes"
					/>
				</div>
			)}
		</div>
	);
};

export default TriggerConfiguration;
