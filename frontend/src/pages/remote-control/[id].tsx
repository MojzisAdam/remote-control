import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserManagement } from "@/hooks/useUserManagement";
import DeviceNotFound from "@/components/deviceNotFound";
import RemoteControlMqtt from "@/components/remoteControl/RemoteControlMqtt";
import RemoteControlMqttRpi from "@/components/remoteControl/RemoteControlMqttRpi";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop } from "lucide-react";
import PageHeading from "@/components/PageHeading";
import usePageTitle from "@/hooks/usePageTitle";
import { useDeviceContext } from "@/provider/DeviceProvider";

const RemoteControlPage: React.FC = () => {
	const { id: deviceId } = useParams<{ id: string }>();

	const { currentDevice, isLoading, notFound, loadDevice } = useDeviceContext();
	const { setLastVisited } = useUserManagement();
	const { t } = useTranslation("remote-control");

	usePageTitle(`${t("title")} - ${deviceId}`);

	useEffect(() => {
		const fetchData = async () => {
			if (typeof deviceId === "string") {
				await loadDevice(deviceId);
				if (deviceId) {
					setLastVisited(deviceId);
				}
			}
		};
		fetchData();
	}, [deviceId]);
	return (
		<>
			{notFound ? (
				<DeviceNotFound />
			) : (
				<div className="remote-control-page flex flex-col gap-8">
					<PageHeading
						icon={Laptop}
						heading={t("title")}
						device={currentDevice}
						initialLoading={isLoading}
					/>
					{!isLoading ? (
						<>
							{currentDevice && currentDevice.display_type == "2" ? (
								<>
									<RemoteControlMqtt deviceId={(deviceId ?? "").toUpperCase()} />
								</>
							) : (
								<>
									<RemoteControlMqttRpi deviceId={(deviceId ?? "").toLowerCase()} />
								</>
							)}
						</>
					) : (
						<div className="space-y-4">
							<div className="flex justify-between items-start">
								<Skeleton className="w-36 h-[26px]" />
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default RemoteControlPage;
