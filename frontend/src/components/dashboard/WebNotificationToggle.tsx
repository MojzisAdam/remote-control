import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { useTranslation } from "react-i18next";

interface WebNotificationToggleProps {
	enabled: boolean;
	deviceId: string;
	onChange: (enabled: boolean) => void;
}

export function WebNotificationToggle({ enabled: initialEnabled, deviceId, onChange }: WebNotificationToggleProps) {
	const { t } = useTranslation("dashboard");
	const { t: gt } = useTranslation("global");
	const { updateDevice, loading, error } = useDevices();
	const [isEnabled, setIsEnabled] = useState(initialEnabled);
	const [statusInf, setStatusInf] = useState<string | null>(null);

	const toggleWeb = async (newVal: boolean) => {
		try {
			const result = await updateDevice(deviceId, { web_notifications: newVal });
			console.log(result);
			setStatusInf(result.status || error || null);
			if (result.success) {
				setIsEnabled(newVal);
				setStatusInf(null);
				onChange(newVal);
			}
		} catch {
			setStatusInf(gt("errors.general-error-message"));
		}
	};

	return (
		<Card className="w-full max-w-md p-2 py-4 max-sm:px-0 h-full">
			<CardContent className="flex items-center justify-between p-2 px-4 gap-4">
				<div className="space-y-1">
					<Label htmlFor="web-notifications">{t("more-info-sheet.web-notification-toggle.title")}</Label>
					<p className="text-sm text-muted-foreground">{t("more-info-sheet.web-notification-toggle.description")}</p>
				</div>
				<div className="relative">
					{loading && (
						<Loader2
							className="animate-spin absolute left-10"
							size={16}
						/>
					)}
					<Switch
						id="web-notifications"
						checked={isEnabled}
						onCheckedChange={toggleWeb}
						disabled={loading}
					/>
				</div>
			</CardContent>
			<div className="px-4">
				{statusInf && (
					<AuthSessionStatus
						status={statusInf}
						className="mb-4"
					/>
				)}
			</div>
		</Card>
	);
}
