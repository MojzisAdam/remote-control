import { CreateAutomationRequest, Automation } from "@/api/automation/model";

// Validation helpers
export const validateAutomation = (data: CreateAutomationRequest): string[] => {
	const errors: string[] = [];

	if (!data.name?.trim()) {
		errors.push("Automation name is required");
	}

	if (!data.triggers || data.triggers.length === 0) {
		errors.push("At least one trigger is required");
	}

	if (!data.actions || data.actions.length === 0) {
		errors.push("At least one action is required");
	}

	// Validate triggers
	data.triggers?.forEach((trigger, index) => {
		if (trigger.type === "time") {
			if (!trigger.time_at) {
				errors.push(`Trigger ${index + 1}: Time is required for time-based triggers`);
			}
			if (!trigger.days_of_week || trigger.days_of_week.length === 0) {
				errors.push(`Trigger ${index + 1}: At least one day is required for time-based triggers`);
			}
		}
		if (trigger.type === "mqtt") {
			if (!trigger.mqtt_topic) {
				errors.push(`Trigger ${index + 1}: MQTT topic is required`);
			}
		}
		if (trigger.type === "state_change") {
			if (!trigger.device_id) {
				errors.push(`Trigger ${index + 1}: Device is required for state change triggers`);
			}
			if (!trigger.field) {
				errors.push(`Trigger ${index + 1}: Field is required for state change triggers`);
			}
			// Note: state_change triggers don't need operator and value - they trigger on any change
		}
	});

	// Validate conditions
	data.conditions?.forEach((condition, index) => {
		if (!condition.device_id) {
			errors.push(`Condition ${index + 1}: Device is required`);
		}
		if (!condition.field) {
			errors.push(`Condition ${index + 1}: Field is required`);
		}
		if (!condition.operator) {
			errors.push(`Condition ${index + 1}: Operator is required`);
		}
		if (!condition.value) {
			errors.push(`Condition ${index + 1}: Value is required`);
		}
	});

	// Validate actions
	data.actions?.forEach((action, index) => {
		if (action.type === "device_control") {
			if (!action.device_id) {
				errors.push(`Action ${index + 1}: Device is required for device control actions`);
			}
			if (!action.field) {
				errors.push(`Action ${index + 1}: Field is required for device control actions`);
			}
			if (!action.value) {
				errors.push(`Action ${index + 1}: Value is required for device control actions`);
			}
		}
		if (action.type === "mqtt_publish") {
			if (!action.mqtt_topic) {
				errors.push(`Action ${index + 1}: MQTT topic is required`);
			}
		}
		if (action.type === "notify") {
			if (!action.notification_title) {
				errors.push(`Action ${index + 1}: Notification title is required`);
			}
		}
	});

	return errors;
};

// Convert automation to React Flow format
export const automationToFlow = (automation: Automation) => {
	const nodes: any[] = [];
	const edges: any[] = [];
	let yOffset = 0;

	// Add trigger nodes
	automation.triggers?.forEach((trigger, index) => {
		nodes.push({
			id: `trigger-${index}`,
			type: "triggerNode",
			position: { x: 100, y: yOffset },
			data: trigger,
		});
		yOffset += 100;
	});

	// Add condition nodes
	automation.conditions?.forEach((condition, index) => {
		nodes.push({
			id: `condition-${index}`,
			type: "conditionNode",
			position: { x: 300, y: yOffset },
			data: condition,
		});
		yOffset += 100;
	});

	// Add action nodes
	automation.actions?.forEach((action, index) => {
		nodes.push({
			id: `action-${index}`,
			type: "actionNode",
			position: { x: 500, y: yOffset },
			data: action,
		});
		yOffset += 100;
	});

	// Create edges between nodes
	for (let i = 0; i < nodes.length - 1; i++) {
		edges.push({
			id: `edge-${i}`,
			source: nodes[i].id,
			target: nodes[i + 1].id,
			type: "smoothstep",
		});
	}

	return { nodes, edges };
};
