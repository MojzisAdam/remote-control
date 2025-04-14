import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import InputError from "@/components/InputError";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePageTitle from "@/hooks/usePageTitle";
import { ConfirmTwoFAModal } from "@/components/login/ConfirmTwoFAModal";
import { syncLang } from "@/utils/syncLang";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const { t } = useTranslation("user");
	const { login, loadUser, user, loading } = useAuth();

	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [remember, setRemeberMe] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	const [twoFA, setTwoFA] = useState(false);
	const [open, setOpen] = useState(false);

	usePageTitle(t("login.login"));

	const submitForm = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = await login({ email, password, remember });

		if (result.success) {
			if (result.data.two_factor === true) {
				result.status = "";
				setOpen(true);
				setTwoFA(true);
			} else {
				await loadUser();
			}
		}

		setErrors(result.errors || {});
		setStatus(result.status || null);
	};
	const twoFASuccess = async () => {
		setTwoFA(false);
		await loadUser();
	};

	return (
		<div>
			<>
				<Card className="max-w-[380px]">
					<CardHeader>
						<CardTitle>{t("login.login")}</CardTitle>
						<CardDescription>{t("login.header")}</CardDescription>
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
						<form onSubmit={submitForm}>
							<div className="gap-4 flex flex-col">
								{/* Email Address */}
								<div>
									<Label htmlFor="email">{t("login.email")}</Label>
									<Input
										id="email"
										type="email"
										value={email}
										className="block mt-1 w-full"
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
									{errors.email && (
										<InputError
											messages={errors.email}
											className="mt-2"
										/>
									)}
								</div>

								{/* Password */}
								<div>
									<Label htmlFor="password">{t("login.password")}</Label>
									<Input
										id="password"
										type="password"
										value={password}
										className="block mt-1 w-full"
										onChange={(e) => setPassword(e.target.value)}
										required
										autoComplete="current-password"
									/>
									{errors.password && (
										<InputError
											messages={errors.password}
											className="mt-2"
										/>
									)}
								</div>
								<div className="flex flex-row gap-4 justify-between">
									{/* Remember Me */}
									<div className="flex items-center space-x-2">
										<Checkbox
											id="remember_me"
											name="remember_me"
											checked={remember}
											onCheckedChange={(checked) => {
												setRemeberMe(checked as boolean);
											}}
										/>
										<label
											htmlFor="terms"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{t("login.remember-me")}
										</label>
									</div>
									<Link
										to="/forgot-password"
										className="underline text-sm text-gray-600 hover:text-gray-700 max-[399px]:hidden"
									>
										{t("login.forgot-password")}
									</Link>
								</div>
							</div>
							{/* Actions */}
							<div className="my-6">
								<ButtonWithSpinner
									className="w-full py-3 font-medium"
									isLoading={loading}
									label={t("login.login-button")}
								/>
							</div>
							<div className="text-center mb-6">
								<Link
									to="/forgot-password"
									className="underline text-sm text-gray-600 hover:text-gray-700 min-[400px]:hidden"
								>
									{t("login.forgot-password")}
								</Link>
							</div>
							<div className="text-sm text-gray-700">
								<p className="text-center">
									{t("login.dont-have-acc")}
									<Link
										to="/register"
										className="text-blue-600 hover:text-blue-700 inline-flex space-x-1 items-center ml-1"
									>
										{t("login.register-now")}
									</Link>
								</p>
							</div>
						</form>
					</CardContent>
				</Card>
				<ConfirmTwoFAModal
					onSuccess={twoFASuccess}
					open={open}
					onOpenChange={setOpen}
				/>
			</>
		</div>
	);
};

export default Login;
