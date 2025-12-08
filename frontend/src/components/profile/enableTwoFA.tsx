import React, { useState, useEffect } from "react";
import { ConfirmPasswordModal } from "@/components/profile/ConfirmPasswordModal";
import { useAuth } from "@/hooks/useAuth";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/ui/InputError";
import { useTranslation } from "react-i18next";

type EnableTwoFAProps = {
	settingPhase: "enable" | "disable" | "setting" | "set" | "setCodes";
	setSettingPhase: React.Dispatch<React.SetStateAction<"enable" | "disable" | "setting" | "set" | "setCodes">>;
};

const EnableTwoFA: React.FC<EnableTwoFAProps> = ({ settingPhase, setSettingPhase }) => {
	const {
		user,
		loading,
		confirmTwoFactorAuthentication,
		regenerateTwoFactorRecoveryCodes,
		disableTwoFactorAuthentication,
		getConfirmedPasswordStatus,
		enableTwoFactorAuthentication,
		getTwoFactorSecretKey,
		getTwoFactorQrCode,
		getTwoFactorRecoveryCodes,
	} = useAuth();
	const { t } = useTranslation("profile");

	const [open, setOpen] = useState(false);
	const [qrCode, setQrCode] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [recoveryCodes, setRecoveryCodes] = useState([]);

	const [setUpCode, setSetUpCode] = useState("");
	const [setUpCodeErrors, setSetUpCodeErrors] = useState<Record<string, string[]>>({});

	const [onSuccessModal, setOnSuccessModal] = useState<(() => void) | null>(null);

	useEffect(() => {
		if (user?.has2FA) {
			setSettingPhase("set");
		} else {
			setSettingPhase("enable");
		}
	}, []);

	const enable = async () => {
		const confirmationResult = await getConfirmedPasswordStatus();

		if (confirmationResult.data.confirmed == false) {
			setOnSuccessModal(() => enable);
			setOpen(true);
			return;
		}

		const enableResult = await enableTwoFactorAuthentication();
		if (enableResult.success) {
			const qrCodeResult = await getTwoFactorQrCode();

			if (!qrCodeResult.success) {
				// TODO handle error
				return;
			}

			setQrCode(qrCodeResult.data.svg);

			const secretKeyResult = await getTwoFactorSecretKey();

			if (!secretKeyResult.success) {
				// TODO handle error
				return;
			}
			setSecretKey(secretKeyResult.data.secretKey);

			setSettingPhase("setting");
		}
	};

	const confirmTFA = async () => {
		const confirmationResult = await getConfirmedPasswordStatus();

		if (confirmationResult.data.confirmed == false) {
			setOnSuccessModal(() => confirmTFA);
			setOpen(true);
			return;
		}

		const confirmResult = await confirmTwoFactorAuthentication(setUpCode);

		setSetUpCodeErrors(confirmResult.errors || {});

		if (!confirmResult.success) {
			// TODO handle error
			return;
		}

		setSetUpCode("");

		const recoveryCodes = await getTwoFactorRecoveryCodes();

		if (!recoveryCodes.success) {
			// TODO handle error
			return;
		}

		setRecoveryCodes(recoveryCodes.data);

		setSettingPhase("setCodes");
	};

	const showRecoveryCodes = async () => {
		const confirmationResult = await getConfirmedPasswordStatus();

		if (confirmationResult.data.confirmed == false) {
			setOnSuccessModal(() => showRecoveryCodes);
			setOpen(true);
			return;
		}

		const recoveryCodes = await getTwoFactorRecoveryCodes();

		if (!recoveryCodes.success) {
			// TODO handle error
			return;
		}

		setRecoveryCodes(recoveryCodes.data);
		setSettingPhase("setCodes");
	};

	const regenerateRecoveryCodes = async () => {
		const confirmationResult = await getConfirmedPasswordStatus();

		if (confirmationResult.data.confirmed == false) {
			setOnSuccessModal(() => regenerateRecoveryCodes);
			setOpen(true);
			return;
		}

		const regenerateRecoveryCodes = await regenerateTwoFactorRecoveryCodes();

		if (!regenerateRecoveryCodes.success) {
			// TODO handle error
			return;
		}

		const recoveryCodes = await getTwoFactorRecoveryCodes();

		if (!recoveryCodes.success) {
			// TODO handle error
			return;
		}

		setRecoveryCodes(recoveryCodes.data);
		setSettingPhase("setCodes");
	};

	const disableTFA = async () => {
		const confirmationResult = await getConfirmedPasswordStatus();

		if (confirmationResult.data.confirmed == false) {
			setOnSuccessModal(() => disableTFA);
			setOpen(true);
			return;
		}

		const disableResult = await disableTwoFactorAuthentication();

		if (!disableResult.success) {
			// TODO handle error
			return;
		}

		setSettingPhase("enable");
	};
	return (
		<div>
			{settingPhase === "setting" && (
				<div className="flex flex-col gap-6">
					<p className="text-sm font-semibold">{t("two-factor.finish-instructions")}</p>
					<div className="bg-white p-2 w-fit">{qrCode && <span dangerouslySetInnerHTML={{ __html: qrCode }} />}</div>
					{secretKey && (
						<p className="text-base">
							<span>{t("two-factor.setup-key")}</span> {secretKey}
						</p>
					)}
					<div>
						<Label htmlFor="password">{t("two-factor.code")}</Label>
						<Input
							id="setUpCode"
							type="text"
							value={setUpCode}
							className="block w-full"
							onChange={(e) => setSetUpCode(e.target.value)}
							required
							autoComplete="current-password"
						/>
						{setUpCodeErrors.code && (
							<InputError
								messages={setUpCodeErrors.code}
								className="mt-2"
							/>
						)}
					</div>
					<div className="flex gap-4">
						<ButtonWithSpinner
							onClick={confirmTFA}
							className="py-3 font-medium w-32"
							isLoading={loading}
							label={t("two-factor.confirm")}
						/>
						<ButtonWithSpinner
							variant="secondary"
							onClick={disableTFA}
							className="py-3 font-medium w-32"
							isLoading={loading}
							label={t("two-factor.cancel")}
						/>
					</div>
				</div>
			)}

			{settingPhase === "setCodes" && (
				<div className="flex flex-col gap-6">
					<p className="text-sm font-semibold">{t("two-factor.recovery-instructions")}</p>
					<div className="flex flex-col gap-2 w-full bg-gray-100 dark:bg-zinc-900 rounded-md p-4 py-6">
						{recoveryCodes.map((recoveryCode) => (
							<div key={recoveryCode}>{recoveryCode}</div>
						))}
					</div>
					<div className="flex gap-4">
						<ButtonWithSpinner
							onClick={regenerateRecoveryCodes}
							className="py-3 font-medium "
							isLoading={loading}
							label={t("two-factor.regenerate-codes")}
						/>
						<ButtonWithSpinner
							variant="destructive"
							onClick={disableTFA}
							className="py-3 font-medium w-32"
							isLoading={loading}
							label={t("two-factor.disable")}
						/>
					</div>
				</div>
			)}

			{settingPhase === "set" && (
				<div className="flex flex-col gap-4">
					<div className="flex gap-4">
						<ButtonWithSpinner
							onClick={showRecoveryCodes}
							className="py-3 font-medium "
							isLoading={loading}
							label={t("two-factor.show-codes")}
						/>
						<ButtonWithSpinner
							variant="destructive"
							onClick={disableTFA}
							className="py-3 font-medium w-32"
							isLoading={loading}
							label={t("two-factor.disable")}
						/>
					</div>
				</div>
			)}

			{settingPhase === "enable" && (
				<div>
					<ButtonWithSpinner
						onClick={enable}
						className="py-3 font-medium"
						isLoading={loading}
						label={t("two-factor.enable")}
					/>
				</div>
			)}

			<ConfirmPasswordModal
				onSuccess={onSuccessModal}
				open={open}
				onOpenChange={setOpen}
			/>
		</div>
	);
};

export default EnableTwoFA;
