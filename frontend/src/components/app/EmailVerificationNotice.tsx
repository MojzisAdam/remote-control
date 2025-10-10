import { useAuth } from "@/hooks/useAuth";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import InputError from "../InputError";

export default function EmailVerificationNotice() {
	const { t } = useTranslation("user");

	const { user, loading, resendEmailVerification } = useAuth();
	const { getFreshUser, loadUser } = useAuth();

	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	const handleSubmit = async () => {
		const result = await resendEmailVerification();

		setErrors(result.errors || {});
		setStatus(result.status || null);
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const result = await getFreshUser();
			if (result.success) {
				if (result.data.email_verified_at) {
					loadUser();
				}
			}
		};

		const channel = new BroadcastChannel("email_verification");

		channel.onmessage = (event) => {
			if (event.data.EmailVerified) {
				fetchUserData();
			}
		};

		const interval = setInterval(() => {
			fetchUserData();
		}, 15_000);

		return () => {
			channel.close();
			clearInterval(interval);
		};
	}, [getFreshUser, loadUser]);

	if (user && user.email_verified_at) return null;

	return (
		<div className="mb-8">
			<Alert className="">
				<Terminal className="h-4 w-4" />
				<AlertTitle className="font-bold">{t("email-verification.alert-title")}</AlertTitle>
				<AlertDescription>
					<div className="flex flex-col gap-y-2">
						<p>{t("email-verification.alert-description")}</p>
						<div>
							{status && (
								<AuthSessionStatus
									className="text-xs"
									status={status}
								/>
							)}
						</div>

						<ButtonWithSpinner
							onClick={handleSubmit}
							className="font-medium text-xs whitespace-normal h-full w-fit"
							isLoading={loading}
							label={t("email-verification.alert-button")}
						/>

						<InputError
							messages={errors.message}
							className="mt-2"
						/>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	);
}
