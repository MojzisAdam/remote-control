export interface Device {
	id: string;
	ip: string;
	display_type: string;
	device_type_id?: string;
	script_version: string;
	fw_version: string;
	last_activity: string | null;
	history_writing_interval: number;
	send_data?: boolean;
	send_data_until?: string | null;
	error_code: number;
	created_at?: string;
	updated_at?: string;

	description?: DeviceDescription;
	type?: DeviceType;
	own_name?: string;
	favourite?: boolean;
	notifications?: boolean;
	web_notifications?: boolean;
	favouriteOrder: number;

	status: "online" | "error" | "offline";
}

export interface DeviceType {
	id: string;
	name: string;
	description?: string;
	capabilities: string[] | Record<string, any>;
	mqtt_topics?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export type DeviceDescription = {
	id: number;
	device_id: string;
	name: string;
	owner: string;
	zip_code: string;
	city: string;
	address: string;
	description: string;
	outdoor_unit_type: string;
	installation_date: string | null;
	created_at: string;
	updated_at: string;
};

export type DeviceUser = {
	user_id: number;
	device_id: string;
	own_name: string;
	favourite: boolean;
	notifications: boolean;
	web_notifications: boolean;
	favouriteOrder: number;
	created_at?: string;
	updated_at?: string;
};

export interface DeviceStatusSummary {
	total?: number;
	online: number;
	in_error: number;
	offline: number;
}

export interface DeviceParameterLog {
	id: number;
	device_id: string;
	user_id: number | null;
	email: string | null;
	parameter: string;
	old_value?: string;
	new_value: string;
	changed_at: string;
	created_at: string;
	updated_at: string;
}
