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
		labelKey: "constants.triggerTypes.time",
		description: "Execute at specific times and days",
		descriptionKey: "constants.triggerTypes.timeDescription",
	},
	{
		value: "state_change",
		label: "Device State Change",
		labelKey: "constants.triggerTypes.stateChange",
		description: "Execute when device state changes",
		descriptionKey: "constants.triggerTypes.stateChangeDescription",
	},
	{
		value: "interval",
		label: "Interval",
		labelKey: "constants.triggerTypes.interval",
		description: "Execute at regular intervals",
		descriptionKey: "constants.triggerTypes.intervalDescription",
	},
];

// Condition types with metadata
export const getConditionTypes = () => [
	{
		value: "simple",
		label: "Simple Condition",
		labelKey: "constants.conditionTypes.simple",
		description: "Compare device value with a threshold",
		descriptionKey: "constants.conditionTypes.simpleDescription",
	},
	{
		value: "time",
		label: "Time Condition",
		labelKey: "constants.conditionTypes.time",
		description: "Check specific time",
		descriptionKey: "constants.conditionTypes.timeDescription",
	},
	{
		value: "day_of_week",
		label: "Day of Week",
		labelKey: "constants.conditionTypes.dayOfWeek",
		description: "Check specific days of the week",
		descriptionKey: "constants.conditionTypes.dayOfWeekDescription",
	},
];

// Action types with metadata
export const getActionTypes = () => [
	{
		value: "device_control",
		label: "Control Device",
		labelKey: "constants.actionTypes.deviceControl",
		description: "Change device parameters",
		descriptionKey: "constants.actionTypes.deviceControlDescription",
	},
	{
		value: "notify",
		label: "Send Notification",
		labelKey: "constants.actionTypes.notify",
		description: "Send notification to user",
		descriptionKey: "constants.actionTypes.notifyDescription",
	},
	{
		value: "log",
		label: "Log Message",
		labelKey: "constants.actionTypes.log",
		description: "Write entry to automation log",
		descriptionKey: "constants.actionTypes.logDescription",
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
			return { label: "Time", labelKey: "constants.typeLabels.time" };
		case "state_change":
			return { label: "State Change", labelKey: "constants.typeLabels.stateChange" };
		case "interval":
			return { label: "Interval", labelKey: "constants.typeLabels.interval" };
		default:
			return { label: "Unknown", labelKey: "constants.typeLabels.unknown" };
	}
};

// Label mappings for condition types
export const getConditionTypeLabel = (type: string) => {
	switch (type) {
		case "simple":
			return { label: "Simple", labelKey: "constants.typeLabels.simple" };
		case "time":
			return { label: "Time", labelKey: "constants.typeLabels.time" };
		case "day_of_week":
			return { label: "Day of Week", labelKey: "constants.typeLabels.dayOfWeek" };
		default:
			return { label: "Unknown", labelKey: "constants.typeLabels.unknown" };
	}
};

// Label mappings for action types
export const getActionTypeLabel = (type: string) => {
	switch (type) {
		case "device_control":
			return { label: "Device Control", labelKey: "constants.typeLabels.deviceControl" };
		case "notify":
			return { label: "Notification", labelKey: "constants.typeLabels.notification" };
		case "log":
			return { label: "Log", labelKey: "constants.typeLabels.log" };
		default:
			return { label: "Unknown", labelKey: "constants.typeLabels.unknown" };
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
export const getOperators = (fieldType: string): { value: string; label: string; labelKey: string }[] => {
	const numericOperators = [
		{ value: "<", label: "Less than", labelKey: "constants.operators.lessThan" },
		{ value: "<=", label: "Less than or equal", labelKey: "constants.operators.lessThanOrEqual" },
		{ value: "=", label: "Equal to", labelKey: "constants.operators.equalTo" },
		{ value: ">=", label: "Greater than or equal", labelKey: "constants.operators.greaterThanOrEqual" },
		{ value: ">", label: "Greater than", labelKey: "constants.operators.greaterThan" },
		{ value: "!=", label: "Not equal to", labelKey: "constants.operators.notEqualTo" },
	];

	const stringOperators = [
		{ value: "=", label: "Equal to", labelKey: "constants.operators.equalTo" },
		{ value: "!=", label: "Not equal to", labelKey: "constants.operators.notEqualTo" },
	];

	return fieldType === "number" ? numericOperators : stringOperators;
};

// Days of week options (full names for configuration)
export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Helper function to get day name translation key
export const getDayNameKey = (day: string): string => {
	return `constants.daysOfWeek.${day}`;
};

// Helper function to get short day name translation key
export const getDayShortKey = (day: string): string => {
	return `constants.daysOfWeekShort.${day}`;
};

// Days of week options with metadata
export const getDaysOfWeek = (): { value: string; label: string; labelKey: string; short: string; shortKey: string }[] => {
	return [
		{ value: "mon", label: "Monday", labelKey: "constants.daysOfWeek.monday", short: "Mon", shortKey: "constants.daysOfWeek.mondayShort" },
		{ value: "tue", label: "Tuesday", labelKey: "constants.daysOfWeek.tuesday", short: "Tue", shortKey: "constants.daysOfWeek.tuesdayShort" },
		{ value: "wed", label: "Wednesday", labelKey: "constants.daysOfWeek.wednesday", short: "Wed", shortKey: "constants.daysOfWeek.wednesdayShort" },
		{ value: "thu", label: "Thursday", labelKey: "constants.daysOfWeek.thursday", short: "Thu", shortKey: "constants.daysOfWeek.thursdayShort" },
		{ value: "fri", label: "Friday", labelKey: "constants.daysOfWeek.friday", short: "Fri", shortKey: "constants.daysOfWeek.fridayShort" },
		{ value: "sat", label: "Saturday", labelKey: "constants.daysOfWeek.saturday", short: "Sat", shortKey: "constants.daysOfWeek.saturdayShort" },
		{ value: "sun", label: "Sunday", labelKey: "constants.daysOfWeek.sunday", short: "Sun", shortKey: "constants.daysOfWeek.sundayShort" },
	];
};
