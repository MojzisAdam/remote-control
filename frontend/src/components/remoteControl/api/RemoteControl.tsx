import React, { useState, useMemo } from "react";
import useRemoteControlApi from "@/hooks/useRemoteControlApi";
import ConnectionStatusIndicator from "@/components/remoteControl/api/ConnectionStatusIndicator";
import HomeDashboard from "../shared/HomeOverview";
import TemperaturesChartContainer from "@/components/remoteControl/shared/charts/TemperaturesChart";
import MonthlyTemperaturesContainer from "@/components/remoteControl/shared/charts/MonthlyTemperatures";
import TemperatureDisplay from "../shared/TemperatureDisplay";
import DeviceStates from "@/components/remoteControl/shared/DeviceStates";
import DeviceParameters from "../shared/DeviceParameters";
import { LayoutDashboard, Sliders } from "lucide-react";
import { DeviceData } from "@/api/remoteControlApi/model";
import DeviceLoader from "@/components/remoteControl/shared/DeviceLoader";
import { useAuth } from "@/hooks/useAuth";
import { Device } from "@/api/devices/model";

interface RemoteControlApiProps {
	device: Device;
	onDataReceived?: (data: DeviceData) => void;
}

const RemoteControlApi: React.FC<RemoteControlApiProps> = ({ device, onDataReceived }) => {
	const { hasPermission } = useAuth();
	const canViewExtendedParams = hasPermission("edit-all-parameters");

	const { deviceData, connectionStatus, error, lastSuccessfulFetch, retryConnection, updateDeviceParameter } = useRemoteControlApi(device.id, onDataReceived);

	const [activePage, setActivePage] = useState<"overview" | "parameters">("overview");

	const containerPageShown = Object.keys(deviceData).length > 0;

	const overviewData = useMemo(() => deviceData, [deviceData]);
	const temperatureData = useMemo(
		() => ({
			reg_192: deviceData.reg_192,
			reg_673: deviceData.reg_673,
			reg_674: deviceData.reg_674,
			reg_675: deviceData.reg_675,
			reg_676: deviceData.reg_676,
			reg_677: deviceData.reg_677,
			reg_678: deviceData.reg_678,
			reg_679: deviceData.reg_679,
			reg_680: deviceData.reg_680,
			reg_685: deviceData.reg_685,
			reg_704: deviceData.reg_704,
			reg_705: deviceData.reg_705,
			reg_707: deviceData.reg_707,
			reg_708: deviceData.reg_708,
			reg_681: deviceData.reg_681,
		}),
		[deviceData]
	);

	const stateData = useMemo(
		() => ({
			reg_736: deviceData.reg_736,
			reg_737: deviceData.reg_737,
			reg_739: deviceData.reg_739,
			reg_740: deviceData.reg_740,
			reg_741: deviceData.reg_741,
			reg_608: deviceData.reg_608,
			reg_610: deviceData.reg_610,
			reg_640: deviceData.reg_640,
			reg_646: deviceData.reg_646,
			reg_745: deviceData.reg_745,
			reg_746: deviceData.reg_746,
			reg_512: deviceData.reg_512,
			reg_834: deviceData.reg_834,
			fw_v: deviceData.fw_v,
		}),
		[deviceData]
	);
	const parametersData = useMemo(
		() => ({
			reg_33: deviceData.reg_33,
			reg_35: deviceData.reg_35,
			reg_36: deviceData.reg_36,
			reg_38: deviceData.reg_38,
			reg_64: deviceData.reg_64,
			reg_65: deviceData.reg_65,
			// reg_66: deviceData.reg_66,
			reg_68: deviceData.reg_68,
			reg_71: deviceData.reg_71,
			reg_75: deviceData.reg_75,
			reg_76: deviceData.reg_76,
			reg_77: deviceData.reg_77,
			reg_78: deviceData.reg_78,
			reg_96: deviceData.reg_96,
			reg_97: deviceData.reg_97,
			reg_99: deviceData.reg_99,
			reg_108: deviceData.reg_108,
			reg_109: deviceData.reg_109,
			reg_110: deviceData.reg_110,
			reg_111: deviceData.reg_111,
			reg_128: deviceData.reg_128,
			reg_133: deviceData.reg_133,
			// reg_192: deviceData.reg_192,
			reg_193: deviceData.reg_193,
			reg_195: deviceData.reg_195,
			reg_257: deviceData.reg_257,
			reg_258: deviceData.reg_258,
			reg_260: deviceData.reg_260,
			fhi: canViewExtendedParams ? deviceData.fhi : undefined,
		}),
		[deviceData]
	);

	return (
		<div className="space-y-4">
			{/* Device Connection Status */}
			<div className="flex justify-between items-start">
				<ConnectionStatusIndicator
					deviceConnectionStatus={connectionStatus}
					error={error ? new Error(error) : null}
					lastMessageTimestamp={lastSuccessfulFetch}
					retryConnection={retryConnection}
				/>
				{containerPageShown && (
					<div className="flex justify-center">
						<div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg shadow-sm">
							<div className="flex space-x-1">
								<button
									onClick={() => setActivePage("overview")}
									className={`p-2 rounded-lg transition-all duration-200 ${
										activePage === "overview"
											? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400"
											: "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-300"
									}`}
									aria-label="Overview"
									title="Overview"
								>
									<LayoutDashboard size={16} />
								</button>
								<button
									onClick={() => setActivePage("parameters")}
									className={`p-2 rounded-lg transition-all duration-200 ${
										activePage === "parameters"
											? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400"
											: "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-300"
									}`}
									aria-label="Parameters"
									title="Parameters"
								>
									<Sliders size={16} />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Main Content */}
			{containerPageShown ? (
				<div className="mt-8">
					{activePage === "overview" && (
						<div
							key="overview"
							className="flex flex-wrap items-start gap-8"
						>
							<HomeDashboard deviceData={overviewData} />
							<div className="flex justify-between gap-8 max-sm:flex-col w-full">
								{device && <TemperaturesChartContainer device={device} />}
								{device && <MonthlyTemperaturesContainer device={device} />}
							</div>
							<div className="flex gap-8 max-sm:flex-col w-full">
								<TemperatureDisplay data={temperatureData} />
								<DeviceStates data={stateData} />
							</div>
						</div>
					)}
					{activePage === "parameters" && (
						<>
							<DeviceParameters
								deviceId={device.id}
								deviceData={parametersData}
								onUpdateParameter={updateDeviceParameter}
							/>
						</>
					)}
				</div>
			) : (
				<DeviceLoader />
			)}
		</div>
	);
};

export default RemoteControlApi;
