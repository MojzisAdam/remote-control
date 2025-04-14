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
import { Label } from "@/components/ui/label";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import usePageTitle from "@/hooks/usePageTitle";

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
	};

	useEffect(() => {
		const emailParam = searchParams.get("email");
		if (emailParam) {
			setEmail(emailParam);
		}
	}, [location.search]);

	return (
		<>
			<Card className="max-w-[380px]">
				<CardHeader>
					<CardTitle>{t("password-reset.title")}</CardTitle>
					<CardDescription>{t("password-reset.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<AuthSessionStatus
						className="mb-4"
						status={status}
					/>

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
							/>

							<InputError
								messages={errors.email}
								className="mt-2"
							/>
						</div>

						{/* Password */}
						<div className="mt-4">
							<Label htmlFor="password">{t("password-reset.password")}</Label>
							<Input
								id="password"
								type="password"
								value={password}
								className="block mt-1 w-full"
								onChange={(event) => setPassword(event.target.value)}
								required
							/>

							<InputError
								messages={errors.password}
								className="mt-2"
							/>
						</div>

						{/* Confirm Password */}
						<div className="mt-4">
							<Label htmlFor="passwordConfirmation">{t("password-reset.password-confirmation")}</Label>

							<Input
								id="passwordConfirmation"
								type="password"
								value={passwordConfirmation}
								className="block mt-1 w-full"
								onChange={(event) => setPasswordConfirmation(event.target.value)}
								required
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
							/>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default PasswordReset;
