import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import InputError from "@/components/InputError";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import TwoFactor from "@/components/profile/two-factor";
import usePageTitle from "@/hooks/usePageTitle";

type InformationFormData = {
	first_name: string;
	last_name: string;
	email: string;
};

const Profile: React.FC = () => {
	const { user, changeInformations, loading, changePassword } = useAuth();

	const [errorsInf, setErrorsInf] = useState<Record<string, string[]>>({});
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [informationFormData, setInformationFormData] = useState<InformationFormData>({
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		email: user?.email || "",
	});

	usePageTitle("Profile");

	const submitInformationForm = async (event: React.FormEvent) => {
		event.preventDefault();

		const result = await changeInformations(informationFormData);

		setErrorsInf(result.errors || {});
		setStatusInf(result.status || null);
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

		const result = await changePassword(passwordData);
		setPasswordStatus(result.status || null);
		setPasswordErrors(result.errors || {});
	};

	return (
		<>
			<div className="flex flex-col gap-8">
				<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">Profile</h1>
				<div className="flex flex-col gap-12">
					{/* Profile Information */}
					<div>
						<Card className="max-w-[800px]">
							<CardHeader>
								<CardTitle>Profile information</CardTitle>
								<CardDescription>Update your accounts profile information and email address. If you are going to change your e-mail you will have to verify it.</CardDescription>
							</CardHeader>
							<CardContent>
								<div>
									{statusInf && (
										<AuthSessionStatus
											className="mb-4"
											status={statusInf}
										/>
									)}
								</div>
								<form onSubmit={submitInformationForm}>
									<div className="gap-4 flex flex-col">
										{/* First Name */}
										<div>
											<Label htmlFor="first_name">First name</Label>
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
											<Label htmlFor="last_name">First name</Label>
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
											<Label htmlFor="email">E-mail</Label>
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
											label="Save changes"
										/>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
					{/* Password Change Form */}
					<Card className="max-w-[800px]">
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>Change your password. After succesfull password change you will be logged out on all divices.</CardDescription>
						</CardHeader>
						<CardContent>
							<div>
								{passwordStatus && (
									<AuthSessionStatus
										className="mb-4"
										status={passwordStatus}
									/>
								)}
							</div>
							<form onSubmit={submitPasswordForm}>
								<div className="gap-4 flex flex-col">
									<div>
										<Label htmlFor="current_password">Current Password</Label>
										<Input
											id="current_password"
											type="password"
											name="current_password"
											value={passwordData.current_password}
											onChange={handlePasswordChange}
											required
										/>
										{passwordErrors.current_password && <InputError messages={passwordErrors.current_password} />}
									</div>
									<div>
										<Label htmlFor="password">New Password</Label>
										<Input
											id="password"
											type="password"
											name="password"
											value={passwordData.password}
											onChange={handlePasswordChange}
											required
										/>
										{passwordErrors.password && <InputError messages={passwordErrors.password} />}
									</div>
									<div>
										<Label htmlFor="password_confirmation">Confirm Password</Label>
										<Input
											id="password_confirmation"
											type="password"
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
									label="Change Password"
								/>
							</form>
						</CardContent>
					</Card>
				</div>
				{/* Two-Factor Authentication Form */}
				<TwoFactor />
			</div>
		</>
	);
};

export default Profile;
