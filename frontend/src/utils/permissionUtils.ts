export const allPermissions = ["manage-users", "manage-devices", "view-history", "edit-device-description", "view-notifications", "edit-all-parameters"];

export const readableRoleNames: Record<string, string> = {
	superadmin: "Super Administrator",
	administrator: "Administrator",
	superuser: "Super User",
	user: "Standard User",
};

export const readablePermissionNames: Record<string, string> = {
	"manage-users": "Manage Users",
	"manage-devices": "Manage Devices",
	"view-history": "View History",
	"edit-device-description": "Edit Device Descriptions",
	"view-notifications": "View Notifications",
	"edit-all-parameters": "Edit All Parameters",
};

// Convert role/permission names to readable format
export const formatName = (name: string, dictionary: Record<string, string>): string => {
	return (
		dictionary[name] ||
		name
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	);
};

// Get default permissions for a specific role based on backend settings
export const getDefaultPermissionsForRole = (role: string): string[] => {
	switch (role) {
		case "superadmin":
			return ["manage-users", "manage-devices", "view-history", "edit-device-description", "view-notifications", "edit-all-parameters"];
		case "administrator":
			return ["view-history", "edit-device-description", "view-notifications", "edit-all-parameters"];
		case "superuser":
			return ["view-history"];
		case "user":
			return [];
		default:
			return [];
	}
};
