import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useDevices } from "@/hooks/useDevices";
import DeviceNotFound from "@/components/deviceNotFound";
import RemoteControl from "@/components/remoteControl/mqtt/daitsu/RemoteControl";
import RemoteControlMqtt from "@/components/remoteControl/mqtt/RemoteControlMqtt";
import RemoteControlMqttRpi from "@/components/remoteControl/mqtt/RemoteControlMqttRpi";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop } from "lucide-react";
import PageHeading from "@/components/PageHeading";
import usePageTitle from "@/hooks/usePageTitle";
import { useDeviceContext } from "@/provider/DeviceProvider";

const RemoteControlPage: React.FC = () => {
	const { id: deviceId } = useParams<{ id: string }>();

	const { currentDevice, isLoading, notFound, loadDevice, updateDevice } = useDeviceContext();
	const { setLastVisited } = useUserManagement();
	const { updateDeviceVersions } = useDevices();
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

	const handleVersionUpdate = useCallback(
		async (fwVersion: string, scriptVersion: string) => {
			if (!deviceId) return;

			try {
				const result = await updateDeviceVersions(deviceId, fwVersion, scriptVersion);
				if (result.success && currentDevice) {
					const updatedDevice = {
						...currentDevice,
						fw_version: fwVersion,
						script_version: scriptVersion,
					};
					updateDevice(updatedDevice);
					console.log("Device versions updated successfully");
				}
			} catch (error) {
				console.error("Failed to update device versions:", error);
			}
		},
		[deviceId, updateDeviceVersions, updateDevice]
	);

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
							{currentDevice &&
								(currentDevice.display_type == "2" ? (
									<>
										<RemoteControlMqtt
											device={{ ...currentDevice, id: (deviceId ?? "").toUpperCase() }}
											onVersionUpdate={handleVersionUpdate}
										/>
									</>
								) : currentDevice.display_type == "3" ? (
									<>
										<RemoteControl
											device={{ ...currentDevice, id: (deviceId ?? "").toLowerCase() }}
											onVersionUpdate={handleVersionUpdate}
										/>
									</>
								) : (
									<>
										<RemoteControlMqttRpi
											device={{ ...currentDevice, id: (deviceId ?? "").toLowerCase() }}
											onVersionUpdate={handleVersionUpdate}
										/>
									</>
								))}
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
