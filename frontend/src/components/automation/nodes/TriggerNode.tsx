import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Smartphone, Clock, Timer, Activity, Wifi } from "lucide-react";
import { FlowData } from "@/api/automation/model";
import { getTriggerIconComponent, getTriggerTypeLabel } from "@/constants/automation";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";

import { Device } from "@/api/devices/model";

interface TriggerNodeProps extends NodeProps {
	onDelete?: (nodeId: string) => void;
	onSettings?: (node: any) => void;
	devices: Device[];
	capabilityHelper: ReturnType<typeof useDeviceCapabilityHelper>;
}

const TriggerNode: React.FC<TriggerNodeProps> = ({ data, selected, id, onDelete, onSettings, devices, capabilityHelper }) => {
	const triggerData = data as FlowData;

	const { getFieldOptionsForDevice } = capabilityHelper;

	const getTriggerIcon = (type: string) => {
		const IconComponent = getTriggerIconComponent(type);
		return <IconComponent className="w-4 h-4" />;
	};

	const getDeviceName = (deviceId: string) => {
		const device = devices.find((d) => d.id === deviceId);
		return device?.own_name || device?.id || deviceId;
	};

	const getFieldDisplayInfo = (deviceId: string, fieldKey: string) => {
		const fieldOptions = getFieldOptionsForDevice(deviceId, "trigger");
		const field = fieldOptions.find((f) => f.value === fieldKey);
		return {
			label: field?.label || fieldKey,
			unit: field?.unit,
			type: field?.type,
		};
	};

	const getConfigSummary = () => {
		const config = triggerData.config;
		if (!config) return <p className="text-xs text-yellow-600">Not configured</p>;

		const triggerType = triggerData.trigger_type;
		const deviceName = config.device_id ? getDeviceName(config.device_id) : null;

		switch (triggerType) {
			case "time":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.time && (
							<div className="flex items-center gap-1 text-xs">
								<Clock className="w-3 h-3" />
								At {config.time}
							</div>
						)}
					</div>
				);
			case "interval":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.interval && (
							<div className="flex items-center gap-1 text-xs">
								<Timer className="w-3 h-3" />
								Every {config.interval} min
							</div>
						)}
					</div>
				);
			case "state_change":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.field && config.device_id && (
							<div className="flex items-center gap-1 text-xs">
								<Activity className="w-3 h-3" />
								{(() => {
									const fieldInfo = getFieldDisplayInfo(config.device_id, config.field);
									return (
										<span>
											{fieldInfo.label} changes
											{fieldInfo.unit && <span className="text-muted-foreground ml-1">({fieldInfo.unit})</span>}
										</span>
									);
								})()}
							</div>
						)}
					</div>
				);
			case "mqtt":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.mqtt_topic && (
							<div className="flex items-center gap-1 text-xs">
								<Wifi className="w-3 h-3" />
								{config.mqtt_topic}
							</div>
						)}
					</div>
				);
			default:
				return deviceName ? (
					<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
						<Smartphone className="w-3 h-3" />
						{deviceName}
					</div>
				) : (
					<p className="text-xs">Configured</p>
				);
		}
	};

	const triggerType = (triggerData.trigger_type as string) || "unknown";

	return (
		<Card className={`min-w-[200px] max-w-[250px] ${selected ? "ring-2 ring-primary" : ""}`}>
			<CardHeader className="pb-2 pt-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-1 bg-blue-100 dark:bg-blue-700 rounded">{getTriggerIcon(triggerType)}</div>
						<div>
							<h4 className="text-sm font-medium">Trigger</h4>
							<Badge
								variant="secondary"
								className="text-xs"
							>
								{getTriggerTypeLabel(triggerType)}
							</Badge>
						</div>
					</div>
					<div className="flex space-x-1">
						<Button
							size="sm"
							variant="ghost"
							className="h-6 w-6 p-0"
							onClick={(e) => {
								e.stopPropagation();
								onSettings?.({ id, data });
							}}
						>
							<Settings className="w-3 h-3" />
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-6 w-6 p-0"
							onClick={(e) => {
								e.stopPropagation();
								onDelete?.(id);
							}}
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0 pb-3">{getConfigSummary()}</CardContent>

			<Handle
				type="target"
				position={Position.Left}
				className="!bg-blue-500 !border-blue-600 !h-2 !w-2 hover:!bg-blue-400 transition-all duration-200"
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-blue-500 !border-blue-600 !h-2 !w-2 hover:!bg-blue-400 transition-all duration-200"
			/>
		</Card>
	);
};

export default TriggerNode;
