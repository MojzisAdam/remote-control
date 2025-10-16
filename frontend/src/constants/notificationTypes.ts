export const NOTIFICATION_TYPES = {
	ERROR_OCCURRED: 1,
	ERROR_RESOLVED: 2,
	AUTOMATION: 3,
} as const;

export type NotificationTypeId = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const isDeviceNotification = (typeId?: number): boolean => {
	return typeId === NOTIFICATION_TYPES.ERROR_OCCURRED || typeId === NOTIFICATION_TYPES.ERROR_RESOLVED;
};

export const isAutomationNotification = (typeId?: number): boolean => {
	return typeId === NOTIFICATION_TYPES.AUTOMATION;
};
