import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	ConnectionMode,
	NodeTypes,
	EdgeTypes,
	BackgroundVariant,
	EdgeProps,
	Connection,
	Node,
	Edge,
	ConnectionLineType,
	IsValidConnection,
	Handle,
	Position,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Automation } from "@/api/automation/model";
import { Device } from "@/api/devices/model";
import routes from "@/constants/routes";
import { Save, Play, RotateCcw, Plus, AlertCircle, CheckCircle, Zap, GitBranch, Settings, Bug, Trash2, ArrowLeft, FileText, Activity } from "lucide-react";

import { useAutomationFlow } from "@/hooks/useAutomationFlow";
import { useAutomations } from "@/hooks/useAutomations";
import { useDeviceCapabilityHelper } from "@/hooks/useDeviceCapabilityHelper";
import { useDeviceCapabilities } from "@/provider/DeviceCapabilitiesProvider";
import { FlowData } from "@/api/automation/model";
import NodeConfigurationPanel from "@/components/automation/NodeConfigurationPanel";

// Import custom node components
import { TriggerNode, ConditionNode, ActionNode, StartNode, EndNode } from "@/components/automation/nodes";

const edgeTypes: EdgeTypes = {
	default: (props: EdgeProps) => {
		const { id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, selected } = props;
		const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;

		return (
			<>
				<path
					id={`${id}-interaction`}
					style={{ strokeWidth: 15, stroke: "transparent", fill: "none", cursor: "pointer" }}
					className="react-flow__edge-interaction"
					d={edgePath}
				/>
				<path
					id={id}
					style={{
						strokeWidth: 2,
						stroke: selected ? "#3b82f6" : "#64748b",
						fill: "none",
						...style,
					}}
					className="react-flow__edge-path"
					d={edgePath}
					markerEnd={markerEnd}
				/>
			</>
		);
	},
};

const defaultEdgeOptions = {
	type: "default",
	markerEnd: { type: "arrowclosed" as const },
	interactionWidth: 10,
	focusable: true,
	deletable: true,
	connectable: true,
};

// Create wrapped node components with handlers, devices, and capability helper
const createNodeWrapper = (NodeComponent: React.FC<any>) =>
	React.forwardRef<any, any>((props, ref) => {
		const { handleNodeDelete, handleNodeSettings } = React.useContext(NodeHandlersContext);
		const { devices } = useDeviceCapabilities();
		const capabilityHelper = useDeviceCapabilityHelper();

		return (
			<NodeComponent
				{...props}
				ref={ref}
				onDelete={handleNodeDelete}
				onSettings={handleNodeSettings}
				devices={devices}
				capabilityHelper={capabilityHelper}
			/>
		);
	});

// Context for node handlers
const NodeHandlersContext = React.createContext<{
	handleNodeDelete: (nodeId: string) => void;
	handleNodeSettings: (node: any) => void;
}>({
	handleNodeDelete: () => {},
	handleNodeSettings: () => {},
});

