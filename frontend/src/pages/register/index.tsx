import React, { useState } from "react";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import InputError from "@/components/InputError";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import usePageTitle from "@/hooks/usePageTitle";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { syncLang } from "@/utils/syncLang";

export type RegisterFormData = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	password_confirmation: string;
};

const Register: React.FC = () => {
	const { user, register, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation("user");

	const [formData, setFormData] = useState<RegisterFormData>({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		password_confirmation: "",
	});

	usePageTitle(t("register.title"));

	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const result = await register(formData);

		setErrors(result.errors || {});
		setStatus(result.status || null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<>
			<Card className="max-w-[380px]">
				<CardHeader>
					<CardTitle>{t("register.title")}</CardTitle>
					<CardDescription>{t("register.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						{status && (
							<AuthSessionStatus
								className="mb-4"
								status={status}
							/>
						)}
					</div>
					<form onSubmit={handleSubmit}>
						{/* Name */}
						<div className="gap-4 flex flex-col">
							<div className="flex justify-between gap-4">
								<div>
									<Label htmlFor="first_name">{t("register.first-name")}</Label>

									<Input
										id="first_name"
										name="first_name"
										type="text"
										value={formData.first_name}
										className="block mt-1 w-full"
										onChange={handleChange}
										required
									/>

									<InputError
										messages={errors.first_name}
										className="mt-2"
									/>
								</div>

								<div>
									<Label htmlFor="last_name">{t("register.last-name")}</Label>

									<Input
										id="last_name"
										name="last_name"
										type="text"
										value={formData.last_name}
										className="block mt-1 w-full"
										onChange={handleChange}
										required
									/>

									<InputError
										messages={errors.last_name}
										className="mt-2"
									/>
								</div>
							</div>

							{/* Email Address */}
							<div>
								<Label htmlFor="email">{t("register.email")}</Label>

								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									className="block mt-1 w-full"
									onChange={handleChange}
									required
								/>

								<InputError
									messages={errors.email}
									className="mt-2"
								/>
							</div>

							{/* Password */}
							<div>
								<Label htmlFor="password">{t("register.password")}</Label>

								<Input
									id="password"
									name="password"
									type="password"
									value={formData.password}
									className="block mt-1 w-full"
									onChange={handleChange}
									required
									autoComplete="new-password"
								/>

								<InputError
									messages={errors.password}
									className="mt-2"
								/>
							</div>

							{/* Confirm Password */}
							<div>
								<Label htmlFor="password_confirmation">{t("register.password-confirmation")}</Label>

								<Input
									id="password_confirmation"
									name="password_confirmation"
									type="password"
									value={formData.password_confirmation}
									className="block mt-1 w-full"
									onChange={handleChange}
									required
								/>

								<InputError
									messages={errors.password_confirmation}
									className="mt-2"
								/>
							</div>

							<div className="my-6">
								<ButtonWithSpinner
									className="w-full py-3 font-medium"
									isLoading={loading}
									label={t("register.button")}
								/>
							</div>
							<div className=" text-sm text-gray-700">
								<p className="text-center">
									{t("register.have-acc")}
									<Link
										to="/login"
										className="text-blue-600 hover:text-blue-700 inline-flex space-x-1 items-center ml-1"
									>
										{t("register.login")}
									</Link>
								</p>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default Register;
