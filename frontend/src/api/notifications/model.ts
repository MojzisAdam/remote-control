export interface NotificationType {
	id: number;
	name: string;
	description: string;
}

export interface Notification {
	id: number;
	title: string;
	message: string;
	seen: boolean;
	created_at: string;
	updated_at: string;
	type?: NotificationType;
	// Device notification specific fields (only present for device notifications)
	device_id?: string;
	error_code?: number;
	own_name?: string;
	additional_data?: string;
}

export interface PaginationInfo {
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface PaginatedResponse<T> {
	notifications: T[];
	pagination: PaginationInfo;
}
