import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import EnableTwoFA from "@/components/profile/enableTwoFA";
import { useTranslation } from "react-i18next";

export default function TwoFactor() {
	const { user } = useAuth();
	const { t } = useTranslation("profile");

	const [settingPhase, setSettingPhase] = useState<"enable" | "disable" | "setting" | "set" | "setCodes">("enable");

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
					{(settingPhase === "set" || settingPhase === "setCodes") && <CardTitle>{t("two-factor.enabled")}</CardTitle>}
					{settingPhase === "enable" && <CardTitle>{t("two-factor.disabled")}</CardTitle>}
					{settingPhase === "setting" && <CardTitle>{t("two-factor.finish-enabling")}</CardTitle>}

					<CardDescription>{t("two-factor.description")}</CardDescription>
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
