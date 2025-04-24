import React from "react";
import { Device } from "@/api/devices/model";
import { Button } from "@/components/ui/button";
import { LaptopMinimal, History, CircleChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import routes from "@/constants/routes";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

interface DeviceCardProps {
	device: Device;
	moreInfo: (device: Device) => void;
}

export const getStatusColor = (status: string) => {
	switch (status) {
		case "online":
			return "bg-green-500";
		case "error":
			return "bg-red-500";
		case "offline":
			return "bg-gray-500";
		default:
			return "bg-gray-300";
	}
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, moreInfo }) => {
	const { t } = useTranslation("dashboard");
	const { hasPermission } = useAuth();

	const navigate = useNavigate();
	return (
		<Card className="relative p-2 shadow-md border rounded-lg transition hover:shadow-lg justify-between flex flex-col max-sm:p-0">
			{/* Status Indicator */}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={`absolute top-4 right-4 w-2 h-2 rounded-full shadow-md mb-2 ${getStatusColor(device.status)}`} />
					</TooltipTrigger>
					<TooltipContent>
						<p>{device.status}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			{/* Header */}
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-semibold">{device.own_name ? `${device.own_name} (${device.id})` : device.id}</CardTitle>
				{device.description?.description && <CardDescription className="text-sm text-gray-600">{device.description.description}</CardDescription>}
			</CardHeader>

			{/* Device Info*/}
			<CardContent className="text-sm space-y-1 text-gray-700 dark:text-gray-400">
				{device.description?.owner && (
					<p>
						<span className="font-medium text-gray-900 dark:text-gray-200">{t("device-list.table.owner")}:</span> {device.description.owner}
					</p>
				)}
				{(device.description?.zip_code || device.description?.city || device.description?.address) && (
					<p>
						<span className="font-medium text-gray-900 dark:text-gray-200">{t("device-list.table.location")}:</span>{" "}
						{[device.description.address, device.description.city, device.description.zip_code].filter(Boolean).join(", ")}
					</p>
				)}
			</CardContent>

			{/* Action Buttons */}
			<CardFooter className="flex flex-wrap gap-4 mt-2">
				<Button
					className="flex-1 px-4 w-full sm:w-auto"
					variant="default"
					onClick={() => navigate(routes.remoteControl(device.id))}
				>
					<LaptopMinimal className="h-4 w-4" /> {/* {t("device-list.remote-control-button")} */}
				</Button>
				{hasPermission("view-history") && (
					<Button
						className="flex-1 w-full sm:w-auto"
						variant="outline"
						onClick={() => navigate(routes.history(device.id))}
					>
						<History className="h-4 w-4" /> {/* {t("device-list.history-button")} */}
					</Button>
				)}
				<Button
					className="flex-1 w-full sm:w-auto"
					variant="secondary"
					onClick={() => moreInfo(device)}
				>
					<CircleChevronRight className="h-4 w-4" /> {/* {t("device-list.more-button")} */}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default DeviceCard;
