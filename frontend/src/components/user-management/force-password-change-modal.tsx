import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import InputError from "@/components/ui/InputError";
import StatusMessage from "@/components/ui/StatusMessage";
import { useTranslation } from "react-i18next";
import { updateUserPassword, fetchUser } from "@/api/user/actions";
import { useAuthContext } from "@/providers/AuthContextProvider";
import { PasswordInput } from "@/components/ui/password-input";

interface ForcePasswordChangeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function ForcePasswordChangeModal({ open, onOpenChange, onSuccess }: ForcePasswordChangeModalProps) {
	const { t } = useTranslation("userManagement");
	const { setUser } = useAuthContext();
	const [loading, setLoading] = useState(false);
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
	}, [open]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			await updateUserPassword(passwordFormData.password, passwordFormData.password_confirmation);

			setStatus(t("userManagement.forcePasswordChange.success"));
			setErrors({});

			// Fetch updated user data
			try {
				const updatedUser = await fetchUser();
				setUser(updatedUser);
			} catch (err) {
				console.error("Failed to update user data after password change", err);
			}

			setTimeout(() => {
				onOpenChange(false);
				onSuccess();
			}, 2000);
		} catch (error: unknown) {
			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
				if (axiosError.response?.status === 422) {
					setErrors(axiosError.response.data?.errors || {});
				} else {
					setStatus(t("userManagement.forcePasswordChange.error"));
				}
			} else {
				setStatus(t("userManagement.forcePasswordChange.error"));
			}
		} finally {
			setLoading(false);
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
			onOpenChange={() => {}} // Prevent closing by clicking outside
		>
			<DialogContent
				className="sm:max-w-[425px]"
				hideCloseButton
			>
				<DialogHeader>
					<DialogTitle>{t("userManagement.forcePasswordChange.title")}</DialogTitle>
					<DialogDescription>{t("userManagement.forcePasswordChange.description")}</DialogDescription>
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
							<Label htmlFor="password">{t("userManagement.forcePasswordChange.password")}</Label>
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
							<Label htmlFor="password_confirmation">{t("userManagement.forcePasswordChange.passwordConfirmation")}</Label>
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
							{loading ? t("userManagement.forcePasswordChange.loading") : t("userManagement.forcePasswordChange.update")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
