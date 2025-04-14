import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import EnableTwoFA from "@/components/profile/enableTwoFA";

export default function TwoFactor() {
	const { user } = useAuth();

	const [settingPhase, setSettingPhase] = useState<
		"enable" | "disable" | "setting" | "set" | "setCodes"
	>("enable");

	useEffect(() => {
		if (user?.has2FA) {
			setSettingPhase("set");
		} else {
			setSettingPhase("enable");
		}
	}, []);

	return (
		<div className="">
			<Card className="max-w-[800px]">
				<CardHeader>
					{(settingPhase === "set" ||
						settingPhase === "setCodes") && (
						<CardTitle>
							Two-Factor Authentication is enabled
						</CardTitle>
					)}
					{settingPhase === "enable" && (
						<CardTitle>
							Two-Factor Authentication is disabled
						</CardTitle>
					)}
					{settingPhase === "setting" && (
						<CardTitle>
							Finish enabling Two-Factor Authentication
						</CardTitle>
					)}

					<CardDescription>
						When two factor authentiocatuion is enabled, you will be
						prompted for a secure, random token during
						authentication. You may tetrieve token from your phones
						Google Authnetication application.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<EnableTwoFA
						settingPhase={settingPhase}
						setSettingPhase={setSettingPhase}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
