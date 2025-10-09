import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Smartphone, Clock, Calendar, BarChart3 } from "lucide-react";
import { FlowData } from "@/api/automation/model";
import { getConditionIconComponent, getConditionTypeLabel, getOperatorSymbol } from "@/constants/automation";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";
import { Device } from "@/api/devices/model";

interface ConditionNodeProps extends NodeProps {
	onDelete?: (nodeId: string) => void;
	onSettings?: (node: any) => void;
	devices: Device[];
	capabilityHelper: ReturnType<typeof useDeviceCapabilityHelper>;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ data, selected, id, onDelete, onSettings, devices, capabilityHelper }) => {
	const conditionData = data as FlowData;

	const { getFieldOptionsForDevice } = capabilityHelper;

	const getConditionIcon = (type: string) => {
		const IconComponent = getConditionIconComponent(type);
		return <IconComponent className="w-4 h-4" />;
	};

	const getDeviceName = (deviceId: string) => {
		const device = devices.find((d) => d.id === deviceId);
		return device?.own_name || device?.id || deviceId;
	};

	const getFieldDisplayInfo = (deviceId: string, fieldKey: string) => {
		const fieldOptions = getFieldOptionsForDevice(deviceId, "condition");
		const field = fieldOptions.find((f) => f.value === fieldKey);
		return {
			label: field?.label || fieldKey,
			unit: field?.unit,
			type: field?.type,
		};
	};

	const getConfigSummary = () => {
		const config = conditionData.config;
		if (!config) return <p className="text-xs text-yellow-600">Not configured</p>;

		const conditionType = conditionData.condition_type;
		const deviceName = config.device_id ? getDeviceName(config.device_id) : null;

		switch (conditionType) {
			case "simple":
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
								<BarChart3 className="w-3 h-3" />
								{(() => {
									const fieldInfo = getFieldDisplayInfo(config.device_id, config.field);
									const operatorSymbol = config.operator ? getOperatorSymbol(config.operator) : "";
									return (
										<span>
											{fieldInfo.label} {operatorSymbol} {config.value}
											{fieldInfo.unit && <span className="text-muted-foreground ml-1">({fieldInfo.unit})</span>}
										</span>
									);
								})()}
							</div>
						)}
					</div>
				);
			case "time":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.time_from && config.time_to && (
							<div className="flex items-center gap-1 text-xs">
								<Clock className="w-3 h-3" />
								{config.time_from} - {config.time_to}
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
			case "day_of_week":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.days_of_week && config.days_of_week.length > 0 && (
							<div className="flex items-center gap-1 text-xs">
								<Calendar className="w-3 h-3" />
								{config.days_of_week
									.slice(0, 3)
									.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1, 3))
									.join(", ")}
								{config.days_of_week.length > 3 ? "..." : ""}
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

	const conditionType = (conditionData.condition_type as string) || "simple";
	const config = conditionData.config;

	return (
		<Card className={`min-w-[200px] max-w-[250px] ${selected ? "ring-2 ring-primary" : ""}`}>
			<CardHeader className="pb-2 pt-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-1 bg-yellow-100 dark:bg-yellow-700 rounded">{getConditionIcon(conditionType)}</div>
						<div>
							<h4 className="text-sm font-medium">Condition</h4>
							<Badge
								variant="secondary"
								className="text-xs"
							>
								{getConditionTypeLabel(conditionType)}
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
				className="!bg-yellow-500 !border-yellow-600 !h-2 !w-2 hover:!bg-yellow-400 transition-all duration-200"
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-yellow-500 !border-yellow-600 !h-2 !w-2 hover:!bg-yellow-400 transition-all duration-200"
			/>
		</Card>
	);
};

export default ConditionNode;
