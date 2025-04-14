import React from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface StatusSummaryProps {
	summary: {
		online: number;
		in_error: number;
		offline: number;
	};
}

const DeviceStatusSummary: React.FC<StatusSummaryProps> = ({ summary }) => {
	const { t } = useTranslation("dashboard");

	return (
		<Card className="max-w-[350px] py-6 px-6 bg-card text-card-foreground shadow-md rounded-lg w-full">
			<div className="flex justify-between">
				{[
					{ label: t("device-status-summary.online"), color: "green", count: summary?.online },
					{ label: t("device-status-summary.fault"), color: "red", count: summary?.in_error },
					{
						label: t("device-status-summary.offline"),
						color: "gray",
						count: summary?.offline,
					},
				].map(({ label, color, count }) => (
					<div
						key={label}
						className="flex flex-col justify-between items-center text-center"
					>
						<div className={`w-2 h-2 bg-${color}-500 rounded-full shadow-md mb-2`} />
						<p className="font-light text-sm">{label}</p>
						<p className={`font-bold`}>{count}</p>
					</div>
				))}
			</div>
		</Card>
	);
};

export default DeviceStatusSummary;
