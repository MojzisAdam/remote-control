import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusMessage from "@/components/ui/StatusMessage";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import InputError from "@/components/ui/InputError";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserManagement } from "@/hooks/useUserManagement";
import { formatName, readableRoleNames, readablePermissionNames, getDefaultPermissionsForRole, allPermissions } from "@/utils/permissionUtils";
import { PasswordInput } from "@/components/ui/password-input";

type CreateUserModalProps = {
	onSuccess: (email: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export type InformationRegisterFormData = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	password_confirmation: string;
	roles: string[];
	permissions: string[];
	[key: string]: string | string[];
};

export function CreateUserModal({ onSuccess, open, onOpenChange }: CreateUserModalProps) {
	const { t } = useTranslation("userManagement");
	const { loading, registerUser } = useUserManagement();

	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);

	// Default role is "user"
	const defaultRole = "user";
	const [defaultPermissions, setDefaultPermissions] = useState<string[]>(getDefaultPermissionsForRole(defaultRole));

	const [informationFormData, setInformationFormData] = useState<InformationRegisterFormData>({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		password_confirmation: "",
		roles: [defaultRole],
		permissions: defaultPermissions,
	});

	const submitInformationForm = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const result = await registerUser(informationFormData);

			setErrorsInf(result.errors || {});
			setStatusInf(result.status || null);

			if (result.success) {
				onSuccess(informationFormData.email);

				setTimeout(() => {
					const resetRole = "user";
					const resetPermissions = getDefaultPermissionsForRole(resetRole);
					setDefaultPermissions(resetPermissions);

					setInformationFormData({
						first_name: "",
						last_name: "",
						email: "",
						password: "",
						password_confirmation: "",
						roles: [resetRole],
						permissions: resetPermissions,
					});
				});

				customOnOpenChange(false);
			}
		} catch {
			setStatusInf(t("userManagement.notifications.genericError"));
		}
	};

	const handleChangeInformation = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;

		if (type === "checkbox") {
			setInformationFormData({
				...informationFormData,
				[name]: checked ? [...(informationFormData[name] as string[]), value] : (informationFormData[name] as string[]).filter((v: string) => v !== value),
			});
		} else if (type === "radio" && name === "roles") {
			// When role changes, update permissions based on the newly selected role
			const newDefaultPermissions = getDefaultPermissionsForRole(value);
			setDefaultPermissions(newDefaultPermissions);

			// Ensure all default permissions for the new role are included
			const updatedPermissions = [...new Set([...informationFormData.permissions.filter((p) => !defaultPermissions.includes(p)), ...newDefaultPermissions])];

			setInformationFormData({
				...informationFormData,
				roles: [value], // Store as array since roles is defined as string[]
				permissions: updatedPermissions,
			});
		} else {
			setInformationFormData({
				...informationFormData,
				[name]: value,
			});
		}
	};

	const handlePermissionChange = (permission: string, checked: boolean | string) => {
		// If this is a default permission for current role, don't allow unchecking
		if (defaultPermissions.includes(permission) && !checked) {
			return; // Don't allow removing default permissions
		}

		setInformationFormData({
			...informationFormData,
			permissions: checked ? [...informationFormData.permissions, permission] : informationFormData.permissions.filter((p) => p !== permission),
		});
	};

	// Check if a permission is a default for the current role
	const isDefaultPermission = (permission: string): boolean => {
		return defaultPermissions.includes(permission);
	};

	const customOnOpenChange = (open: boolean) => {
		setTimeout(() => {
			setStatusInf(null);
		}, 500);

		onOpenChange(open);
	};
	return (
		<Dialog
			open={open}
			onOpenChange={customOnOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("userManagement.createUser.title")}</DialogTitle>
					<DialogDescription>{t("userManagement.createUser.description")}</DialogDescription>
				</DialogHeader>
				<div>
					{statusInf && (
						<StatusMessage
							className="mb-4"
							status={statusInf}
						/>
					)}
				</div>
				<form onSubmit={submitInformationForm}>
					<div className="gap-4 flex flex-col">
						{/* First Name */}
						<div className="flex justify-between gap-4">
							<div>
								<Label htmlFor="first_name">{t("userManagement.createUser.firstName")}</Label>
								<Input
									id="first_name"
									type="text"
									value={informationFormData.first_name}
									name="first_name"
									className="block mt-1 w-full"
									onChange={handleChangeInformation}
									required
								/>
								{errorsInf.first_name && (
									<InputError
										messages={errorsInf.first_name}
										className="mt-2"
									/>
								)}
							</div>
							{/* Last Name */}
							<div>
								<Label htmlFor="last_name">{t("userManagement.createUser.lastName")}</Label>
								<Input
									id="last_name"
									type="text"
									value={informationFormData.last_name}
									name="last_name"
									className="block mt-1 w-full"
									onChange={handleChangeInformation}
									required
								/>
								{errorsInf.last_name && (
									<InputError
										messages={errorsInf.last_name}
										className="mt-2"
									/>
								)}
							</div>
						</div>
						{/* Email Address */}
						<div>
							<Label htmlFor="email">{t("userManagement.createUser.email")}</Label>
							<Input
								id="email"
								type="email"
								name="email"
								value={informationFormData.email}
								className="block mt-1 w-full"
								onChange={handleChangeInformation}
								required
							/>
							{errorsInf.email && (
								<InputError
									messages={errorsInf.email}
									className="mt-2"
								/>
							)}
						</div>
						{/* Password */}
						<div>
							<Label htmlFor="password">{t("userManagement.createUser.password")}</Label>

							<PasswordInput
								id="password"
								name="password"
								value={informationFormData.password}
								className="block mt-1 w-full"
								onChange={handleChangeInformation}
								required
								autoComplete="new-password"
							/>

							<InputError
								messages={errorsInf.password}
								className="mt-2"
							/>
						</div>

						{/* Confirm Password */}
						<div>
							<Label htmlFor="password_confirmation">{t("userManagement.createUser.confirmPassword")}</Label>

							<PasswordInput
								id="password_confirmation"
								name="password_confirmation"
								value={informationFormData.password_confirmation}
								className="block mt-1 w-full"
								onChange={handleChangeInformation}
								required
							/>

							<InputError
								messages={errorsInf.password_confirmation}
								className="mt-2"
							/>
						</div>
						{/* Roles */}
						<div>
							<Label>{t("userManagement.createUser.roles")}</Label>
							<RadioGroup
								name="roles"
								className="mt-2"
								defaultValue="user"
								onChange={handleChangeInformation}
							>
								{Object.keys(readableRoleNames).map((role) => (
									<div
										className="flex items-center"
										key={role}
									>
										<RadioGroupItem
											id={role}
											value={role}
										/>
										<Label
											htmlFor={role}
											className="ml-2"
										>
											{formatName(role, readableRoleNames)}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{/* Permissions */}
						<div>
							<Label>{t("userManagement.createUser.permissions")}</Label>
							<div className="grid grid-cols-2 gap-2 mt-2">
								{allPermissions.map((permission) => (
									<div
										key={permission}
										className="flex items-center"
									>
										<Checkbox
											id={permission}
											name="permissions"
											value={permission}
											checked={informationFormData.permissions.includes(permission)}
											onCheckedChange={(checked) => {
												handlePermissionChange(permission, checked);
											}}
											disabled={isDefaultPermission(permission)}
										/>
										<Label
											htmlFor={permission}
											className={`ml-2 ${isDefaultPermission(permission) ? "" : ""}`}
											title={isDefaultPermission(permission) ? "Default permission for this role" : ""}
										>
											{formatName(permission, readablePermissionNames)}
											{isDefaultPermission(permission)}
										</Label>
									</div>
								))}
							</div>
						</div>
					</div>
					{/* Actions */}
					<Separator className="my-6" />
					<div className="flex justify-end">
						<ButtonWithSpinner
							className="py-3 font-medium"
							isLoading={loading}
							label={t("userManagement.createUser.saveChanges")}
						/>
					</div>
				</form>
				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
