import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "@/api/user/model";
import { useUserManagement } from "@/hooks/useUserManagement";
import InputError from "@/components/ui/InputError";
import StatusMessage from "@/components/ui/StatusMessage";
import { useTranslation } from "react-i18next";
import { PasswordInput } from "@/components/ui/password-input";

interface ResetUserPasswordModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: (user: User) => void;
	data?: User;
}

export function ResetUserPasswordModal({ open, onOpenChange, onSuccess, data }: ResetUserPasswordModalProps) {
	const { t } = useTranslation("userManagement");
	const { resetPassword, loading } = useUserManagement();
	const [passwordFormData, setPasswordFormData] = useState({
		password: "",
		password_confirmation: "",
	});

	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setPasswordFormData({
				password: "",
				password_confirmation: "",
			});
			setErrors({});
			setStatus(null);
		}
	}, [open, data]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!data) return;

		try {
			const result = await resetPassword(data.id, passwordFormData.password, passwordFormData.password_confirmation);

			if (result.success) {
				setStatus(t("userManagement.resetPassword.success"));
				setErrors({});
				setTimeout(() => {
					onOpenChange(false);
					if (data) {
						onSuccess(data);
					}
				}, 100);
			} else {
				setErrors(result.errors || {});
				setStatus(result.status || null);
			}
		} catch {
			setStatus(t("userManagement.resetPassword.error"));
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordFormData({
			...passwordFormData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("userManagement.resetPassword.title")}</DialogTitle>
					<DialogDescription>{data && t("userManagement.resetPassword.description", { name: `${data.first_name} ${data.last_name}` })}</DialogDescription>
				</DialogHeader>
				<div>
					{status && (
						<StatusMessage
							className="mb-4"
							status={status}
						/>
					)}
				</div>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4">
						{/* Password */}
						<div>
							<Label htmlFor="password">{t("userManagement.resetPassword.password")}</Label>
							<PasswordInput
								id="password"
								name="password"
								value={passwordFormData.password}
								className="mt-1 w-full"
								onChange={handleChange}
								required
								autoComplete="new-password"
							/>
							{errors.password && (
								<InputError
									messages={errors.password}
									className="mt-2"
								/>
							)}
						</div>

						{/* Confirm Password */}
						<div>
							<Label htmlFor="password_confirmation">{t("userManagement.resetPassword.passwordConfirmation")}</Label>
							<PasswordInput
								id="password_confirmation"
								name="password_confirmation"
								value={passwordFormData.password_confirmation}
								className="mt-1 w-full"
								onChange={handleChange}
								required
								autoComplete="new-password"
							/>
							{errors.password_confirmation && (
								<InputError
									messages={errors.password_confirmation}
									className="mt-2"
								/>
							)}
						</div>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="submit"
							disabled={loading}
						>
							{loading ? t("userManagement.resetPassword.loading") : t("userManagement.resetPassword.reset")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
