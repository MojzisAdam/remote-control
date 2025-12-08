import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/api/user/model";
import StatusMessage from "@/components/ui/StatusMessage";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import InputError from "@/components/ui/InputError";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserManagement } from "@/hooks/useUserManagement";
import { formatName, readableRoleNames, readablePermissionNames, getDefaultPermissionsForRole, allPermissions } from "@/utils/permissionUtils";

type EditUserModalProps = {
	onSuccess: (user: User) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: User | undefined;
};

export type InformationFormData = {
	first_name: string;
	last_name: string;
	email: string;
	roles: string[];
	permissions: string[];
	[key: string]: string | string[];
};

export function EditUserModal({ onSuccess, open, onOpenChange, data }: EditUserModalProps) {
	const { t } = useTranslation("userManagement");
	const { loading, updateUser } = useUserManagement();

	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [informationFormData, setInformationFormData] = useState<InformationFormData>({
		first_name: data?.first_name || "",
		last_name: data?.last_name || "",
		email: data?.email || "",
		roles: data?.roles || [],
		permissions: data?.permissions || [],
	});

	// Store default permissions for the current role
	const [defaultPermissions, setDefaultPermissions] = useState<string[]>([]);

	useEffect(() => {
		setInformationFormData({
			first_name: data?.first_name || "",
			last_name: data?.last_name || "",
			email: data?.email || "",
			roles: data?.roles || [],
			permissions: data?.permissions || [],
		});

		// Set default permissions based on the role
		if (data?.roles && data.roles.length > 0) {
			setDefaultPermissions(getDefaultPermissionsForRole(data.roles[0]));
		}
	}, [data]);

	const submitInformationForm = async (event: React.FormEvent) => {
		event.preventDefault();

		let userId = -1;
		if (data?.id) {
			userId = data.id;
		}
		try {
			const result = await updateUser(userId, informationFormData);
			if (result.success) {
				onSuccess(result.data);
				setStatusInf(t("userManagement.notifications.userUpdated"));
			} else {
				setErrorsInf(result.errors || {});
				setStatusInf(result.status || null);
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
			const newDefaultPermissions = getDefaultPermissionsForRole(value);
			setDefaultPermissions(newDefaultPermissions);

			// Ensure all default permissions for the new role are included
			const updatedPermissions = [...new Set([...informationFormData.permissions.filter((p) => !defaultPermissions.includes(p)), ...newDefaultPermissions])];

			setInformationFormData({
				...informationFormData,
				roles: [value],
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

	const customOnOpenChange = (open: boolean) => {
		setTimeout(() => {
			setStatusInf(null);
		}, 500);

		onOpenChange(open);
	};

	// Check if a permission is a default for the current role
	const isDefaultPermission = (permission: string): boolean => {
		return defaultPermissions.includes(permission);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={customOnOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("userManagement.editUser.title")}</DialogTitle>
					<DialogDescription>{t("userManagement.editUser.description")}</DialogDescription>
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
						<div className="flex justify-between gap-4">
							{/* First Name */}
							<div>
								<Label htmlFor="first_name">{t("userManagement.editUser.firstName")}</Label>
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
								<Label htmlFor="last_name">{t("userManagement.editUser.lastName")}</Label>
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
							<Label htmlFor="email">{t("userManagement.editUser.email")}</Label>
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
						{/* Roles */}
						<div>
							<Label>{t("userManagement.editUser.roles")}</Label>
							<RadioGroup
								name="roles"
								className="mt-2"
								defaultValue={data?.roles[0]}
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
							<Label>{t("userManagement.editUser.permissions")}</Label>
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
							label={t("userManagement.editUser.saveChanges")}
						/>
					</div>
				</form>
				<DialogFooter></DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
