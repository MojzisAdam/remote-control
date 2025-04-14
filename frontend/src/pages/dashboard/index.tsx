import React, { useState, useEffect } from "react";
import { useDevices } from "@/hooks/useDevices";
import { Device } from "@/api/devices/model";
import { AddDeviceModal } from "@/components/dashboard/AddDeviceModal";
import { MoreInfoSheet } from "@/components/dashboard/MoreInfoSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import DeviceStatusSummary from "@/components/dashboard/DeviceStatusSummary";
import FavouriteDevices from "@/components/dashboard/FavouriteDevices";
import DeviceList from "@/components/dashboard/DeviceList";
import SearchSortPagination from "@/components/dashboard/SearchSortPagination";
import EmptyDeviceState from "@/components/dashboard/EmptyDeviceState";
import usePageTitle from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { getSetting } from "@/utils/settingsStorage";
import { useDeviceContext } from "@/provider/DeviceProvider";

const Dashboard: React.FC = () => {
	const { t } = useTranslation("dashboard");

	usePageTitle(t("page-title"));

	const { devices, updateDeviceList, fetchUserDevices, summary, getStatusSummary } = useDevices();
	const { updateDevice } = useDeviceContext();

	const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [sheetDevice, setSheetDevice] = useState<Device | undefined>();
	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(true);

	const showFavorites = getSetting("showFavoriteDevices");

	useEffect(() => {
		const fetchData = async () => {
			await Promise.all([fetchUserDevices(), getStatusSummary()]);
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
		};

		fetchData();
	}, []);

	const deviceAdded = (deviceId: string) => {
		fetchUserDevices();
		toast({
			title: t("toast-device-added-title"),
			description: t("toast-device-added-text") + deviceId,
		});
	};

	const moreInfo = (device: Device) => {
		setSheetDevice(device);
		updateDevice(device);
		setIsSheetOpen(true);
	};

	const updateDeviceSheet = (device: Device) => {
		updateDeviceList(device);
	};

	const deleteDeviceSheet = (deviceId: string) => {
		fetchUserDevices();
		toast({
			title: t("toast-device-deleted-title"),
			description: t("toast-device-deleted-text") + deviceId,
		});
	};

	return (
		<>
			<div className="dashboard flex flex-col gap-8">
				<div className="flex justify-between align-top">
					<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{t("your-devices")}</h1>
					<Button onClick={() => setIsModalOpen(true)}>
						{" "}
						<Plus /> {t("add-device-button")}
					</Button>
				</div>

				{isLoading ? (
					<div className="flex gap-4 mt-4">
						<Skeleton className="h-24 w-1/3 rounded-lg" />
						<Skeleton className="h-24 w-1/3 rounded-lg" />
						<Skeleton className="h-24 w-1/3 rounded-lg" />
					</div>
				) : (
					showFavorites && (
						<FavouriteDevices
							moreInfo={moreInfo}
							devices={devices}
						/>
					)
				)}

				{isLoading ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-10 w-1/2 rounded-lg" />
						<Skeleton className="h-16 w-full rounded-lg" />
						<Skeleton className="h-16 w-full rounded-lg" />
						<Skeleton className="h-16 w-full rounded-lg" />
					</div>
				) : (
					<div>
						{devices.length == 0 ? (
							<EmptyDeviceState onAddDevice={() => setIsModalOpen(true)} />
						) : (
							<>
								<SearchSortPagination
									devices={devices}
									setFilteredDevices={setFilteredDevices}
								/>
								<DeviceList
									devices={filteredDevices}
									moreInfo={moreInfo}
								/>
							</>
						)}
					</div>
				)}

				<div className="flex max-sm:justify-center text-center w-full mt-8">
					{isLoading ? <Skeleton className="h-24 max-w-[350px] rounded-lg w-full" /> : devices.length > 0 && <DeviceStatusSummary summary={summary} />}
				</div>
			</div>
			<AddDeviceModal
				open={isModalOpen}
				onSuccess={deviceAdded}
				onOpenChange={setIsModalOpen}
			/>
			<MoreInfoSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				device={sheetDevice}
				updateDeviceSheet={updateDeviceSheet}
				deleteDeviceSheet={deleteDeviceSheet}
			/>
		</>
	);
};

export default Dashboard;
