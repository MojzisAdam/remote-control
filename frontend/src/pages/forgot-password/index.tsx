import React, { useState } from "react";
import StatusMessage from "@/components/ui/StatusMessage";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import InputError from "@/components/ui/InputError";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/usePageTitle";

const ForgotPassword: React.FC = () => {
	const { forgotPassword, loading } = useAuth();
	const { t } = useTranslation("user");

	const [email, setEmail] = useState<string>("");
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	usePageTitle(t("forgot-password.title"));

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const result = await forgotPassword(email);

		setErrors(result.errors || {});
		setStatus(result.status || null);
	};

	return (
		<>
			<Card className="max-w-[440px]">
				<CardHeader>
					<CardTitle>{t("forgot-password.title")}</CardTitle>
					<CardDescription>{t("forgot-password.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<StatusMessage
						className="mb-4"
						status={status}
					/>

					<form onSubmit={handleSubmit}>
						{/* Email Address */}
						<div>
							<Label htmlFor="email">{t("forgot-password.email")}</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={email}
								className="block w-full"
								onChange={(event) => setEmail(event.target.value)}
								required
							/>

							<InputError
								messages={errors.email}
								className="mt-2"
							/>
						</div>

						<div className="flex items-center justify-end mt-8">
							<ButtonWithSpinner
								className="w-full py-3 font-medium"
								isLoading={loading}
								label={t("forgot-password.button")}
							/>
						</div>
						<div className="flex justify-end mt-8 gap-4">
							<Link
								to="/login"
								className="underline text-sm text-gray-600 hover:text-gray-700"
							>
								{t("forgot-password.login")}
							</Link>
							<Link
								to="/register"
								className="underline text-sm text-gray-600 hover:text-gray-700"
							>
								{t("forgot-password.register")}
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default ForgotPassword;
