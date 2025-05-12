export type User = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	email_verified_at: string | null;
	created_at: string;
	updated_at: string;
	roles: string[];
	permissions: string[];
	has2FA: boolean;
	displayLastVisitedDevice: boolean;
	lastVisitedDeviceId: string | null;
	preferred_language: string;
	force_password_change: boolean;
};

export type CodeData = {
	recovery_code?: string;
	code?: string;
};
