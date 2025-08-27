import React, { useState } from "react";
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HoverClickPopover } from "@/components/ui/hover-popover";
import { RefreshCw, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

type ConnectionStatusType = "connected" | "connecting" | "disconnected" | "offline";
type MQTTConnectionStatusType = "connected" | "connecting" | "disconnected" | "error" | "reconnecting";

interface ConnectionStatusProps {
	deviceConnectionStatus: ConnectionStatusType;
	lastMessageTimestamp?: number | null;
	retryConnection: () => void;
	connectionStatus: MQTTConnectionStatusType;
	error?: Error | null;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({ deviceConnectionStatus, lastMessageTimestamp, retryConnection, connectionStatus, error }) => {
	const { t } = useTranslation("remote-control");
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	React.useEffect(() => {
		if (deviceConnectionStatus === "disconnected" || deviceConnectionStatus === "offline") {
			setIsDialogOpen(true);
		} else {
			setIsDialogOpen(false);
		}
	}, [deviceConnectionStatus]);

	const statusConfig = {
		connected: {
			icon: (
				<svg
					className="w-4 h-4"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			),
			color: "text-green-600",
			bgColor: "bg-green-100",
			borderColor: "border-green-400",
			label: t("connection.connected"),
			message: lastMessageTimestamp ? `${t("connection.lastMessage")} ${new Date(lastMessageTimestamp).toLocaleTimeString()}` : null,
		},
		connecting: {
			icon: (
				<svg
					className="w-4 h-4 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			),
			color: "text-blue-600",
			bgColor: "bg-blue-100",
			borderColor: "border-blue-400",
			label: t("connection.connecting"),
			message: t("connection.waiting"),
		},
		disconnected: {
			icon: (
				<svg
					className="w-4 h-4"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
						clipRule="evenodd"
					/>
				</svg>
			),
			color: "text-red-600",
			bgColor: "bg-red-100",
			borderColor: "border-red-400",
			label: t("connection.disconnected"),
			message: t("connection.noMessages"),
		},
		offline: {
			icon: <WifiOff className="h-4 w-4" />,
			color: "text-gray-600",
			bgColor: "bg-gray-100",
			borderColor: "border-gray-400",
			label: t("connection.offline"),
			message: t("connection.deviceOffline"),
		},
	};

	const config = statusConfig[deviceConnectionStatus];
	const needsReconnectButton = deviceConnectionStatus === "disconnected" || deviceConnectionStatus === "offline";

	return (
		<>
			<div className="flex items-center space-x-2">
				{/* Device Connection Status */}
				<HoverClickPopover
					side="top"
					content={
						<div className="max-w-xs">
							<p className="font-semibold leading-none">{config.label}</p>
							{config.message && <p className="text-xs">{config.message}</p>}
							<div className="mt-2 text-xs font-semibold">
								{t("connection.cloud")}:
								<span className={`ml-1 ${connectionStatus === "connected" ? "text-green-600" : connectionStatus === "connecting" ? "text-yellow-600" : "text-red-600"}`}>
									{t(`mqttStatus.${connectionStatus}`)}
								</span>
							</div>
							{error && (
								<p className="text-xs text-red-500 mt-1">
									{t("connection.error")}: {error.message}
								</p>
							)}
						</div>
					}
				>
					<div className={`inline-flex items-center px-2 py-1 rounded text-xs ${config.bgColor} ${config.color} border dark:border-none ${config.borderColor} cursor-help`}>
						<span className="mr-1">{config.icon}</span>
						<span>{config.label}</span>
					</div>
				</HoverClickPopover>

				{/* Direct Reconnect Button for disconnected/offline states */}
				{needsReconnectButton && (
					<Button
						onClick={retryConnection}
						size="default"
						className="py-1 h-6 text-xs"
					>
						<RefreshCw />
						{t("connection.reconnect")}
					</Button>
				)}
			</div>

			{/* Dialog for disconnected or offline status */}
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className={config.color}>
							<div className="flex items-center">
								<span className="mr-2">{config.icon}</span>
								<span>
									{t("connection.device")} {config.label}
								</span>
							</div>
						</DialogTitle>
						<DialogDescription></DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<p>{config.message}</p>

						<div className="mt-2 text-sm">
							{t("connection.cloud")}:
							<span className={`ml-1 font-semibold ${connectionStatus === "connected" ? "text-green-600" : connectionStatus === "connecting" ? "text-yellow-600" : "text-red-600"}`}>
								{t(`mqttStatus.${connectionStatus}`)}
							</span>
						</div>

						{error && (
							<p className="text-red-500 text-sm mt-2">
								{t("connection.error")}: {error.message}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							onClick={() => {
								setIsDialogOpen(false);
								setTimeout(() => {
									retryConnection();
								}, 50);
							}}
							className={deviceConnectionStatus === "disconnected" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-500 hover:bg-gray-600 text-white"}
						>
							<RefreshCw />
							{t("connection.reconnect")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ConnectionStatusIndicator;
