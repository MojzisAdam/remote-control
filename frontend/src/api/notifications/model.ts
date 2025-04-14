export interface Notification {
	id: number;
	device_id: string;
	error_code: number;
	message?: string;
	created_at: string;
	updated_at: string;
	seen: boolean;
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
