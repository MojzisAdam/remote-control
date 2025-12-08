"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import StatusMessage from "@/components/ui/StatusMessage";
import { useTranslation } from "react-i18next";

interface NotificationToggleProps {
	enabled: boolean;
	deviceId: string;
	onChange: (enabled: boolean) => void;
}

export function NotificationToggle({ enabled: initialEnabled, deviceId, onChange }: NotificationToggleProps) {
	const { t } = useTranslation("dashboard");
	const { t: globalT } = useTranslation("global");

	const { updateDevice, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [isEnabled, setIsEnabled] = useState(initialEnabled);

	const setNotifications = async (enabledSwitched: boolean) => {
		try {
			const result = await updateDevice(deviceId, {
				notifications: enabledSwitched,
			});
			setStatusInf(result.status || error || null);
			if (result.success) {
				setStatusInf(null);
				setIsEnabled(enabledSwitched);
				onChange(enabledSwitched);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	return (
		<Card className="w-full max-w-md p-2 py-4 max-sm:px-0 h-full">
			<CardContent className="flex items-center justify-between p-2 px-4  gap-4 space-x-2">
				<div className="space-y-1">
					<Label htmlFor="notifications">{t("more-info-sheet.notification-toggle.title")}</Label>
					<p className="text-sm text-muted-foreground">{t("more-info-sheet.notification-toggle.description")}</p>
				</div>
				<div className="relative">
					{loading && (
						<Loader2
							className="animate-spin absolute left-10"
							size={16}
						/>
					)}
					<Switch
						id="notifications"
						checked={isEnabled}
						onCheckedChange={setNotifications}
						disabled={loading}
					/>
				</div>
			</CardContent>
			<div className="flex items-center justify-between px-4">
				{statusInf && (
					<StatusMessage
						className="mb-4"
						status={statusInf}
					/>
				)}
			</div>
		</Card>
	);
}