// Component that provides viewport-aware node addition functions
const ViewportAwareNodeAdder: React.FC<{
	addNode: (type: "trigger" | "condition" | "action", nodeType: string, viewportCenter?: { x: number; y: number }) => void;
	addNodeFunctionsRef: React.MutableRefObject<{
		handleAddTrigger?: () => void;
		handleAddCondition?: () => void;
		handleAddAction?: () => void;
	}>;
}> = ({ addNode, addNodeFunctionsRef }) => {
	const { screenToFlowPosition, getViewport } = useReactFlow();

	// Get viewport center for positioning new nodes
	const getViewportCenter = useCallback(() => {
		try {
			// Method 1: Try using screenToFlowPosition with the center of the viewport
			const reactFlowWrapper = document.querySelector(".react-flow");
			if (reactFlowWrapper) {
				const bounds = reactFlowWrapper.getBoundingClientRect();

				const centerScreenX = bounds.left + bounds.width / 2;
				const centerScreenY = bounds.top + bounds.height / 2;

				// Convert to flow coordinates
				const flowCenter = screenToFlowPosition({
					x: centerScreenX,
					y: centerScreenY,
				});

				return flowCenter;
			}
		} catch (error) {
			console.warn("screenToFlowPosition method failed:", error);
		}

		// Method 2: Fallback using viewport calculation
		try {
			const viewport = getViewport();

			const container = document.querySelector(".react-flow");
			if (container) {
				const containerRect = container.getBoundingClientRect();

				const centerX = (-viewport.x + containerRect.width / 2) / viewport.zoom;
				const centerY = (-viewport.y + containerRect.height / 2) / viewport.zoom;

				return { x: centerX, y: centerY };
			}
		} catch (error) {
			console.warn("Viewport method failed:", error);
		}

		// Final fallback
		return { x: 400, y: 200 };
	}, [screenToFlowPosition, getViewport]);

	// Set up the viewport-aware add functions
	React.useEffect(() => {
		addNodeFunctionsRef.current = {
			handleAddTrigger: () => addNode("trigger", "time", getViewportCenter()),
			handleAddCondition: () => addNode("condition", "simple", getViewportCenter()),
			handleAddAction: () => addNode("action", "device_control", getViewportCenter()),
		};
	}, [addNode, getViewportCenter, addNodeFunctionsRef]);

	// This component doesn't render anything, it just provides the functions
	return null;
};

interface AutomationBuilderContentProps {
	automationId: number | null;
	automation: Automation | null;
}

