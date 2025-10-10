import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Smartphone, Bell, FileText, Wrench } from "lucide-react";
import { FlowData } from "@/api/automation/model";
import { getActionIconComponent, getActionTypeLabel } from "@/constants/automation";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";

interface ActionNodeProps extends NodeProps {
	onDelete?: (nodeId: string) => void;
	onSettings?: (node: any) => void;
	devices: Device[];
	capabilityHelper: ReturnType<typeof useDeviceCapabilityHelper>;
}

const ActionNode: React.FC<ActionNodeProps> = ({ data, selected, id, onDelete, onSettings, devices, capabilityHelper }) => {
	const { t } = useTranslation("automations");
	const actionData = data as FlowData;

	const { getFieldOptionsForDevice } = capabilityHelper;

	const getActionIcon = (type: string) => {
		const IconComponent = getActionIconComponent(type);
		return <IconComponent className="w-4 h-4" />;
	};

	const getDeviceName = (deviceId: string) => {
		const device = devices.find((d) => d.id === deviceId);
		return device?.own_name || device?.id || deviceId;
	};

	const getFieldDisplayInfo = (deviceId: string, fieldKey: string) => {
		const fieldOptions = getFieldOptionsForDevice(deviceId, "action");
		const field = fieldOptions.find((f) => f.value === fieldKey);
		return {
			label: field?.label || fieldKey,
			unit: field?.unit,
			type: field?.type,
		};
	};

	const getConfigSummary = () => {
		const config = actionData.config;
		if (!config) return <p className="text-xs text-yellow-600">{t("builder.notConfigured")}</p>;

		const actionType = actionData.action_type;
		const deviceName = config.device_id ? getDeviceName(config.device_id) : null;

		switch (actionType) {
			case "device_control":
				return (
					<div className="space-y-1">
						{deviceName && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
								<Smartphone className="w-3 h-3" />
								{deviceName}
							</div>
						)}
						{config.field && config.value !== undefined && config.device_id && (
							<div className="flex items-center gap-1 text-xs">
								<Wrench className="w-3 h-3" />
								{(() => {
									const fieldInfo = getFieldDisplayInfo(config.device_id, config.field);
									return (
										<span>
											{fieldInfo.label} = {config.value}
											{fieldInfo.unit && <span className="text-muted-foreground ml-1">({fieldInfo.unit})</span>}
										</span>
									);
								})()}
							</div>
						)}
					</div>
				);
			case "notify":
				return (
					<div className="space-y-1">
						{config.title && (
							<div className="flex items-center gap-1 text-xs">
								<Bell className="w-3 h-3" />
								{config.title}
							</div>
						)}
						{config.message && (
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								<FileText className="w-3 h-3" />
								{config.message.length > 20 ? `${config.message.substring(0, 20)}...` : config.message}
							</div>
						)}
					</div>
				);
			case "log":
				return (
					<div className="space-y-1">
						{config.message && (
							<div className="flex items-center gap-1 text-xs">
								<FileText className="w-3 h-3" />
								{config.message.length > 30 ? `${config.message.substring(0, 30)}...` : config.message}
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
					<p className="text-xs">{t("builder.configured")}</p>
				);
		}
	};

	const actionType = (actionData.action_type as string) || "unknown";

	return (
		<Card className={`min-w-[200px] max-w-[250px] ${selected ? "ring-2 ring-primary" : ""}`}>
			<CardHeader className="pb-2 pt-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-1 bg-green-100 dark:bg-green-700  rounded">{getActionIcon(actionType)}</div>
						<div>
							<h4 className="text-sm font-medium">{t("nodes.action")}</h4>
							<Badge
								variant="secondary"
								className="text-xs"
							>
								{t(getActionTypeLabel(actionType).labelKey)}
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
				className="!bg-green-500 !border-green-600 !h-2 !w-2 hover:!bg-green-400 transition-all duration-200"
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-green-500 !border-green-600 !h-2 !w-2 hover:!bg-green-400 transition-all duration-200"
			/>
		</Card>
	);
};

export default ActionNode;
