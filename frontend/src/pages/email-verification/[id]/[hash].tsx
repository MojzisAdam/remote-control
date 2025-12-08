import InputError from "@/components/ui/InputError";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusMessage from "@/components/ui/StatusMessage";
import { Loader2 } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

const VerifyEmail: React.FC = () => {
	const location = useLocation();
	const { t } = useTranslation("user");
	const { t: tGlobal } = useTranslation("global");
	const { loading, verifyEmail } = useAuth();

	const searchParams = new URLSearchParams(location.search);
	const { id, hash } = useParams<{ id: string; hash: string }>();
	const expires = searchParams.get("expires") || "";
	const signature = searchParams.get("signature") || "";

	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);
	const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");

	const hasRunRef = useRef(false);

	usePageTitle("Email verification");

	useEffect(() => {
		if (!id || !hash) return;
		if (hasRunRef.current) return;
		hasRunRef.current = true;

		const verify = async () => {
			try {
				const query = new URLSearchParams({
					expires,
					signature,
				}).toString();

				const result = await verifyEmail({ id, hash, query });
				if (result.statusCode === 200) {
					setVerificationStatus("success");
					const channel = new BroadcastChannel("email_verification");
					channel.postMessage({ EmailVerified: true });
				} else {
					setVerificationStatus("error");
				}
				setErrors(result.errors || {});
				setStatus(result.status || null);
			} catch {
				setVerificationStatus("error");
				setStatus(tGlobal("errors.general-error-message"));
			}
		};

		verify();
	}, [id, hash, expires, signature]);

	return (
		<>
			<Card className="w-full max-w-[440px]">
				<CardHeader>
					<CardTitle>{t("email-verification.page-title")}</CardTitle>
					{loading ? (
						<CardDescription>{t("email-verification.page-description")}</CardDescription>
					) : verificationStatus === "success" ? (
						<CardDescription>{t("email-verification.page-description-success")}</CardDescription>
					) : verificationStatus === "error" ? (
						<CardDescription>{t("email-verification.page-description-failed")}</CardDescription>
					) : null}
				</CardHeader>
				<CardContent>
					<div>
						{status && (
							<StatusMessage
								className="mb-4"
								status={status}
							/>
						)}
					</div>
					<div>
						{errors.message && (
							<InputError
								messages={errors.message}
								className="mt-2"
							/>
						)}
					</div>
					<div>{loading && <Loader2 className="animate-spin" />}</div>
				</CardContent>
			</Card>
		</>
	);
};

export default VerifyEmail;
