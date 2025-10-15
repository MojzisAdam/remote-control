import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Filter, Target, AlertTriangle } from "lucide-react";
import { FlowData } from "@/api/automation/model";
import { TriggerConfiguration, ConditionConfiguration, ActionConfiguration } from "./configuration";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";
import { useDeviceCapabilities } from "@/provider/DeviceCapabilitiesProvider";
import { useTranslation } from "react-i18next";

interface NodeConfigurationPanelProps {
	node: Node<FlowData> | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (nodeId: string, config: any) => void;
	onNodeDataChange?: (nodeId: string, data: Partial<FlowData>) => void;
}

const NodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({ node, isOpen, onClose, onSave, onNodeDataChange }) => {
	const { t } = useTranslation("automations");
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

	// Re-validate when config or local node data changes
	useEffect(() => {
		if (node) {
			const currentNodeType = node.data.type;
			const errors: string[] = [];

			if (currentNodeType === "trigger") {
				const triggerType = localNodeData.trigger_type as string;

				if (triggerType === "state_change") {
					if (!config.device_id) {
						errors.push(t("validation.deviceRequiredStateChange"));
					}
					if (!config.field) {
						errors.push(t("validation.fieldRequiredStateChange"));
					}
				} else if (triggerType === "time") {
					if (!config.time) {
						errors.push(t("validation.timeRequiredTimeTrigger"));
					}
				} else if (triggerType === "interval") {
					if (!config.interval || config.interval <= 0) {
						errors.push(t("validation.intervalRequiredIntervalTrigger"));
					}
				}
			} else if (currentNodeType === "condition") {
				const conditionType = localNodeData.condition_type as string;
				if (conditionType === "simple") {
					if (config.field || config.operator || config.value) {
						if (!config.device_id) {
							errors.push(t("validation.deviceRequiredSimpleCondition"));
						}
						if (config.field && !config.operator) {
							errors.push(t("validation.operatorRequiredWhenField"));
						}
						if (config.operator && (config.value === undefined || config.value === "")) {
							errors.push(t("validation.valueRequiredWhenOperator"));
						}
					}
				} else if (conditionType === "time") {
					if (config.time && !config.time.trim()) {
						errors.push(t("validation.timeFormatInvalid"));
					}
				} else if (conditionType === "advanced") {
					if (config.condition_js) {
						if (!config.device_id) {
							errors.push(t("validation.deviceRequiredAdvancedCondition"));
						}
						if (!config.condition_js.trim()) {
							errors.push(t("validation.jsConditionCodeRequired"));
						}
					}
				}
			} else if (currentNodeType === "action") {
				const actionType = localNodeData.action_type as string;
				if (actionType === "device_control") {
					if (!config.device_id) {
						errors.push(t("validation.deviceRequiredDeviceControl"));
					}
					if (!config.field) {
						errors.push(t("validation.fieldRequiredDeviceControl"));
					}
					if (config.value === undefined || config.value === "") {
						errors.push(t("validation.valueRequiredDeviceControl"));
					}
				} else if (actionType === "log") {
					if (!config.message) {
						errors.push(t("validation.actionLogMessageRequired"));
					}
				} else if (actionType === "notify") {
					if (!config.message) {
						errors.push(t("validation.notificationMessageRequired"));
					}
				}
			}

			setValidationErrors(errors);
		}
	}, [config, localNodeData, node, t]);

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
		// Return current validation state
		return validationErrors.length === 0;
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
				return t("configuration.configureTrigger");
			case "condition":
				return t("configuration.configureCondition");
			case "action":
				return t("configuration.configureAction");
			default:
				return t("configuration.configureNode");
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
					<DialogDescription>{t("configuration.configureDescription", { nodeType })}</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Node Info */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t("configuration.nodeInformation")}</CardTitle>
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
							<CardTitle className="text-sm">{t("configuration.configuration")}</CardTitle>
						</CardHeader>
						<CardContent>{renderConfigurationContent()}</CardContent>
					</Card>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<Card className="border-destructive">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-4 w-4" />
									{t("configuration.configurationErrors")}
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
							{t("configuration.cancel")}
						</Button>
						<Button
							onClick={handleSave}
							disabled={validationErrors.length > 0}
						>
							{t("configuration.saveConfiguration")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default NodeConfigurationPanel;
