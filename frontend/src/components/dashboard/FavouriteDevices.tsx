import React, { useState, useEffect } from "react";
import { Device } from "@/api/devices/model";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, Eye, EyeClosed, LaptopMinimal, History, CircleChevronRight, Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { useAuth } from "@/hooks/useAuth";
import { useUserManagement } from "@/hooks/useUserManagement";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusColor } from "./DeviceCard";
import { useNavigate } from "react-router-dom";
import routes from "@/constants/routes";
import { useTranslation } from "react-i18next";

interface FavouriteDevicesProps {
	moreInfo: (device: Device) => void;
	devices: Device[];
}

const FavouriteDevices: React.FC<FavouriteDevicesProps> = ({ moreInfo, devices }) => {
	const { t } = useTranslation("dashboard");
	const { t: globalT } = useTranslation("global");

	const { user } = useAuth();
	const { loading: loadingUM, toggleLastVisitedDisplay } = useUserManagement();
	const navigate = useNavigate();

	const { error, editFavouriteOrder } = useDevices();

	const [favourites] = useState<Device[]>([]);

	const [displayLastVisited, setDisplayLastVisited] = useState<boolean>(user?.displayLastVisitedDevice ? user.displayLastVisitedDevice : false);

	const [lastVisitedDevice, setLastVisitedDevice] = useState<Device | null>(null);

	const [orderedFavourites, setOrderedFavourites] = useState<Device[]>([]);
	const [editMode, setEditMode] = useState(false);

	const [statusInf, setStatusInf] = useState<string | null>(null);

	useEffect(() => {
		if (!devices.length) return;

		const sortedFavourites = devices.filter((device) => device.favourite).sort((a, b) => (a.favouriteOrder || 0) - (b.favouriteOrder || 0));

		setOrderedFavourites(sortedFavourites);

		if (!user?.lastVisitedDeviceId) {
			return;
		}

		const lastVisited = devices.find((device) => device.id === user.lastVisitedDeviceId);
		setLastVisitedDevice(lastVisited || null);
	}, [devices]);

	const toggleLastVisitedDisplaySwitch = async (newValue: boolean) => {
		try {
			const result = await toggleLastVisitedDisplay(newValue);
			setStatusInf(result.status || error || null);
			if (result.success) {
				if (user) user.displayLastVisitedDevice = newValue;
				setDisplayLastVisited(newValue);
				setStatusInf(null);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	const updateFavouriteOrder = async (newOrder: Device[]) => {
		try {
			const payload = newOrder.map((device, index) => ({
				deviceId: device.id,
				favouriteOrder: index + 1,
			}));

			const result = await editFavouriteOrder(payload);
			setStatusInf(result.status || error || null);

			if (result.success) {
				// setFavouriteDevices(newOrder);
				setStatusInf(null);
			}
		} catch {
			setStatusInf(globalT("errors.general-error-message"));
		}
	};

	useEffect(() => {
		favourites.sort((a, b) => a.favouriteOrder - b.favouriteOrder);
	}, [favourites, lastVisitedDevice]);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const newOrder = [...orderedFavourites];
		const [movedItem] = newOrder.splice(result.source.index, 1);
		newOrder.splice(result.destination.index, 0, movedItem);

		setOrderedFavourites(newOrder);
		updateFavouriteOrder(newOrder);
	};

	if (orderedFavourites.length == 0 && (!lastVisitedDevice || !displayLastVisited)) {
		return;
	}

	return (
		<div className="w-full mt-4">
			{/* Header with Buttons */}
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">{t("favourite-devices.title")}</h2>
				<div className="flex space-x-2">
					{editMode ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={editMode ? "default" : "outline"}
										onClick={() => setEditMode(!editMode)}
									>
										<Check className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t("favourite-devices.tooltip-order-stop")}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={editMode ? "default" : "outline"}
										onClick={() => setEditMode(!editMode)}
									>
										<ArrowLeftRight className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t("favourite-devices.tooltip-order-start")}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={() => toggleLastVisitedDisplaySwitch(!displayLastVisited)}
									disabled={loadingUM}
								>
									{loadingUM ? <Loader2 className="h-4 w-4 animate-spin" /> : displayLastVisited ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{displayLastVisited ? t("favourite-devices.tooltip-last-used-hide") : t("favourite-devices.tooltip-last-used-show")}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<div className="flex justify-end">
				{statusInf && (
					<AuthSessionStatus
						className="mb-4"
						status={statusInf}
					/>
				)}
			</div>

			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable
					droppableId="favouriteDevices"
					direction="horizontal"
				>
					{(provided) => (
						<div
							className="flex space-x-4 overflow-x-auto p-4 w-full border rounded-lg"
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							{/* Render the Last Visited Device (Non-Draggable) */}
							{displayLastVisited && lastVisitedDevice && (
								<div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg shadow-md min-w-[250px] max-w-[250px] flex justify-between flex-col gap-6 relative border-2 border-blue-500 dark:border-blue-800">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full shadow-md mb-2 ${getStatusColor(lastVisitedDevice.status)}`} />
											</TooltipTrigger>
											<TooltipContent>
												<p>{lastVisitedDevice.status}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
									<div>
										<div className="flex flex-col gap-2">
											<p className="text-sm font-semibold">{lastVisitedDevice.own_name ? `${lastVisitedDevice.own_name} (${lastVisitedDevice.id})` : lastVisitedDevice.id}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">{lastVisitedDevice.description?.description}</p>
										</div>
									</div>
									<div className="flex gap-2 w-full justify-center align-middle">
										<Button
											variant="default"
											className="flex-1"
											onClick={() => navigate(routes.remoteControl(lastVisitedDevice.id))}
										>
											<LaptopMinimal className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => navigate(routes.history(lastVisitedDevice.id))}
										>
											<History className="h-4 w-4" />
										</Button>
										<Button
											variant="secondary"
											onClick={() => moreInfo(lastVisitedDevice)}
											className="flex-1"
										>
											<CircleChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}

							{/* Render all favourite devices */}
							{orderedFavourites.map((device, index) => (
								<Draggable
									key={device.id}
									draggableId={device.id}
									index={index}
									isDragDisabled={!editMode}
								>
									{(provided) => (
										<div
											className={`p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg shadow-md min-w-[250px] max-w-[250px] flex justify-between flex-col gap-6 relative
                                                }
                                                `}
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
										>
											<div>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<div className={`absolute top-3 right-3 w-2 h-2 rounded-full shadow-md mb-2 ${getStatusColor(device.status)}`} />
														</TooltipTrigger>
														<TooltipContent>
															<p>{device.status}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
												<div className="flex flex-col gap-2">
													<p className="text-sm font-semibold">{device.own_name ? `${device.own_name} (${device.id})` : device.id}</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">{device.description?.description}</p>
												</div>
											</div>
											<div className="flex gap-2 w-full justify-center align-middle">
												<Button
													variant="default"
													className="flex-1"
													disabled={editMode}
													onClick={() => navigate(routes.remoteControl(device.id))}
												>
													<LaptopMinimal className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													className="flex-1"
													disabled={editMode}
													onClick={() => navigate(routes.history(device.id))}
												>
													<History className="h-4 w-4" />
												</Button>
												<Button
													variant="secondary"
													onClick={() => moreInfo(device)}
													className="flex-1"
													disabled={editMode}
												>
													<CircleChevronRight className="h-4 w-4" />
												</Button>
											</div>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	);
};

export default FavouriteDevices;
