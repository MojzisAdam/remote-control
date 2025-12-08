import React, { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import InputError from "@/components/ui/InputError";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import { CodeData } from "@/api/user/model";
import { Checkbox } from "@/components/ui/checkbox";
import StatusMessage from "@/components/ui/StatusMessage";
import { useTranslation } from "react-i18next";

type ConfirmTwoFAModalProps = {
	onSuccess?: (() => void) | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ConfirmTwoFAModal({ onSuccess, open, onOpenChange }: ConfirmTwoFAModalProps) {
	const { twoFactorChallenge, loading } = useAuth();
	const { t } = useTranslation("login");

	const [code, setCode] = useState("");
	const [useRecoveryCode, setUseRecoveryCode] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	const submitForm = async () => {
		const codeData: CodeData = {};

		if (useRecoveryCode) {
			codeData.recovery_code = code;
		} else {
			codeData.code = code;
		}

		const result = await twoFactorChallenge(codeData);

		setErrors(result.errors || {});
		setStatus(result.status || null);

		if (result.success) {
			if (onSuccess) {
				onOpenChange(false);
				onSuccess();
			}
		}
	};

	const customOnOpenChange = (open: boolean) => {
		setTimeout(() => {
			setErrors({});
			setStatus(null);
		}, 500);

		onOpenChange(open);
	};
	return (
		<Dialog
			open={open}
			onOpenChange={customOnOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("confirm-twofa-modal.title")}</DialogTitle>
					<DialogDescription>{t("confirm-twofa-modal.description")}</DialogDescription>
				</DialogHeader>
				<div>
					{status && (
						<StatusMessage
							className=""
							status={status}
						/>
					)}
				</div>
				<div>
					<Label htmlFor="password">{t("confirm-twofa-modal.code")}</Label>
					<Input
						className="block mt-1 w-full"
						name="code"
						type="text"
						required
						onChange={(e) => setCode(e.target.value)}
						placeholder={useRecoveryCode ? t("confirm-twofa-modal.enter-recovery-code") : t("confirm-twofa-modal.enter-code")}
					/>
					{errors.code && (
						<InputError
							messages={errors.code}
							className="mt-2"
						/>
					)}
				</div>

				<DialogFooter>
					<div className="flex justify-between w-full mt-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="useRecoveryCode"
								name="useRecoveryCode"
								checked={useRecoveryCode}
								onCheckedChange={(checked) => {
									setUseRecoveryCode(checked as boolean);
								}}
							/>
							<label
								htmlFor="terms"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{t("confirm-twofa-modal.use-recovery-code")}
							</label>
						</div>
						<ButtonWithSpinner
							onClick={() => submitForm()}
							className="py-3 font-medium"
							isLoading={loading}
							label={t("confirm-twofa-modal.save-changes")}
						/>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
