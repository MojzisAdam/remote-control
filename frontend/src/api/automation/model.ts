export type TriggerType = "time" | "interval" | "mqtt" | "state_change";
export type ConditionType = "simple" | "time" | "day_of_week";
export type ActionType = "mqtt_publish" | "notify" | "log" | "device_control";
export type OperatorType = "<" | "<=" | "=" | ">=" | ">" | "!=";
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type AutomationStatus = "success" | "failed" | "skipped" | "partial" | "warning";

// Flow metadata for storing node positions and connections
export interface FlowMetadata {
	nodes: Array<{
		id: string;
		position: { x: number; y: number };
		type: string;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
	}>;
}

export interface AutomationTrigger {
	id?: number;
	type: TriggerType;
	// Time trigger fields
	time_at?: string; // HH:mm format
	days_of_week?: DayOfWeek[];
	// Interval trigger fields
	interval_seconds?: number;
	// MQTT trigger fields
	mqtt_topic?: string;
	mqtt_payload?: Record<string, any>;
	// State change trigger fields
	device_id?: string;
	field?: string;
	operator?: OperatorType;
	value?: string;
}

export interface AutomationCondition {
	id?: number;
	type?: ConditionType;
	// Simple condition fields
	device_id?: string;
	field?: string;
	operator?: OperatorType;
	operator_text?: string;
	value?: string;
	// Time condition fields
	time_at?: string; // HH:mm format
	// Day of week condition fields
	days_of_week?: DayOfWeek[];
}

export interface AutomationAction {
	id?: number;
	type: ActionType;
	// MQTT publish action fields
	mqtt_topic?: string;
	mqtt_payload?: Record<string, any>;
	// Device control action fields
	device_id?: string;
	field?: string;
	value?: string;
	// Notification action fields
	notification_title?: string;
	notification_message?: string;
}

export interface AutomationLog {
	id: number;
	automation_id: number;
	executed_at: string;
	status: AutomationStatus;
	details?: string;
	is_successful: boolean;
	is_failed: boolean;
	is_skipped?: boolean;
	is_partial?: boolean;
	is_warning?: boolean;
	is_problematic?: boolean;
	was_not_executed?: boolean;
	created_at: string;
	updated_at: string;
	automation?: {
		id: number;
		name: string;
		enabled: boolean;
	};
	status_text: string;
	status_description?: string;
	status_color_class?: string;
	execution_time?: string;
}

export interface AutomationStats {
	total_executions: number;
	successful_executions: number;
	failed_executions: number;
	last_execution?: string;
}

export interface Automation {
	id: number;
	name: string;
	description?: string;
	enabled: boolean;
	is_draft?: boolean;
	flow_metadata?: FlowMetadata;
	created_at: string;
	updated_at: string;
	triggers?: AutomationTrigger[];
	conditions?: AutomationCondition[];
	actions?: AutomationAction[];
	recent_logs?: AutomationLog[];
	stats?: AutomationStats;
}

export interface CreateAutomationRequest {
	name: string;
	description?: string;
	enabled?: boolean;
	is_draft?: boolean;
	flow_metadata?: FlowMetadata;
	triggers: Omit<AutomationTrigger, "id">[];
	conditions?: Omit<AutomationCondition, "id">[];
	actions: Omit<AutomationAction, "id">[];
}

export interface UpdateAutomationRequest {
	name?: string;
	description?: string;
	enabled?: boolean;
	is_draft?: boolean;
	flow_metadata?: FlowMetadata;
	triggers?: Omit<AutomationTrigger, "id">[];
	conditions?: Omit<AutomationCondition, "id">[];
	actions?: Omit<AutomationAction, "id">[];
}

export interface AutomationListResponse {
	data: Automation[];
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
	from: number;
	to: number;
}

export interface AutomationLogsResponse {
	data: AutomationLog[];
	meta?: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		from: number;
		to: number;
	};
}

// React Flow Node Types for the visual builder
export interface AutomationFlowNode {
	id: string;
	type: "trigger" | "condition" | "action";
	position: { x: number; y: number };
	data: AutomationTrigger | AutomationCondition | AutomationAction;
}

export interface AutomationFlowEdge {
	id: string;
	source: string;
	target: string;
	type?: string;
}

export interface AutomationFlow {
	nodes: AutomationFlowNode[];
	edges: AutomationFlowEdge[];
}

// Form validation types
export interface AutomationFormData {
	name: string;
	description: string;
	enabled: boolean;
	triggers: AutomationTrigger[];
	conditions: AutomationCondition[];
	actions: AutomationAction[];
}

export interface DeviceFieldOption {
	key: string;
	label: string;
	type: "number" | "string" | "boolean";
	unit?: string;
}

// React Flow types for automation builder
export interface FlowData extends Record<string, unknown> {
	label: string;
	type: "trigger" | "condition" | "action" | "start" | "end";
	config?: Record<string, any>;
	entityId?: number;
}

export interface FlowNode {
	id: string;
	type: string;
	position: { x: number; y: number };
	data: FlowData;
	deletable?: boolean;
}

// Type aliases for existing interfaces to match the hook expectations
export type Trigger = AutomationTrigger;
export type Condition = AutomationCondition;
export type Action = AutomationAction;
