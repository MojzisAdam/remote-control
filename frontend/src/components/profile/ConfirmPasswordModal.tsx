import React, { useState, KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import InputError from "@/components/ui/InputError";
import ButtonWithSpinner from "@/components/ui/ButtonWithSpinner";
import StatusMessage from "@/components/ui/StatusMessage";
import { useTranslation } from "react-i18next";

type ConfirmPasswordModalProps = {
	onSuccess?: (() => void) | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ConfirmPasswordModal({ onSuccess, open, onOpenChange }: ConfirmPasswordModalProps) {
	const { confirmPassword, loading } = useAuth();
	const { t } = useTranslation("profile");

	const [password, setPassword] = useState<string>("");
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			submitForm();
		}
	};

	const submitForm = async () => {
		const result = await confirmPassword(password);

		setErrors(result.errors || {});
		setStatus(result.status || null);

		if (result.success) {
			if (onSuccess) {
				onOpenChange(false);
				onSuccess();
			}
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("confirm-password-modal.title")}</DialogTitle>
					<DialogDescription>{t("confirm-password-modal.description")}</DialogDescription>
				</DialogHeader>
				<div>
					{status && (
						<StatusMessage
							className="mb-4"
							status={status}
						/>
					)}{" "}
					<Label htmlFor="password">{t("confirm-password-modal.password")}</Label>
					<PasswordInput
						id="password"
						value={password}
						className="block mt-1 w-full"
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={handleKeyDown}
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
				<DialogFooter>
					<ButtonWithSpinner
						onClick={() => submitForm()}
						className="py-3 font-medium"
						isLoading={loading}
						label={t("confirm-password-modal.save-changes")}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
