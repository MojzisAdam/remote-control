import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import InputError from "@/components/InputError";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import AuthSessionStatus from "@/components/AuthSessionStatus";

type ConfirmPasswordModalProps = {
	onSuccess?: (() => void) | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ConfirmPasswordModal({ onSuccess, open, onOpenChange }: ConfirmPasswordModalProps) {
	const { confirmPassword, loading } = useAuth();

	const [password, setPassword] = useState<string>("");
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [status, setStatus] = useState<string | null>(null);

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Confirm Password</DialogTitle>
					<DialogDescription>Before you can modify two factor authentication, we need your password.</DialogDescription>
				</DialogHeader>
				<div>
					{status && <AuthSessionStatus className="mb-4" status={status} />}
					<Label htmlFor="password">Password</Label>
					<Input id="password" type="password" value={password} className="block mt-1 w-full" onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
					{errors.password && <InputError messages={errors.password} className="mt-2" />}
				</div>
				<DialogFooter>
					<ButtonWithSpinner onClick={() => submitForm()} className="py-3 font-medium" isLoading={loading} label="Save changes" />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
