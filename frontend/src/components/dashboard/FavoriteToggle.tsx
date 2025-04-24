"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { useTranslation } from "react-i18next";

interface FavoriteToggleProps {
	isFavorite: boolean;
	deviceId: string;
	onChange: (isFavorite: boolean) => void;
}

export function FavoriteToggle({ isFavorite: initialFavorite, deviceId, onChange }: FavoriteToggleProps) {
	const { t } = useTranslation("dashboard");
	const { t: globalT } = useTranslation("global");

	const { updateDevice, loading, error } = useDevices();
	const [statusInf, setStatusInf] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(initialFavorite);

	const toggleFavorite = async (enabled: boolean) => {
		try {
			const result = await updateDevice(deviceId, { favourite: enabled });
			setStatusInf(result.status || error || null);
			if (result.success) {
				setStatusInf(null);
				setIsFavorite(enabled);
				onChange(enabled);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	return (
		<Card className="w-full max-w-md p-2 py-4 max-sm:px-0 h-full">
			<CardContent className="flex items-center justify-between p-2 px-4 gap-4 space-x-2">
				<div className="space-y-1">
					<div className="flex items-center space-x-2">
						<Star className={`h-5 w-5 ${isFavorite ? "text-yellow-500" : "text-gray-400"}`} />
						<Label>{t("more-info-sheet.favourite-toggle.title")}</Label>
					</div>
					<p className="text-sm text-muted-foreground">{t("more-info-sheet.favourite-toggle.description")}</p>
				</div>
				<div className="relative">
					{loading && (
						<Loader2
							className="animate-spin absolute left-10"
							size={16}
						/>
					)}
					<Switch
						checked={isFavorite}
						onCheckedChange={toggleFavorite}
						disabled={loading}
					/>
				</div>
			</CardContent>
			<div className="flex items-center justify-between px-4">
				{statusInf && (
					<AuthSessionStatus
						className="mb-4"
						status={statusInf}
					/>
				)}
			</div>
		</Card>
	);
}
