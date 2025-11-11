import { useState, useCallback, useMemo } from "react";
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import {
	Automation,
	CreateAutomationRequest,
	FlowNode,
	FlowData,
	TriggerType,
	ConditionType,
	ActionType,
	Trigger,
	Condition,
	Action,
	AutomationTrigger,
	AutomationCondition,
	AutomationAction,
	FlowMetadata,
} from "@/api/automation/model";
import { NODE_TYPES } from "@/constants/automation";

// Default positions for new nodes
const getDefaultPosition = (nodeCount: number, viewportCenter?: { x: number; y: number }) => {
	if (viewportCenter) {
		const offsetX = (nodeCount % 3) * 60;
		const offsetY = Math.floor(nodeCount / 3) * 60;

		const position = {
			x: viewportCenter.x + offsetX - 60,
			y: viewportCenter.y + offsetY - 60,
		};

		return position;
	}
	// Fallback to original positioning if no viewport center provided
	return {
		x: 250 + nodeCount * 200,
		y: 100,
	};
};

export const useAutomationFlow = (initialAutomation?: Automation) => {
	const { t } = useTranslation("automations");
	const [nodes, setNodes] = useState<Node<FlowData>[]>(() => {
		if (initialAutomation) {
			return convertAutomationToNodes(initialAutomation);
		}
		return getInitialNodes();
	});

	const [edges, setEdges] = useState<Edge[]>(() => {
		if (initialAutomation) {
			const initialNodes = convertAutomationToNodes(initialAutomation);
			return convertAutomationToEdges(initialAutomation, initialNodes);
		}
		return [];
	});

	const [selectedNode, setSelectedNode] = useState<Node<FlowData> | null>(null);
	const [isValidFlow, setIsValidFlow] = useState(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	// Get initial flow nodes
	function getInitialNodes(): Node<FlowData>[] {
		return [
			{
				id: "start-1",
				type: NODE_TYPES.START,
				position: { x: 50, y: 100 },
				data: { label: "Start", type: "start" },
				deletable: false,
			},
			{
				id: "end-1",
				type: NODE_TYPES.END,
				position: { x: 650, y: 100 },
				data: { label: "End", type: "end" },
				deletable: false,
			},
		];
	}

	// Convert automation to React Flow nodes
	function convertAutomationToNodes(automation: Automation): Node<FlowData>[] {
		const flowNodes: Node<FlowData>[] = getInitialNodes();
		let nodeIndex = 0;

		// If we have saved flow metadata, restore the start/end positions
		if (automation.flow_metadata?.nodes) {
			const savedStartNode = automation.flow_metadata.nodes.find((n) => n.id === "start-1");
			const savedEndNode = automation.flow_metadata.nodes.find((n) => n.id === "end-1");

			if (savedStartNode) {
				const startNodeIndex = flowNodes.findIndex((n) => n.id === "start-1");
				if (startNodeIndex >= 0) {
					flowNodes[startNodeIndex].position = savedStartNode.position;
				}
			}

			if (savedEndNode) {
				const endNodeIndex = flowNodes.findIndex((n) => n.id === "end-1");
				if (endNodeIndex >= 0) {
					flowNodes[endNodeIndex].position = savedEndNode.position;
				}
			}
		} else {
			console.log("No flow_metadata.nodes found!");
		}

		// Add trigger nodes
		automation.triggers?.forEach((trigger, index) => {
			// Convert backend trigger format to frontend node config format
			const triggerConfig: any = {
				device_id: trigger.device_id,
			};

			const triggerType = trigger.type;

			if (trigger.type === "time") {
				triggerConfig.time = trigger.time_at;
				triggerConfig.days_of_week = trigger.days_of_week || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
			} else if (trigger.type === "interval") {
				// Convert interval from seconds to minutes for UI
				triggerConfig.interval = trigger.interval_seconds ? Math.floor(trigger.interval_seconds / 60) : 5;
			} else if (trigger.type === "state_change") {
				triggerConfig.field = trigger.field;
				triggerConfig.operator = trigger.operator;
				triggerConfig.value = trigger.value;
			}

			// Use database ID for consistent node ID
			const nodeId = `trigger-${trigger.id}`;

			// Look for saved position - first by exact node ID match, then by entityId in data
			let savedNode = automation.flow_metadata?.nodes.find((n) => n.id === nodeId);
			if (!savedNode && automation.flow_metadata?.nodes) {
				// Try to find by entityId in node data
				savedNode = automation.flow_metadata.nodes.find((n) => n.id.startsWith("trigger-") && (n as any).data?.entityId === trigger.id);
				// Fallback to index position matching
				if (!savedNode) {
					const triggerNodes = automation.flow_metadata.nodes.filter((n) => n.id.startsWith("trigger-"));
					savedNode = triggerNodes[index];
					console.log(`No exact match for ${nodeId}, using index ${index}:`, savedNode);
				}
			}
			const position = savedNode?.position || getDefaultPosition(nodeIndex++);

			flowNodes.push({
				id: nodeId,
				type: NODE_TYPES.TRIGGER,
				position: position,
				data: {
					label: `Trigger: ${trigger.type}`,
					type: "trigger",
					trigger_type: triggerType,
					entityId: trigger.id,
					config: {
						...triggerConfig,
						type: triggerType,
					},
				},
			});
		});

		// Add condition nodes
		automation.conditions?.forEach((condition, index) => {
			// Convert backend condition format to frontend node config format
			const conditionConfig: any = {};
			const conditionType = condition.type || "simple";
			let label = "Unknown";

			if (conditionType === "simple") {
				conditionConfig.device_id = condition.device_id;
				conditionConfig.field = condition.field;
				conditionConfig.operator = condition.operator;
				conditionConfig.value = condition.value;
				label = `Condition: ${condition.field || "Simple"}`;
			} else if (conditionType === "time") {
				conditionConfig.time = condition.time_at;
				label = "Condition: Time";
			} else if (conditionType === "day_of_week") {
				conditionConfig.days_of_week = condition.days_of_week || [];
				label = "Condition: Day of Week";
			}

			// Use database ID for consistent node ID
			const nodeId = `condition-${condition.id}`;

			// Look for saved position - first by exact node ID match, then by entityId in data
			let savedNode = automation.flow_metadata?.nodes.find((n) => n.id === nodeId);
			if (!savedNode && automation.flow_metadata?.nodes) {
				// Try to find by entityId in node data
				savedNode = automation.flow_metadata.nodes.find((n) => n.id.startsWith("condition-") && (n as any).data?.entityId === condition.id);
				// Fallback to index position matching
				if (!savedNode) {
					const conditionNodes = automation.flow_metadata.nodes.filter((n) => n.id.startsWith("condition-"));
					savedNode = conditionNodes[index];
					console.log(`No exact match for ${nodeId}, using index ${index}:`, savedNode);
				}
			}
			const position = savedNode?.position || getDefaultPosition(nodeIndex++);

			flowNodes.push({
				id: nodeId,
				type: NODE_TYPES.CONDITION,
				position: position,
				data: {
					label: label,
					type: "condition",
					condition_type: conditionType,
					entityId: condition.id,
					config: {
						...conditionConfig,
						type: conditionType,
					},
				},
			});
		});

		// Add action nodes
		automation.actions?.forEach((action, index) => {
			// Convert backend action format to frontend node config format
			const actionConfig: any = {
				device_id: action.device_id,
			};

			const actionType = action.type;

			if (action.type === "device_control") {
				actionConfig.control_type = "set_value";
				actionConfig.field = action.field;
				actionConfig.value = action.value;
			} else if (action.type === "notify") {
				actionConfig.title = action.notification_title;
				actionConfig.message = action.notification_message;
			} else if (action.type === "log") {
				actionConfig.message = action.value || "";
			}

			// Use database ID for consistent node ID
			const nodeId = `action-${action.id}`;

			// Look for saved position - first by exact node ID match, then by entityId in data
			let savedNode = automation.flow_metadata?.nodes.find((n) => n.id === nodeId);
			if (!savedNode && automation.flow_metadata?.nodes) {
				// Try to find by entityId in node data
				savedNode = automation.flow_metadata.nodes.find((n) => n.id.startsWith("action-") && (n as any).data?.entityId === action.id);
				// Fallback to index position matching
				if (!savedNode) {
					const actionNodes = automation.flow_metadata.nodes.filter((n) => n.id.startsWith("action-"));
					savedNode = actionNodes[index];
					console.log(`No exact match for ${nodeId}, using index ${index}:`, savedNode);
				}
			}
			const position = savedNode?.position || getDefaultPosition(nodeIndex++);

			flowNodes.push({
				id: nodeId,
				type: NODE_TYPES.ACTION,
				position: position,
				data: {
					label: `Action: ${action.type}`,
					type: "action",
					action_type: actionType,
					entityId: action.id,
					config: {
						...actionConfig,
						type: actionType,
					},
				},
			});
		});

		return flowNodes;
	}

	// Convert automation to React Flow edges
	function convertAutomationToEdges(automation: Automation, convertedNodes: Node<FlowData>[]): Edge[] {
		// If we have saved flow metadata with edges, restore them directly
		if (automation.flow_metadata?.edges && automation.flow_metadata.edges.length > 0) {
			const restoredEdges = automation.flow_metadata.edges
				.map((edge) => {
					const sourceExists = convertedNodes.find((n) => n.id === edge.source);
					const targetExists = convertedNodes.find((n) => n.id === edge.target);

					if (sourceExists && targetExists) {
						return {
							id: edge.id,
							source: edge.source,
							target: edge.target,
						};
					}
					return null;
				})
				.filter(Boolean) as Edge[];

			return restoredEdges;
		}

		const edges: Edge[] = [];

		const triggerNodes = convertedNodes.filter((n) => n.data.type === "trigger");
		const conditionNodes = convertedNodes.filter((n) => n.data.type === "condition");
		const actionNodes = convertedNodes.filter((n) => n.data.type === "action");

		let prevNodeId = "start-1";

		// Connect triggers
		triggerNodes.forEach((node) => {
			edges.push({
				id: `edge-${prevNodeId}-${node.id}`,
				source: prevNodeId,
				target: node.id,
			});
			prevNodeId = node.id;
		});

		// Connect conditions
		conditionNodes.forEach((node) => {
			edges.push({
				id: `edge-${prevNodeId}-${node.id}`,
				source: prevNodeId,
				target: node.id,
			});
			prevNodeId = node.id;
		});

		// Connect actions
		actionNodes.forEach((node) => {
			edges.push({
				id: `edge-${prevNodeId}-${node.id}`,
				source: prevNodeId,
				target: node.id,
			});
			prevNodeId = node.id;
		});

		// Connect to end
		if (prevNodeId !== "start-1") {
			edges.push({
				id: `edge-${prevNodeId}-end-1`,
				source: prevNodeId,
				target: "end-1",
			});
		}

		return edges;
	}

	// Node change handlers
	const onNodesChange = useCallback((changes: NodeChange[]) => {
		setNodes((nds) => applyNodeChanges(changes, nds as any) as any);
	}, []);

	const onEdgesChange = useCallback((changes: EdgeChange[]) => {
		setEdges((eds) => applyEdgeChanges(changes, eds));
	}, []);

	const onConnect = useCallback((connection: Connection) => {
		setEdges((eds) => addEdge(connection, eds));
	}, []);

	// Add new node
	const addNode = useCallback(
		(type: "trigger" | "condition" | "action", nodeType: string, viewportCenter?: { x: number; y: number }) => {
			const nodeCount = nodes.filter((n) => n.data.type === type).length;
			const newNode: Node<FlowData> = {
				id: `${type}-${Date.now()}`, // Temporary timestamp-based ID for new nodes
				type: NODE_TYPES[type.toUpperCase() as keyof typeof NODE_TYPES],
				position: getDefaultPosition(nodes.length, viewportCenter),
				data: {
					label: `${type}: ${nodeType}`,
					type,
					// Set the specific type fields for configuration panel
					...(type === "trigger" && { trigger_type: nodeType }),
					...(type === "condition" && { condition_type: nodeType }),
					...(type === "action" && { action_type: nodeType }),
					// No entityId for new nodes - will be set after backend save
					config: {
						type: nodeType,
						device_id: null,
						conditions: {},
					},
				},
			};

			setNodes((nds) => [...nds, newNode]);
		},
		[nodes]
	);

	// Update node configuration
	const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
		setNodes((nds) =>
			nds.map((node) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								config: { ...node.data.config, ...config },
							},
					  }
					: node
			)
		);
	}, []);

	// Remove node
	const removeNode = useCallback((nodeId: string) => {
		setNodes((nds) => nds.filter((node) => node.id !== nodeId));
		setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
	}, []);

	// Validate flow
	const validateFlow = useCallback(() => {
		const errors: string[] = [];

		const triggerNodes = nodes.filter((n) => n.data.type === "trigger");
		const conditionNodes = nodes.filter((n) => n.data.type === "condition");
		const actionNodes = nodes.filter((n) => n.data.type === "action");
		const startNode = nodes.find((n) => n.data.type === "start");
		const endNode = nodes.find((n) => n.data.type === "end");

		// Must have at least one trigger
		if (triggerNodes.length === 0) {
			errors.push(t("flowValidation.atLeastOneTrigger"));
		}

		// Must have at least one action
		if (actionNodes.length === 0) {
			errors.push(t("flowValidation.atLeastOneAction"));
		}

		// Validate triggers - detailed validation matching automationUtils
		triggerNodes.forEach((node, index) => {
			const config = node.data.config;
			const triggerType = node.data.trigger_type || config?.type;

			if (!triggerType) {
				errors.push(t("flowValidation.nodeTypeRequired"));
				return;
			}

			if (triggerType === "time") {
				if (!config?.time) {
					errors.push(t("flowValidation.triggerTimeRequired") + ` (Trigger ${index + 1})`);
				}
			}

			if (triggerType === "mqtt") {
				if (!config?.mqtt_topic) {
					errors.push(t("flowValidation.triggerMqttTopicRequired") + ` (Trigger ${index + 1})`);
				}
			}

			if (triggerType === "state_change") {
				if (!config?.device_id) {
					errors.push(t("flowValidation.triggerStateChangeDeviceRequired") + ` (Trigger ${index + 1})`);
				}
				if (!config?.field) {
					errors.push(t("flowValidation.triggerStateChangeFieldRequired") + ` (Trigger ${index + 1})`);
				}
			}
		});

		// Validate conditions - detailed validation matching automationUtils
		conditionNodes.forEach((node, index) => {
			const config = node.data.config;
			const conditionType = node.data.condition_type || config?.type;

			// Only validate simple conditions thoroughly as they are the main type requiring all fields
			if (conditionType === "simple") {
				if (!config?.device_id) {
					errors.push(t("flowValidation.conditionDeviceRequired") + ` (Condition ${index + 1})`);
				}
				if (!config?.field) {
					errors.push(t("flowValidation.conditionFieldRequired") + ` (Condition ${index + 1})`);
				}
				if (!config?.operator) {
					errors.push(t("flowValidation.conditionOperatorRequired") + ` (Condition ${index + 1})`);
				}
				if (!config?.value && config?.value !== 0 && config?.value !== false) {
					errors.push(t("flowValidation.conditionValueRequired") + ` (Condition ${index + 1})`);
				}
			}
			// Time and day_of_week conditions have different validation requirements and are handled by their specific config checks
		});

		// Validate actions - detailed validation matching automationUtils
		actionNodes.forEach((node, index) => {
			const config = node.data.config;
			const actionType = node.data.action_type || config?.type;

			if (!actionType) {
				errors.push(t("flowValidation.nodeTypeRequired"));
				return;
			}

			if (actionType === "device_control") {
				if (!config?.device_id) {
					errors.push(t("flowValidation.actionDeviceControlDeviceRequired") + ` (Action ${index + 1})`);
				}
				if (!config?.field) {
					errors.push(t("flowValidation.actionDeviceControlFieldRequired") + ` (Action ${index + 1})`);
				}
				if (!config?.value && config?.value !== 0 && config?.value !== false) {
					errors.push(t("flowValidation.actionDeviceControlValueRequired") + ` (Action ${index + 1})`);
				}
			}

			if (actionType === "log") {
				if (!config?.message) {
					errors.push(t("flowValidation.actionLogMessageRequired") + ` (Action ${index + 1})`);
				}
			}

			if (actionType === "notify") {
				if (!config?.message) {
					errors.push(t("flowValidation.notificationMessageRequired") + ` (Action ${index + 1})`);
				}
			}
		});

		// Validate node connections
		const nodeConnections = new Map<string, { incoming: string[]; outgoing: string[] }>();

		// Initialize connection tracking for all nodes
		nodes.forEach((node) => {
			nodeConnections.set(node.id, { incoming: [], outgoing: [] });
		});

		// Track actual connections
		edges.forEach((edge) => {
			const source = nodeConnections.get(edge.source);
			const target = nodeConnections.get(edge.target);
			if (source) source.outgoing.push(edge.target);
			if (target) target.incoming.push(edge.source);
		});

		// Check start node connections
		if (startNode) {
			const startConnections = nodeConnections.get(startNode.id);
			if (startConnections && startConnections.outgoing.length === 0 && (triggerNodes.length > 0 || actionNodes.length > 0)) {
				errors.push(t("flowValidation.startNodeNotConnected"));
			}
		}

		// Check end node connections
		if (endNode) {
			const endConnections = nodeConnections.get(endNode.id);
			if (endConnections && endConnections.incoming.length === 0 && (triggerNodes.length > 0 || actionNodes.length > 0)) {
				errors.push(t("flowValidation.endNodeNotConnected"));
			}
		}

		// Check that all functional nodes (triggers, conditions, actions) are connected
		[...triggerNodes, ...conditionNodes, ...actionNodes].forEach((node) => {
			const connections = nodeConnections.get(node.id);
			if (connections) {
				const hasIncoming = connections.incoming.length > 0;
				const hasOutgoing = connections.outgoing.length > 0;

				// Triggers should have outgoing connections (except if it's the only node)
				if (node.data.type === "trigger" && !hasOutgoing && (conditionNodes.length > 0 || actionNodes.length > 1 || endNode)) {
					errors.push(t("flowValidation.triggerNotConnected"));
				}

				// Actions should have incoming connections (except if it's the only node)
				if (node.data.type === "action" && !hasIncoming && (triggerNodes.length > 0 || conditionNodes.length > 0 || startNode)) {
					errors.push(t("flowValidation.actionNotConnected"));
				}

				// Conditions should have both incoming and outgoing connections
				if (node.data.type === "condition") {
					if (!hasIncoming) {
						errors.push(t("flowValidation.conditionNotConnected"));
					}
					if (!hasOutgoing) {
						errors.push(t("flowValidation.conditionNotConnected"));
					}
				}

				// Check for completely isolated nodes (no connections at all)
				if (!hasIncoming && !hasOutgoing && triggerNodes.length + conditionNodes.length + actionNodes.length > 1) {
					errors.push(t("flowValidation.nodeIsolated"));
				}
			}
		});

		// Check for valid flow path (there should be a path from start to end through functional nodes)
		if (startNode && endNode && (triggerNodes.length > 0 || actionNodes.length > 0)) {
			const visited = new Set<string>();
			const canReachEnd = (nodeId: string): boolean => {
				if (nodeId === endNode.id) return true;
				if (visited.has(nodeId)) return false;
				visited.add(nodeId);

				const connections = nodeConnections.get(nodeId);
				if (!connections) return false;

				return connections.outgoing.some((targetId) => canReachEnd(targetId));
			};

			if (!canReachEnd(startNode.id)) {
				errors.push(t("flowValidation.noPathToEnd"));
			}
		}

		// Validate logical flow order (Triggers → Conditions → Actions)
		const validateFlowOrder = () => {
			// Build a graph to trace execution paths
			const getNodeType = (nodeId: string): string => {
				const node = nodes.find((n) => n.id === nodeId);
				return node?.data.type || "unknown";
			};

			// Check each execution path from triggers to actions
			const checkPathOrder = (currentNodeId: string, visited: Set<string>, path: string[]): string[] => {
				if (visited.has(currentNodeId)) return [];

				const currentType = getNodeType(currentNodeId);
				if (currentType === "start" || currentType === "end") {
					// Continue through start/end nodes without adding them to path
					visited.add(currentNodeId);
					const connections = nodeConnections.get(currentNodeId);
					if (connections) {
						const violations: string[] = [];
						connections.outgoing.forEach((targetId) => {
							violations.push(...checkPathOrder(targetId, new Set(visited), [...path]));
						});
						return violations;
					}
					return [];
				}

				visited.add(currentNodeId);
				const newPath = [...path, currentType];
				const violations: string[] = [];

				// Check for order violations in current path
				for (let i = 0; i < newPath.length - 1; i++) {
					const current = newPath[i];
					const next = newPath[i + 1];

					// Define invalid transitions
					if (current === "action" && next === "condition") {
						violations.push(t("flowValidation.conditionAfterAction"));
					} else if (current === "action" && next === "trigger") {
						violations.push(t("flowValidation.actionBeforeTrigger"));
					} else if (current === "condition" && next === "trigger") {
						violations.push(t("flowValidation.actionBeforeTrigger"));
					}
				}

				// Continue checking downstream paths
				const connections = nodeConnections.get(currentNodeId);
				if (connections) {
					connections.outgoing.forEach((targetId) => {
						violations.push(...checkPathOrder(targetId, new Set(visited), newPath));
					});
				}

				return violations;
			};

			// Start checking from all trigger nodes and the start node
			const orderViolations: string[] = [];

			if (startNode) {
				orderViolations.push(...checkPathOrder(startNode.id, new Set(), []));
			}

			// Also check from any unconnected trigger nodes
			triggerNodes.forEach((trigger) => {
				const connections = nodeConnections.get(trigger.id);
				if (connections && connections.incoming.length === 0) {
					orderViolations.push(...checkPathOrder(trigger.id, new Set(), []));
				}
			});

			return [...new Set(orderViolations)]; // Remove duplicates
		};

		// Add flow order validation errors
		errors.push(...validateFlowOrder());

		setValidationErrors(errors);
		setIsValidFlow(errors.length === 0);

		return { isValid: errors.length === 0, errors };
	}, [nodes, edges, t]);

	// Convert flow to automation request
	const convertFlowToAutomation = useCallback(
		(name: string, description?: string, isDraft: boolean = false, enabled: boolean = false): CreateAutomationRequest | null => {
			// Allow saving as draft without validation
			if (!isDraft && !validateFlow().isValid) {
				return null;
			}

			const triggers: Omit<AutomationTrigger, "id">[] = [];
			const conditions: Omit<AutomationCondition, "id">[] = [];
			const actions: Omit<AutomationAction, "id">[] = [];

			// Extract flow metadata for saving positions and connections
			const flowMetadata: FlowMetadata = {
				nodes: nodes.map((node) => ({
					id: node.id,
					position: node.position,
					type: node.type || "default",
				})),
				edges: edges.map((edge) => ({
					id: edge.id,
					source: edge.source,
					target: edge.target,
				})),
			};

			nodes.forEach((node) => {
				const config = node.data.config;

				if (node.data.type === "trigger" && config) {
					const trigger: any = {
						type: node.data.trigger_type as any,
					};

					// Include entity ID if available (for updates)
					if (node.data.entityId) {
						trigger.id = node.data.entityId;
					}

					// Transform trigger config based on type
					if (node.data.trigger_type === "time") {
						trigger.time_at = config.time;
						trigger.device_id = config.device_id;
						// Default to all days if not specified
						trigger.days_of_week = config.days_of_week || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
					} else if (node.data.trigger_type === "state_change") {
						trigger.device_id = config.device_id;
						trigger.field = config.field;
						// Note: state_change triggers don't need operator and value - they trigger on any change
					} else if (node.data.trigger_type === "interval") {
						// Use interval type directly with interval_seconds
						trigger.type = "interval";
						trigger.device_id = config.device_id;
						// Convert interval from minutes to seconds
						trigger.interval_seconds = config.interval ? config.interval * 60 : 300; // Default 5 minutes
					}

					triggers.push(trigger);
				} else if (node.data.type === "condition" && config) {
					const condition: any = {
						type: (node.data.condition_type as any) || "simple",
					};

					// Include entity ID if available (for updates)
					if (node.data.entityId) {
						condition.id = node.data.entityId;
					}

					// Transform condition config based on type
					if (node.data.condition_type === "simple") {
						// Only add if we have required fields for simple conditions
						if (config.device_id && config.field && config.operator && config.value !== null && config.value !== undefined && config.value !== "") {
							condition.device_id = config.device_id;
							condition.field = config.field;
							condition.operator = config.operator;
							condition.value = config.value;
							conditions.push(condition);
						}
					} else if (node.data.condition_type === "time") {
						if (config.time) {
							condition.time_at = config.time;
							conditions.push(condition);
						}
					} else if (node.data.condition_type === "day_of_week") {
						if (config.days_of_week && config.days_of_week.length > 0) {
							condition.days_of_week = config.days_of_week;
							conditions.push(condition);
						}
					}
				} else if (node.data.type === "action" && config) {
					const action: any = {
						type: node.data.action_type as any,
					};

					// Include entity ID if available (for updates)
					if (node.data.entityId) {
						action.id = node.data.entityId;
					}

					// Transform action config based on type
					if (node.data.action_type === "device_control") {
						action.device_id = config.device_id;
						// Simplified: always use field and value directly
						action.field = config.field;
						// Convert value to string as backend expects string type
						action.value = String(config.value);
					} else if (node.data.action_type === "notify") {
						action.notification_title = config.title || "Automation Notification";
						action.notification_message = config.message;
					} else if (node.data.action_type === "log") {
						// Log actions store message in the value field since there's no dedicated field
						action.value = config.message;
					}

					actions.push(action);
				}
			});

			return {
				name,
				description,
				enabled: isDraft ? false : enabled, // Use provided enabled state for non-drafts, always false for drafts
				is_draft: isDraft,
				flow_metadata: flowMetadata,
				triggers,
				conditions,
				actions,
			};
		},
		[nodes, edges, validateFlow]
	);

	// Reset flow
	const resetFlow = useCallback(() => {
		setNodes(getInitialNodes());
		setEdges([]);
		setSelectedNode(null);
		setValidationErrors([]);
		setIsValidFlow(false);
	}, []);

	// Load automation into flow
	const loadAutomation = useCallback((automation: Automation) => {
		const convertedNodes = convertAutomationToNodes(automation);
		const convertedEdges = convertAutomationToEdges(automation, convertedNodes);
		setNodes(convertedNodes);
		setEdges(convertedEdges);
		setSelectedNode(null);
	}, []);

	// Get node statistics
	const nodeStats = useMemo(() => {
		const triggers = nodes.filter((n) => n.data.type === "trigger").length;
		const conditions = nodes.filter((n) => n.data.type === "condition").length;
		const actions = nodes.filter((n) => n.data.type === "action").length;

		return { triggers, conditions, actions, total: triggers + conditions + actions };
	}, [nodes]);

	return {
		// Flow state
		nodes,
		edges,
		selectedNode,
		isValidFlow,
		validationErrors,
		nodeStats,

		// Flow handlers
		onNodesChange,
		onEdgesChange,
		onConnect,

		// Node operations
		addNode,
		updateNodeConfig,
		removeNode,
		setSelectedNode,

		// Flow operations
		validateFlow,
		convertFlowToAutomation,
		resetFlow,
		loadAutomation,

		// Direct setters
		setNodes,
		setEdges,
	};
};

export default useAutomationFlow;
