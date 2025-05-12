import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputError from "@/components/InputError";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { useTranslation } from "react-i18next";
import { updateUserPassword, fetchUser } from "@/api/user/actions";
import { useAuthContext } from "@/provider/AuthContextProvider";

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
			const response = await updateUserPassword(passwordFormData.password, passwordFormData.password_confirmation);

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
		} catch (error: any) {
			if (error.response?.status === 422) {
				setErrors(error.response.data.errors);
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
						<AuthSessionStatus
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
							<Input
								id="password"
								name="password"
								type="password"
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
							<Input
								id="password_confirmation"
								name="password_confirmation"
								type="password"
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
