import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Filter, Target, AlertTriangle } from "lucide-react";
import { FlowData } from "@/api/automation/model";
import { Device } from "@/api/devices/model";
import { TriggerConfiguration, ConditionConfiguration, ActionConfiguration } from "./configuration";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";
import { useDeviceCapabilities } from "@/provider/DeviceCapabilitiesProvider";

interface NodeConfigurationPanelProps {
	node: Node<FlowData> | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (nodeId: string, config: any) => void;
	onNodeDataChange?: (nodeId: string, data: Partial<FlowData>) => void;
}

const NodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({ node, isOpen, onClose, onSave, onNodeDataChange }) => {
	const { devices } = useDeviceCapabilities();
	const capabilityHelper = useDeviceCapabilityHelper();
	const [config, setConfig] = useState<any>({});
	const [localNodeData, setLocalNodeData] = useState<Partial<FlowData>>({});
	const [originalNodeData, setOriginalNodeData] = useState<FlowData | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	// Initialize config and local state when node changes
	useEffect(() => {
		if (node) {
			setConfig(node.data.config || {});
			setLocalNodeData({
				trigger_type: node.data.trigger_type,
				condition_type: node.data.condition_type,
				action_type: node.data.action_type,
			});
			setOriginalNodeData(node.data);
			setValidationErrors([]);
		}
	}, [node]);

	if (!node) return null;

	const nodeType = node.data.type;

	const handleConfigChange = (key: string, value: any) => {
		setConfig((prev: any) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleTriggerTypeChange = (triggerType: string) => {
		setLocalNodeData((prev) => ({ ...prev, trigger_type: triggerType }));
		setConfig({});
	};

	const handleConditionTypeChange = (conditionType: string) => {
		setLocalNodeData((prev) => ({ ...prev, condition_type: conditionType }));
		setConfig({});
	};

	const handleActionTypeChange = (actionType: string) => {
		setLocalNodeData((prev) => ({ ...prev, action_type: actionType }));
		setConfig({});
	};

	const validateConfiguration = (): boolean => {
		const errors: string[] = [];

		if (nodeType === "trigger") {
			const triggerType = localNodeData.trigger_type as string;

			if (triggerType === "state_change") {
				if (!config.device_id) {
					errors.push("Device selection is required for state change triggers");
				}
				if (!config.field) {
					errors.push("Field selection is required for state change triggers");
				}
			} else if (triggerType === "time") {
				if (!config.time) {
					errors.push("Time is required for time-based triggers");
				}
			} else if (triggerType === "interval") {
				if (!config.interval || config.interval <= 0) {
					errors.push("Valid interval is required for interval triggers");
				}
			}
		} else if (nodeType === "condition") {
			const conditionType = localNodeData.condition_type as string;
			if (conditionType === "simple") {
				if (config.field || config.operator || config.value) {
					if (!config.device_id) {
						errors.push("Device selection is required for simple conditions");
					}
					if (config.field && !config.operator) {
						errors.push("Comparison operator is required when field is selected");
					}
					if (config.operator && (config.value === undefined || config.value === "")) {
						errors.push("Comparison value is required when operator is selected");
					}
				}
			} else if (conditionType === "time") {
				if (config.time && !config.time.trim()) {
					errors.push("Time format is invalid");
				}
			} else if (conditionType === "advanced") {
				if (config.condition_js) {
					if (!config.device_id) {
						errors.push("Device selection is required for advanced conditions");
					}
					if (!config.condition_js.trim()) {
						errors.push("JavaScript condition code is required");
					}
				}
			}
		} else if (nodeType === "action") {
			const actionType = localNodeData.action_type as string;
			if (actionType === "device_control") {
				if (!config.device_id) {
					errors.push("Device selection is required for device control actions");
				}
				if (!config.field) {
					errors.push("Field selection is required for device control actions");
				}
				if (config.value === undefined || config.value === "") {
					errors.push("Value is required for device control");
				}
			} else if (actionType === "mqtt_publish") {
				if (!config.topic) {
					errors.push("MQTT topic is required");
				}
				if (!config.message) {
					errors.push("MQTT message is required");
				}
			} else if (actionType === "notify") {
				if (!config.message) {
					errors.push("Notification message is required");
				}
			}
		}

		setValidationErrors(errors);
		return errors.length === 0;
	};

	const handleSave = () => {
		if (validateConfiguration()) {
			if (onNodeDataChange && node) {
				const hasTypeChanges =
					localNodeData.trigger_type !== originalNodeData?.trigger_type ||
					localNodeData.condition_type !== originalNodeData?.condition_type ||
					localNodeData.action_type !== originalNodeData?.action_type;

				if (hasTypeChanges) {
					onNodeDataChange(node.id, localNodeData);
				}
			}
			onSave(node.id, config);
			onClose();
		}
	};

	const handleCancel = () => {
		if (originalNodeData) {
			setLocalNodeData({
				trigger_type: originalNodeData.trigger_type,
				condition_type: originalNodeData.condition_type,
				action_type: originalNodeData.action_type,
			});
			setConfig(originalNodeData.config || {});
		}
		setValidationErrors([]);
		onClose();
	};

	const getNodeIcon = () => {
		switch (nodeType) {
			case "trigger":
				return <Zap className="h-5 w-5" />;
			case "condition":
				return <Filter className="h-5 w-5" />;
			case "action":
				return <Target className="h-5 w-5" />;
			default:
				return <Settings className="h-5 w-5" />;
		}
	};

	const getNodeTitle = () => {
		switch (nodeType) {
			case "trigger":
				return "Configure Trigger";
			case "condition":
				return "Configure Condition";
			case "action":
				return "Configure Action";
			default:
				return "Configure Node";
		}
	};

	const renderTriggerConfiguration = () => {
		const triggerType = localNodeData.trigger_type as string;
		return (
			<TriggerConfiguration
				triggerType={triggerType}
				config={config}
				devices={devices}
				onConfigChange={handleConfigChange}
				onTriggerTypeChange={handleTriggerTypeChange}
				getCapabilitiesForRole={(deviceId: string) => capabilityHelper.getFieldOptionsForDevice(deviceId, "trigger")}
			/>
		);
	};

	const renderConditionConfiguration = () => {
		const conditionType = localNodeData.condition_type as string;
		return (
			<ConditionConfiguration
				conditionType={conditionType}
				config={config}
				devices={devices}
				onConfigChange={handleConfigChange}
				onConditionTypeChange={handleConditionTypeChange}
				getCapabilitiesForRole={(deviceId: string) => capabilityHelper.getFieldOptionsForDevice(deviceId, "condition")}
			/>
		);
	};

	const renderActionConfiguration = () => {
		const actionType = localNodeData.action_type as string;
		return (
			<ActionConfiguration
				actionType={actionType}
				config={config}
				devices={devices}
				onConfigChange={handleConfigChange}
				onActionTypeChange={handleActionTypeChange}
				getCapabilitiesForRole={(deviceId: string) => capabilityHelper.getFieldOptionsForDevice(deviceId, "action")}
			/>
		);
	};

	const renderConfigurationContent = () => {
		switch (nodeType) {
			case "trigger":
				return renderTriggerConfiguration();
			case "condition":
				return renderConditionConfiguration();
			case "action":
				return renderActionConfiguration();
			default:
				return null;
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{getNodeIcon()}
						{getNodeTitle()}
					</DialogTitle>
					<DialogDescription>Configure the parameters for this {nodeType} node.</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Node Info */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">Node Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline">{nodeType}</Badge>
								<span className="text-sm text-muted-foreground">ID: {node.id}</span>
							</div>
						</CardContent>
					</Card>

					{/* Configuration Form */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">Configuration</CardTitle>
						</CardHeader>
						<CardContent>{renderConfigurationContent()}</CardContent>
					</Card>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<Card className="border-destructive">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-4 w-4" />
									Configuration Errors
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-1">
									{validationErrors.map((error, index) => (
										<li
											key={index}
											className="text-sm text-destructive flex items-center gap-2"
										>
											<span className="w-1 h-1 bg-destructive rounded-full" />
											{error}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							variant="outline"
							onClick={handleCancel}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={validationErrors.length > 0}
						>
							Save Configuration
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default NodeConfigurationPanel;
