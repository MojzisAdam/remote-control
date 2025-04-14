import React from "react";
import { Device } from "@/api/devices/model";
import { useTranslation } from "react-i18next";
import { getDisplayTypeName } from "@/utils/displayUtils";

interface DeviceBasicInfoProps {
	device: Device;
}

export function DeviceBasicInfo({ device }: DeviceBasicInfoProps) {
	const { t } = useTranslation("dashboard");

	return (
		<div className="border rounded-lg shadow-lg bg-card text-card-foreground p-6 mb-6 max-sm:px-4">
			<h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">{t("more-info-sheet.basic-info.description")}</h3>
			<div className="grid grid-cols-2 gap-4  max-md:grid-cols-1 max-md:gap-3">
				<InfoItem
					label={t("more-info-sheet.basic-info.ip")}
					value={device.ip}
				/>
				<InfoItem
					label={t("more-info-sheet.basic-info.display-type")}
					value={getDisplayTypeName(Number(device.display_type))}
				/>
				<InfoItem
					label={t("more-info-sheet.basic-info.sv")}
					value={device.script_version}
				/>
				<InfoItem
					label={t("more-info-sheet.basic-info.fw")}
					value={device.fw_version}
				/>
				<InfoItem
					label={t("more-info-sheet.basic-info.first-con")}
					value={new Date(device.created_at ? device.created_at : "").toLocaleDateString()}
				/>
			</div>
		</div>
	);
}

export function InfoItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between bg-gray-100 dark:bg-zinc-900 p-3 rounded-md shadow-sm text-sm">
			<span className="text-gray-600 dark:text-gray-400 font-medium text-left">{label}:</span>
			<span className="text-gray-900 dark:text-gray-300 font-semibold text-right">{value || "N/A"}</span>
		</div>
	);
}
