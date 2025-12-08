import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import StatusMessage from "@/components/ui/StatusMessage";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import InputError from "@/components/ui/InputError";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import TwoFactor from "@/components/profile/two-factor";
import usePageTitle from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type InformationFormData = {
	first_name: string;
	last_name: string;
	email: string;
};

const Profile: React.FC = () => {
	const { user, changeInformations, loading, changePassword, logout } = useAuth();
	const { t } = useTranslation("profile");
	const { toast } = useToast();

	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [informationFormData, setInformationFormData] = useState<InformationFormData>({
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		email: user?.email || "",
	});

	usePageTitle(t("page-title"));

	const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
	const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
	const [pendingEmailData, setPendingEmailData] = useState<InformationFormData | null>(null);
	const submitInformationForm = async (event: React.FormEvent) => {
		event.preventDefault();

		// Check if email has been changed
		if (informationFormData.email !== user?.email) {
			setPendingEmailData(informationFormData);
			setShowEmailConfirmation(true);
			return;
		}

		// If only name is changed, submit directly
		const result = await changeInformations(informationFormData);

		setErrorsInf(result.errors || {});
		setStatusInf(result.status || null);
	};

	const confirmEmailChange = async () => {
		if (!pendingEmailData) return;

		const result = await changeInformations(pendingEmailData);

		setErrorsInf(result.errors || {});
		setStatusInf(result.status || null);
		setShowEmailConfirmation(false);
	};

	const handleChangeInformation = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInformationFormData({
			...informationFormData,
			[e.target.name]: e.target.value,
		});
	};

	const [passwordData, setPasswordData] = useState({
		current_password: "",
		password: "",
		password_confirmation: "",
	});
	const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
	const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordData({
			...passwordData,
			[e.target.name]: e.target.value,
		});
	};
	const submitPasswordForm = async (event: React.FormEvent) => {
		event.preventDefault();

		// Show confirmation dialog before changing password
		setShowPasswordConfirmation(true);
	};

	const confirmPasswordChange = async () => {
		const result = await changePassword(passwordData);
		setPasswordStatus(result.status || null);
		setPasswordErrors(result.errors || {});
		setShowPasswordConfirmation(false);

		if (result.success) {
			const resultLogout = await logout();
			if (resultLogout.success) {
				toast({
					title: t("logoutSuccess"),
					description: t("logoutSuccessDescription"),
				});
			} else {
				toast({
					title: t("logoutFailed"),
					description: t("logoutFailedDescription"),
				});
			}
		}
	};

	return (
		<>
			<div className="flex flex-col gap-8">
				<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{t("profile-heading")}</h1>
				<div className="flex flex-col gap-12">
					{/* Profile Information */}
					<div>
						<Card className="max-w-[800px]">
							<CardHeader>
								<CardTitle>{t("profile-info-card.title")}</CardTitle>
								<CardDescription>{t("profile-info-card.description")}</CardDescription>
							</CardHeader>
							<CardContent>
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
										<div>
											<Label htmlFor="first_name">{t("profile-info-card.first-name")}</Label>
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
											<Label htmlFor="last_name">{t("profile-info-card.last-name")}</Label>
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
										{/* Email Address */}
										<div>
											<Label htmlFor="email">{t("profile-info-card.email")}</Label>
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
									</div>
									{/* Actions */}
									<Separator className="my-6" />
									<div>
										<ButtonWithSpinner
											className="py-3 font-medium"
											isLoading={loading}
											label={t("profile-info-card.save-changes")}
										/>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
					{/* Password Change Form */}
					<Card className="max-w-[800px]">
						<CardHeader>
							<CardTitle>{t("password-card.title")}</CardTitle>
							<CardDescription>{t("password-card.description")}</CardDescription>
						</CardHeader>
						<CardContent>
							<div>
								{passwordStatus && (
									<StatusMessage
										className="mb-4"
										status={passwordStatus}
									/>
								)}
							</div>
							<form onSubmit={submitPasswordForm}>
								<div className="gap-4 flex flex-col">
									<div>
										{" "}
										<Label htmlFor="current_password">{t("password-card.current-password")}</Label>
										<PasswordInput
											id="current_password"
											name="current_password"
											value={passwordData.current_password}
											onChange={handlePasswordChange}
											required
										/>
										{passwordErrors.current_password && <InputError messages={passwordErrors.current_password} />}
									</div>
									<div>
										{" "}
										<Label htmlFor="password">{t("password-card.new-password")}</Label>
										<PasswordInput
											id="password"
											name="password"
											value={passwordData.password}
											onChange={handlePasswordChange}
											required
										/>
										{passwordErrors.password && <InputError messages={passwordErrors.password} />}
									</div>
									<div>
										{" "}
										<Label htmlFor="password_confirmation">{t("password-card.confirm-password")}</Label>
										<PasswordInput
											id="password_confirmation"
											name="password_confirmation"
											value={passwordData.password_confirmation}
											onChange={handlePasswordChange}
											required
										/>
										{passwordErrors.password_confirmation && <InputError messages={passwordErrors.password_confirmation} />}
									</div>
								</div>
								<Separator className="my-6" />
								<ButtonWithSpinner
									isLoading={loading}
									label={t("password-card.change-button")}
								/>
							</form>
						</CardContent>
					</Card>
				</div>
				{/* Two-Factor Authentication Form */}
				<TwoFactor />
			</div>

			{/* Confirmation Dialogs */}
			<PasswordChangeConfirmation
				open={showPasswordConfirmation}
				onOpenChange={setShowPasswordConfirmation}
				onConfirm={confirmPasswordChange}
				t={t}
			/>

			<EmailChangeConfirmation
				open={showEmailConfirmation}
				onOpenChange={setShowEmailConfirmation}
				onConfirm={confirmEmailChange}
				t={t}
			/>
		</>
	);
};

// Password Change Confirmation Dialog
const PasswordChangeConfirmation: React.FC<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	t: (key: string) => string;
}> = ({ open, onOpenChange, onConfirm, t }) => {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("password-confirmation.title")}</AlertDialogTitle>
					<AlertDialogDescription>{t("password-confirmation.description")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{t("password-confirmation.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>{t("password-confirmation.confirm")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

// Email Change Confirmation Dialog
const EmailChangeConfirmation: React.FC<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	t: (key: string) => string;
}> = ({ open, onOpenChange, onConfirm, t }) => {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("email-confirmation.title")}</AlertDialogTitle>
					<AlertDialogDescription>{t("email-confirmation.description")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{t("email-confirmation.cancel")}</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>{t("email-confirmation.confirm")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Profile;
