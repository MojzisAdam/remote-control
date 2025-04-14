import React, { useState } from "react";
import { Device } from "@/api/devices/model";
import DeviceCard, { getStatusColor } from "./DeviceCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { List, Grid3X3, LaptopMinimal, History, CircleChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import routes from "@/constants/routes";
import { getSetting } from "@/utils/settingsStorage";

interface DeviceListProps {
	devices: Device[];
	moreInfo: (device: Device) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, moreInfo }) => {
	const { t } = useTranslation("dashboard");
	const [viewMode, setViewMode] = useState<"grid" | "list">(getSetting("defaultDashboardView"));
	const navigate = useNavigate();

	const initialWidths = {
		status: 50,
		id: 60,
		name: 100,
		owner: 100,
		description: 100,
		location: 100,
		actions: 80,
	};
	const [colWidths, setColWidths] = useState(initialWidths);

	const handleResize = (columnKey: keyof typeof initialWidths, newWidth: number) => {
		setColWidths((prev) => ({
			...prev,
			[columnKey]: newWidth,
		}));
	};

	const cellClass = "p-2 border-b text-center h-14 flex items-center justify-center";

	if (!devices.length) {
		return (
			<div>
				<div className="space-y-6">
					{/* View Toggle Buttons */}
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">{t("device-list.your-devices")}</h2>
						<div className="flex gap-2">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								onClick={() => setViewMode("grid")}
							>
								<Grid3X3 className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								onClick={() => setViewMode("list")}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<p className="text-gray-500">{t("device-list.no-devices")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* View Toggle Buttons */}
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">{t("device-list.your-devices")}</h2>
				<div className="flex gap-2">
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						onClick={() => setViewMode("grid")}
					>
						<Grid3X3 className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Grid View */}
			{viewMode === "grid" ? (
				<div className="grid grid-cols-1 min-[880px]:grid-cols-2 min-[1200px]:grid-cols-3 gap-6">
					{devices.map((device) => (
						<DeviceCard
							key={device.id}
							device={device}
							moreInfo={moreInfo}
						/>
					))}
				</div>
			) : (
				/* Table View */
				<div className="overflow-x-auto bg-white dark:bg-zinc-950 shadow-lg rounded-lg shadow-zinc-900/15 ">
					<ResizablePanelGroup
						direction="horizontal"
						className="w-full min-w-[1300px]"
					>
						{/* Status Column */}
						<ResizablePanel
							defaultSize={colWidths.status}
							onResize={(size: number) => handleResize("status", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.status")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
										title={device.status.toUpperCase()}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">
												<span className={`text-white px-2 py-1 rounded text-xs ${getStatusColor(device.status)}`}>{device.status.toUpperCase()}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* ID Column */}
						<ResizablePanel
							defaultSize={colWidths.id}
							onResize={(size: number) => handleResize("id", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.id")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
										title={device.id}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">{device.id}</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* Name Column */}
						<ResizablePanel
							defaultSize={colWidths.name}
							onResize={(size: number) => handleResize("name", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.name")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
										title={device.own_name}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">{device.own_name}</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* Owner Column */}
						<ResizablePanel
							defaultSize={colWidths.owner}
							onResize={(size: number) => handleResize("owner", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.owner")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
										title={device.description?.owner}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">{device.description?.owner}</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* Description Column */}
						<ResizablePanel
							defaultSize={colWidths.description}
							onResize={(size: number) => handleResize("description", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">
									{t("device-list.table.description")}
								</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={`${cellClass} truncate`}
										title={device.description?.description}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">{device.description?.description}</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* Location Column */}
						<ResizablePanel
							defaultSize={colWidths.location}
							onResize={(size: number) => handleResize("location", size)}
						>
							<div className="flex flex-col border-r border-gray-200">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.location")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
										title={[device.description?.address, device.description?.city, device.description?.zip_code].filter(Boolean).join(", ")}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">
												{[device.description?.address, device.description?.city, device.description?.zip_code].filter(Boolean).join(", ")}
											</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
						<ResizableHandle className="dark:after:!bg-zinc-600 dark:after:!w-[2px] dark:!w-[0px]" />
						{/* Actions Column */}
						<ResizablePanel
							defaultSize={colWidths.actions}
							onResize={(size: number) => handleResize("actions", size)}
						>
							<div className="flex flex-col">
								<div className="p-2 font-bold text-sm bg-gray-100 dark:bg-zinc-900 text-center border-b h-12 flex items-center justify-center">{t("device-list.table.actions")}</div>
								{devices.map((device) => (
									<div
										key={device.id}
										className={cellClass}
									>
										<div className="flex justify-center w-full">
											<div className="text-left truncate max-w-full">
												<div className="flex gap-2 justify-center">
													<Button
														variant="default"
														onClick={() => navigate(routes.remoteControl(device.id))}
													>
														<LaptopMinimal className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														onClick={() => navigate(routes.history(device.id))}
													>
														<History className="h-4 w-4" />
													</Button>
													<Button
														variant="secondary"
														onClick={() => moreInfo(device)}
													>
														<CircleChevronRight className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			)}
		</div>
	);
};

export default DeviceList;