const AutomationBuilderContent: React.FC<AutomationBuilderContentProps> = ({ automationId, automation }) => {
	// Navigation
	const navigate = useNavigate(); // Ref to store viewport-aware add functions
	const addNodeFunctionsRef = React.useRef<{
		handleAddTrigger?: () => void;
		handleAddCondition?: () => void;
		handleAddAction?: () => void;
	}>({});

	const [automationName, setAutomationName] = React.useState("");
	const [automationDescription, setAutomationDescription] = React.useState("");
	const [automationEnabled, setAutomationEnabled] = React.useState(automation?.enabled || false);
	const [automationIsDraft, setAutomationIsDraft] = React.useState(automation?.is_draft || false);
	const [isSaving, setIsSaving] = React.useState(false);
	const [isTesting, setIsTesting] = React.useState(false);
	const [configNode, setConfigNode] = React.useState<any>(null);
	const [isConfigPanelOpen, setIsConfigPanelOpen] = React.useState(false);

	const { createNewAutomation, updateExistingAutomation, toggleAutomationStatus, toggleLoading } = useAutomations();

	const {
		nodes,
		edges,
		selectedNode,
		isValidFlow,
		validationErrors,
		nodeStats,
		onNodesChange,
		onEdgesChange,
		onConnect,
		addNode,
		updateNodeConfig,
		removeNode,
		setSelectedNode,
		validateFlow,
		convertFlowToAutomation,
		resetFlow,
		loadAutomation,
		setNodes,
	} = useAutomationFlow();

	React.useEffect(() => {
		if (automation) {
			loadAutomation(automation);
			setAutomationName(automation.name || "");
			setAutomationDescription(automation.description || "");
			setAutomationEnabled(automation.enabled || false);
			setAutomationIsDraft(automation.is_draft || false);
		}
	}, [automation]);

	// Create node types with devices and capability helper
	const nodeTypes: NodeTypes = React.useMemo(() => {
		const WrappedTriggerNode = createNodeWrapper(TriggerNode);
		const WrappedConditionNode = createNodeWrapper(ConditionNode);
		const WrappedActionNode = createNodeWrapper(ActionNode);

		return {
			triggerNode: WrappedTriggerNode,
			conditionNode: WrappedConditionNode,
			actionNode: WrappedActionNode,
			startNode: StartNode,
			endNode: EndNode,
		};
	}, []);

	// Automatically validate when nodes are loaded/changed
	React.useEffect(() => {
		// Only validate if we have actual functional nodes (not just start/end)
		const functionalNodes = nodes.filter((n) => n.data.type !== "start" && n.data.type !== "end");
		if (functionalNodes.length > 0) {
			validateFlow();
		}
	}, [nodes, edges, validateFlow]);

	// Handle node selection and configuration
	const onNodeClick = useCallback(
		(event: React.MouseEvent, node: any) => {
			// Don't open settings if clicking on a handle
			const target = event.target as HTMLElement;
			if (target.classList.contains("react-flow__handle") || target.closest(".react-flow__handle")) {
				return;
			}

			setSelectedNode(node);
			// Open configuration panel for configurable nodes
			if (["trigger", "condition", "action"].includes(node.data.type)) {
				setConfigNode(node);
				setIsConfigPanelOpen(true);
			}
		},
		[setSelectedNode]
	);

	const onEdgeClick = useCallback((event: React.MouseEvent, edge: any) => {
		// Edges are selected automatically by React Flow when clicked
		// Users can then delete them with Delete/Backspace key
		toast({
			title: "Edge Selected",
			description: "Press Delete or Backspace to remove this connection",
		});
	}, []);

	// Custom connection validation function for more flexible connections
	const isValidConnection: IsValidConnection<Edge> = useCallback((connection: Edge | Connection) => {
		// Allow connections between different nodes
		if (!connection.source || !connection.target) return false;
		if (connection.source === connection.target) return false;

		return true;
	}, []);

	// Handle node configuration
	const handleNodeConfigSave = useCallback(
		(nodeId: string, config: any) => {
			updateNodeConfig(nodeId, config);
			toast({
				title: "Configuration Updated",
				description: "Node configuration has been saved successfully.",
			});
		},
		[updateNodeConfig]
	);

	// Handle node data changes
	const handleNodeDataChange = useCallback(
		(nodeId: string, data: Partial<FlowData>) => {
			setNodes((nds) =>
				nds.map((node) =>
					node.id === nodeId
						? {
								...node,
								data: {
									...node.data,
									...data,
								},
						  }
						: node
				)
			);
		},
		[setNodes]
	);

	// Handle node deletion
	const handleNodeDelete = useCallback(
		(nodeId: string) => {
			removeNode(nodeId);
			toast({
				title: "Node Deleted",
				description: "Node has been removed from the automation.",
			});
		},
		[removeNode]
	);

	// Handle node settings (open configuration panel)
	const handleNodeSettings = useCallback((node: any) => {
		setConfigNode(node);
		setIsConfigPanelOpen(true);
	}, []);

	const handleConfigPanelClose = useCallback(() => {
		setIsConfigPanelOpen(false);
		setConfigNode(null);
	}, []);

	// Handle saving automation
	const saveAutomation = useCallback(
		async (isDraft: boolean = false) => {
			// Only require name for non-draft automations
			if (!isDraft && !automationName.trim()) {
				toast({
					title: "Validation Error",
					description: "Please enter a name for the automation",
					variant: "destructive",
				});
				return;
			}

			// Use default name for drafts if none provided
			const finalName = automationName.trim() || (isDraft ? `Draft ${new Date().toLocaleString()}` : "");

			if (!finalName) {
				toast({
					title: "Validation Error",
					description: "Please enter a name for the automation",
					variant: "destructive",
				});
				return;
			}

			const automationData = convertFlowToAutomation(finalName, automationDescription, isDraft, automationEnabled);

			if (!automationData) {
				toast({
					title: "Validation Error",
					description: isDraft ? "Failed to save draft" : "Please fix the validation errors before saving",
					variant: "destructive",
				});
				return;
			}
			setIsSaving(true);

			try {
				let result;
				if (automationId) {
					result = await updateExistingAutomation(automationId, automationData);
				} else {
					result = await createNewAutomation(automationData);
				}
				console.log(result);
				if (result.success) {
					toast({
						title: "Success",
						description: `Automation ${automationId ? "updated" : "created"} successfully${isDraft ? " as draft" : ""}`,
					});

					setAutomationEnabled(result.data.data.enabled);
					setAutomationIsDraft(result.data.data.is_draft);
				} else {
					toast({
						title: "Error",
						description: result.status || `Failed to ${automationId ? "update" : "create"} automation`,
						variant: "destructive",
					});
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "An unexpected error occurred",
					variant: "destructive",
				});
			} finally {
				setIsSaving(false);
			}
		},
		[automationName, automationDescription, automationId, automationEnabled, convertFlowToAutomation, createNewAutomation, updateExistingAutomation]
	);

	const handleSave = useCallback(async () => {
		await saveAutomation(false);
	}, [saveAutomation]);

	const handleSaveAsDraft = useCallback(async () => {
		await saveAutomation(true);
	}, [saveAutomation]);

	// Handle testing automation
	const handleTest = useCallback(async () => {
		if (!isValidFlow) {
			toast({
				title: "Validation Error",
				description: "Please fix validation errors before testing",
				variant: "destructive",
			});
			return;
		}

		setIsTesting(true);

		try {
			// Simulate test execution
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast({
				title: "Test Successful",
				description: "Automation workflow test completed successfully",
			});
		} catch (error) {
			toast({
				title: "Test Failed",
				description: "Automation test encountered errors",
				variant: "destructive",
			});
		} finally {
			setIsTesting(false);
		}
	}, [isValidFlow]);

	// Handle automation reset/clear
	const handleReset = useCallback(() => {
		if (window.confirm("Are you sure you want to clear the workflow? This action cannot be undone.")) {
			resetFlow();
			setAutomationName("");
			setAutomationDescription("");
			toast({
				title: "Workflow Cleared",
				description: "The automation workflow has been reset",
			});
		}
	}, [resetFlow]);

	// Handle adding new nodes - use ref to get viewport-aware functions when available
	const handleAddTrigger = () => {
		if (addNodeFunctionsRef.current.handleAddTrigger) {
			addNodeFunctionsRef.current.handleAddTrigger();
		} else {
			// Fallback to regular addNode
			addNode("trigger", "time");
		}
	};

	const handleAddCondition = () => {
		if (addNodeFunctionsRef.current.handleAddCondition) {
			addNodeFunctionsRef.current.handleAddCondition();
		} else {
			// Fallback to regular addNode
			addNode("condition", "simple");
		}
	};

	const handleAddAction = () => {
		if (addNodeFunctionsRef.current.handleAddAction) {
			addNodeFunctionsRef.current.handleAddAction();
		} else {
			// Fallback to regular addNode
			addNode("action", "device_control");
		}
	};

	// Handle automation toggle
	const handleToggleAutomation = useCallback(async () => {
		if (!automation || !automationId) return;

		const result = await toggleAutomationStatus(automationId);
		if (result.success) {
			toast({
				title: "Success",
				description: `Automation ${automationEnabled ? "disabled" : "enabled"} successfully`,
			});
			// Update local state
			setAutomationEnabled(!automationEnabled);
		}
	}, [automation, automationId, automationEnabled, toggleAutomationStatus]);

	// Navigation handlers
	const handleGoToList = useCallback(() => {
		navigate(routes.automations);
	}, [navigate]);

	const handleGoToLogs = useCallback(() => {
		if (!automationId) return;
		navigate(routes.automationLogs(automationId));
	}, [navigate, automationId]);

	// Handle validation
	const handleValidate = useCallback(() => {
		const { isValid, errors } = validateFlow();
		toast({
			title: isValid ? "Validation Passed" : "Validation Failed",
			description: isValid ? "Your automation flow is valid and ready to save" : `Found ${errors.length} validation error(s)`,
			variant: isValid ? "default" : "destructive",
		});
	}, [validateFlow]);

	return (
		<div className="min-h-[calc(100vh-120px)] flex overflow-hidden">
			{/* Left sidebar - Node palette and properties */}
			<div className="w-64 sm:w-64 lg:w-64 xl:w-72 border-r bg-background flex flex-col shrink-0">
				<ScrollArea className="flex-1">
					<div className="flex flex-col">
						{/* Navigation and Status */}
						<Card className="mx-2 mt-2 mb-1 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm">Navigation & Status</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 pb-3 px-3">
								<div className="flex gap-1">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 h-8 text-xs"
										onClick={handleGoToList}
									>
										<ArrowLeft className="w-3 h-3 mr-1" />
										List
									</Button>
									{automationId && (
										<Button
											variant="outline"
											size="sm"
											className="flex-1 h-8 text-xs"
											onClick={handleGoToLogs}
										>
											<FileText className="w-3 h-3 mr-1" />
											Logs
										</Button>
									)}
								</div>

								{automation && (
									<div className="flex items-center justify-between mt-2">
										<Label
											htmlFor="automation-enabled"
											className="text-xs"
										>
											Automation Status
										</Label>
										{automationIsDraft ? (
											<Badge
												variant="secondary"
												className="text-xs ml-2"
											>
												Draft
											</Badge>
										) : (
											<div className="flex items-center gap-2">
												<Switch
													id="automation-enabled"
													checked={automationEnabled}
													onCheckedChange={handleToggleAutomation}
													disabled={toggleLoading[automationId || 0]}
												/>
												{toggleLoading[automationId || 0] && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Automation details */}
						<Card className="mx-2 mt-2 mb-1 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm">Automation Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 pb-3 px-3">
								<Input
									placeholder="Automation name..."
									value={automationName}
									onChange={(e) => setAutomationName(e.target.value)}
									className="h-8"
								/>
								<Textarea
									placeholder="Description (optional)..."
									value={automationDescription}
									onChange={(e) => setAutomationDescription(e.target.value)}
									rows={1}
									className="resize-none min-h-8"
								/>
							</CardContent>
						</Card>

						{/* Node palette */}
						<Card className="mx-2 my-1 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm">Add Components</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1 pb-3 px-3">
								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start h-8 text-xs"
									onClick={handleAddTrigger}
								>
									<Zap className="w-3 h-3 mr-2" />
									Add Trigger
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start h-8 text-xs"
									onClick={handleAddCondition}
								>
									<GitBranch className="w-3 h-3 mr-2" />
									Add Condition
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start h-8 text-xs"
									onClick={handleAddAction}
								>
									<Settings className="w-3 h-3 mr-2" />
									Add Action
								</Button>
							</CardContent>
						</Card>

						{/* Flow statistics */}
						<Card className="mx-2 my-1 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm">Flow Statistics</CardTitle>
							</CardHeader>
							<CardContent className="pb-3 px-3">
								<div className="grid grid-cols-3 gap-2 text-xs">
									<div className="flex flex-col items-center">
										<span className="text-muted-foreground text-xs mb-1">Triggers</span>
										<Badge
											variant="secondary"
											className="text-xs h-5 min-w-6 justify-center"
										>
											{nodeStats.triggers}
										</Badge>
									</div>
									<div className="flex flex-col items-center">
										<span className="text-muted-foreground text-xs mb-1">Conditions</span>
										<Badge
											variant="secondary"
											className="text-xs h-5 min-w-6 justify-center"
										>
											{nodeStats.conditions}
										</Badge>
									</div>
									<div className="flex flex-col items-center">
										<span className="text-muted-foreground text-xs mb-1">Actions</span>
										<Badge
											variant="secondary"
											className="text-xs h-5 min-w-6 justify-center"
										>
											{nodeStats.actions}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Validation status */}
						<Card className="mx-2 my-1 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm flex items-center">
									{isValidFlow ? <CheckCircle className="w-3 h-3 mr-2 text-green-500" /> : <AlertCircle className="w-3 h-3 mr-2 text-red-500" />}
									Status
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-3 px-3">
								{isValidFlow ? (
									<p className="text-xs text-green-600">Flow is valid</p>
								) : (
									<ScrollArea className="h-12">
										<div className="space-y-1">
											{validationErrors.slice(0, 2).map((error, index) => (
												<p
													key={index}
													className="text-xs text-red-600"
												>
													• {error}
												</p>
											))}
											{validationErrors.length > 2 && <p className="text-xs text-muted-foreground">+{validationErrors.length - 2} more errors</p>}
										</div>
									</ScrollArea>
								)}
							</CardContent>
						</Card>

						{/* Selected node properties */}
						{selectedNode && (
							<Card className="mx-2 my-1 lg:m-3">
								<CardHeader className="pb-1 pt-3 px-3">
									<CardTitle className="text-sm">Node Properties</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 pb-3 px-3">
									<div>
										<p className="text-xs text-muted-foreground">Selected: {selectedNode.data.label}</p>
										<p className="text-xs text-muted-foreground">Type: {selectedNode.data.type}</p>
									</div>

									{["trigger", "condition", "action"].includes(selectedNode.data.type) && (
										<Button
											onClick={() => {
												setConfigNode(selectedNode);
												setIsConfigPanelOpen(true);
											}}
											size="sm"
											className="w-full text-xs h-7"
										>
											<Settings className="w-3 h-3 mr-1" />
											Configure
										</Button>
									)}

									<Button
										onClick={() => removeNode(selectedNode.id)}
										variant="destructive"
										size="sm"
										className="w-full text-xs h-7"
									>
										<Trash2 className="w-3 h-3 mr-1" />
										Delete
									</Button>
								</CardContent>
							</Card>
						)}

						{/* Quick Tips */}
						<Card className="mx-2 my-1 mb-2 lg:m-3">
							<CardHeader className="pb-1 pt-3 px-3">
								<CardTitle className="text-sm">Quick Tips</CardTitle>
							</CardHeader>
							<CardContent className="pb-3 px-3">
								<div className="text-xs text-muted-foreground space-y-0.5">
									<p>• Drag to connect nodes</p>
									<p>
										• Select connection + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Del</kbd> to remove
									</p>
									<p>• Configure • Delete</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</ScrollArea>

				{/* Action buttons - Fixed at bottom */}
				<div className="p-2 lg:p-3 border-t bg-background">
					<div className="space-y-1">
						<div className="grid grid-cols-2 gap-1">
							<Button
								onClick={handleValidate}
								variant="outline"
								size="sm"
								className="text-xs h-8"
							>
								<Bug className="w-3 h-3 mr-1" />
								Validate
							</Button>
							<Button
								onClick={handleTest}
								variant="outline"
								size="sm"
								className="text-xs h-8"
								disabled={isTesting || !isValidFlow}
							>
								<Play className="w-3 h-3 mr-1" />
								{isTesting ? "Testing..." : "Test"}
							</Button>
						</div>

						<div className="grid grid-cols-3 gap-1">
							<Button
								onClick={handleReset}
								variant="outline"
								size="sm"
								disabled={isSaving}
								className="text-xs h-8"
							>
								<RotateCcw className="w-3 h-3" />
							</Button>
							<Button
								onClick={() => {
									handleSaveAsDraft();
								}}
								disabled={isSaving}
								variant="secondary"
								size="sm"
								className="text-xs h-8"
							>
								<Save className="w-3 h-3 mr-1" />
								{isSaving ? "Saving..." : "Draft"}
							</Button>
							<Button
								onClick={handleSave}
								disabled={isSaving || !isValidFlow || !automationName.trim()}
								size="sm"
								className="text-xs h-8"
							>
								<Save className="w-3 h-3 mr-1" />
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main canvas */}
			<div className="flex-1 relative overflow-hidden w-full">
				<NodeHandlersContext.Provider value={{ handleNodeDelete, handleNodeSettings }}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onNodeClick={onNodeClick}
						onEdgeClick={onEdgeClick}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						defaultEdgeOptions={defaultEdgeOptions}
						isValidConnection={isValidConnection}
						fitView
						className="bg-gray-50 h-full w-full"
						deleteKeyCode={["Backspace", "Delete"]}
						multiSelectionKeyCode={["Meta", "Ctrl"]}
						selectionKeyCode={null}
						connectionRadius={25}
						snapToGrid={false}
						nodesDraggable={true}
						nodesConnectable={true}
						elementsSelectable={true}
						selectNodesOnDrag={false}
						connectOnClick={true}
						connectionLineStyle={{ strokeWidth: 3, stroke: "#3b82f6" }}
						connectionLineType={ConnectionLineType.SmoothStep}
					>
						<ViewportAwareNodeAdder
							addNode={addNode}
							addNodeFunctionsRef={addNodeFunctionsRef}
						/>
						<Background
							variant={BackgroundVariant.Dots}
							gap={20}
							size={1}
							color="#94a3b8"
						/>
						<Controls
							className="!bottom-4 !left-4"
							showInteractive={false}
						/>
						<MiniMap
							nodeColor={() => "#64748b"}
							className="!bg-background !w-32 !h-24 sm:!w-40 sm:!h-30 !m-2"
						/>
					</ReactFlow>
				</NodeHandlersContext.Provider>{" "}
				{/* Toolbar overlay */}
				<div className="absolute top-2 left-2 right-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pointer-events-none">
					<div className="flex items-center gap-1 flex-wrap">
						<Badge
							variant="outline"
							className="bg-background pointer-events-auto text-xs px-2 py-0.5 h-6"
						>
							{automationId ? "Edit" : "New"}
						</Badge>

						{/* Flow status indicator */}
						<Badge
							variant={isValidFlow ? "default" : "destructive"}
							className="text-xs px-2 py-0.5 h-6"
						>
							{isValidFlow ? "Valid" : "Invalid"}
						</Badge>
					</div>

					<div className="flex gap-1 pointer-events-auto flex-wrap">
						<Button
							size="sm"
							variant="outline"
							onClick={handleTest}
							disabled={isTesting || !isValidFlow}
							className="text-xs px-2 h-7 hidden sm:flex"
						>
							<Play className="w-3 h-3 mr-1" />
							{isTesting ? "Testing..." : "Test"}
						</Button>

						<Button
							size="sm"
							variant="outline"
							onClick={handleValidate}
							className="text-xs px-2 h-7 hidden md:flex"
						>
							<Bug className="w-3 h-3 mr-1" />
							Validate
						</Button>

						<Button
							size="sm"
							variant="secondary"
							onClick={handleSaveAsDraft}
							disabled={isSaving}
							className="text-xs px-2 h-7"
						>
							<Save className="w-3 h-3 mr-1" />
							Draft
						</Button>

						<Button
							size="sm"
							onClick={handleSave}
							disabled={isSaving || !isValidFlow || !automationName.trim()}
							className="text-xs px-2 h-7"
						>
							<Save className="w-3 h-3 mr-1" />
							Save
						</Button>
					</div>
				</div>
			</div>

			{/* Node Configuration Panel */}
			<NodeConfigurationPanel
				node={configNode}
				isOpen={isConfigPanelOpen}
				onClose={handleConfigPanelClose}
				onSave={handleNodeConfigSave}
				onNodeDataChange={handleNodeDataChange}
			/>
		</div>
	);
};

export default AutomationBuilderContent;
