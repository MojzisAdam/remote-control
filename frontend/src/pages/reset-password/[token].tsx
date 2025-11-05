"use client";

import AuthSessionStatus from "@/components/AuthSessionStatus";
import InputError from "@/components/InputError";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import usePageTitle from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";

const PasswordReset: React.FC = () => {
	const location = useLocation();
	const { t } = useTranslation("user");

	const { resetPassword, loading } = useAuth();

	const searchParams = new URLSearchParams(location.search);

	const { token = "" } = useParams<{ token: string }>();

	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
	const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
	const [status, setStatus] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	usePageTitle(t("password-reset.title"));

	const submitForm = async (event: React.FormEvent) => {
		event.preventDefault();

		const result = await resetPassword({
			token,
			email,
			password,
			password_confirmation: passwordConfirmation,
		});

		setErrors(result.errors || {});
		setStatus(result.status || null);

		if (result.success) {
			setIsSuccess(true);
		}
	};

	useEffect(() => {
		const emailParam = searchParams.get("email");
		if (emailParam) {
			setEmail(emailParam);
		}
	}, [location.search]);

	return (
		<>
			<Card className="w-full max-w-[440px]">
				<CardHeader>
					<CardTitle>{t("password-reset.title")}</CardTitle>
					<CardDescription>{t("password-reset.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthSessionStatus
						className="mb-4"
						status={status}
					/>

					{isSuccess ? (
						<div className="text-center">
							<Button
								size="sm"
								variant="secondary"
								className="w-full mt-6"
							>
								<Link to="/login">{t("password-reset.go-to-login")}</Link>
							</Button>
						</div>
					) : (
						<form onSubmit={submitForm}>
							{/* Email Address */}
							<div>
								<Label htmlFor="email">{t("password-reset.email")}</Label>

								<Input
									id="email"
									type="email"
									value={email}
									className="block mt-1 w-full"
									onChange={(event) => setEmail(event.target.value)}
									required
									disabled={isSuccess}
								/>

								<InputError
									messages={errors.email}
									className="mt-2"
								/>
							</div>

							{/* Password */}
							<div className="mt-4">
								<Label htmlFor="password">{t("password-reset.password")}</Label>
								<PasswordInput
									id="password"
									value={password}
									className="block mt-1 w-full"
									onChange={(event) => setPassword(event.target.value)}
									required
									disabled={isSuccess}
								/>

								<InputError
									messages={errors.password}
									className="mt-2"
								/>
							</div>

							{/* Confirm Password */}
							<div className="mt-4">
								<Label htmlFor="passwordConfirmation">{t("password-reset.password-confirmation")}</Label>

								<PasswordInput
									id="passwordConfirmation"
									value={passwordConfirmation}
									className="block mt-1 w-full"
									onChange={(event) => setPasswordConfirmation(event.target.value)}
									required
									disabled={isSuccess}
								/>

								<InputError
									messages={errors.password_confirmation}
									className="mt-2"
								/>
							</div>

							<div className="flex items-center justify-end mt-8">
								<ButtonWithSpinner
									className="w-full py-3 font-medium"
									isLoading={loading}
									label={t("password-reset.button")}
									disabled={isSuccess}
								/>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</>
	);
};

export default PasswordReset;
