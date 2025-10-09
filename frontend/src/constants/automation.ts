import { Bell, FileText, Activity, Settings, Clock, Calendar, Code, GitBranch, Zap, Rss, Repeat, LucideIcon } from "lucide-react";

// Constants and configuration data for automation functionality

// Node types for React Flow
export const NODE_TYPES = {
	TRIGGER: "triggerNode",
	CONDITION: "conditionNode",
	ACTION: "actionNode",
	START: "startNode",
	END: "endNode",
} as const;

// Trigger types with metadata
export const getTriggerTypes = () => [
	{
		value: "time",
		label: "Time-based",
		description: "Execute at specific times and days",
	},
	{
		value: "state_change",
		label: "Device State Change",
		description: "Execute when device state changes",
	},
	{
		value: "interval",
		label: "Interval",
		description: "Execute at regular intervals",
	},
];

// Condition types with metadata
export const getConditionTypes = () => [
	{
		value: "simple",
		label: "Simple Condition",
		description: "Compare device value with a threshold",
	},
	{
		value: "time",
		label: "Time Condition",
		description: "Check specific time",
	},
	{
		value: "day_of_week",
		label: "Day of Week",
		description: "Check specific days of the week",
	},
];

// Action types with metadata
export const getActionTypes = () => [
	{
		value: "device_control",
		label: "Control Device",
		description: "Change device parameters",
	},
	{
		value: "notify",
		label: "Send Notification",
		description: "Send notification to user",
	},
	{
		value: "log",
		label: "Log Message",
		description: "Write entry to automation log",
	},
];

// Icon component mappings for trigger types
export const getTriggerIconComponent = (type: string): LucideIcon => {
	switch (type) {
		case "time":
			return Clock;
		case "mqtt":
			return Rss;
		case "state_change":
			return Activity;
		case "interval":
			return Repeat;
		default:
			return Zap;
	}
};

// Icon component mappings for condition types
export const getConditionIconComponent = (type: string): LucideIcon => {
	switch (type) {
		case "time":
			return Clock;
		case "day_of_week":
			return Calendar;
		case "advanced":
			return Code;
		case "simple":
		default:
			return GitBranch;
	}
};

// Icon component mappings for action types
export const getActionIconComponent = (type: string): LucideIcon => {
	switch (type) {
		case "notify":
			return Bell;
		case "log":
			return FileText;
		case "device_control":
			return Activity;
		default:
			return Settings;
	}
};

// Label mappings for trigger types
export const getTriggerTypeLabel = (type: string) => {
	switch (type) {
		case "time":
			return "Time";
		case "state_change":
			return "State Change";
		case "interval":
			return "Interval";
		default:
			return "Unknown";
	}
};

// Label mappings for condition types
export const getConditionTypeLabel = (type: string) => {
	switch (type) {
		case "simple":
			return "Simple";
		case "time":
			return "Time";
		case "day_of_week":
			return "Day of Week";
		default:
			return "Condition";
	}
};

// Label mappings for action types
export const getActionTypeLabel = (type: string) => {
	switch (type) {
		case "device_control":
			return "Device Control";
		case "notify":
			return "Notification";
		case "log":
			return "Log";
		default:
			return "Unknown";
	}
};

// Operator symbol mappings
export const getOperatorSymbol = (operator: string) => {
	switch (operator) {
		case "<":
			return "<";
		case "<=":
			return "≤";
		case "=":
			return "=";
		case ">=":
			return "≥";
		case ">":
			return ">";
		case "!=":
			return "≠";
		default:
			return "?";
	}
};

// Available operators based on field type
export const getOperators = (fieldType: string): { value: string; label: string }[] => {
	const numericOperators = [
		{ value: "<", label: "Less than" },
		{ value: "<=", label: "Less than or equal" },
		{ value: "=", label: "Equal to" },
		{ value: ">=", label: "Greater than or equal" },
		{ value: ">", label: "Greater than" },
		{ value: "!=", label: "Not equal to" },
	];

	const stringOperators = [
		{ value: "=", label: "Equal to" },
		{ value: "!=", label: "Not equal to" },
	];

	return fieldType === "number" ? numericOperators : stringOperators;
};

// Days of week options (full names for configuration)
export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Days of week options with metadata
export const getDaysOfWeek = (): { value: string; label: string; short: string }[] => {
	return [
		{ value: "mon", label: "Monday", short: "Mon" },
		{ value: "tue", label: "Tuesday", short: "Tue" },
		{ value: "wed", label: "Wednesday", short: "Wed" },
		{ value: "thu", label: "Thursday", short: "Thu" },
		{ value: "fri", label: "Friday", short: "Fri" },
		{ value: "sat", label: "Saturday", short: "Sat" },
		{ value: "sun", label: "Sunday", short: "Sun" },
	];
};
