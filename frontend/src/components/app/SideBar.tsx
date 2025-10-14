import { Home, Settings, Users, Laptop, History, Computer, Bell, ScrollText, Info, ServerCog, MonitorCog } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MoreInfoSheet } from "@/components/dashboard/MoreInfoSheet";
import routes from "@/constants/routes";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { useDevices } from "@/hooks/useDevices";
import { useToast } from "@/hooks/use-toast";
import { Device } from "@/api/devices/model";
import { useTranslation } from "react-i18next";

export function DashboardSideBar() {
	const location = useLocation();
	const { setOpenMobile } = useSidebar();
	const { id: deviceId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const pathname = location.pathname;
	const { hasPermission } = useAuth();

	const { t } = useTranslation("global");

	const { toast } = useToast();

	const { currentDevice, loadDevice, updateDevice } = useDeviceContext();
	const { fetchUserDevices } = useDevices();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	useEffect(() => {
		if (deviceId) {
			loadDevice(deviceId);
		}
	}, [deviceId]);

	const isActiveLink = (url: string) => {
		const normalizePath = (path: string) => {
			const segments = path.split("/");
			const lastSegment = segments[segments.length - 1];
			if (lastSegment === "graph" || lastSegment === "table") {
				return segments.slice(0, segments.length - 1).join("/");
			}
			return path;
		};

		const normalizedPathname = normalizePath(pathname);
		const normalizedUrl = normalizePath(url);

		if (normalizedPathname === normalizedUrl || normalizedPathname.startsWith(`${normalizedUrl}/`)) {
			return "bg-sidebar-accent";
		}
		return "";
	};

	const updateDeviceSheet = (device: Device) => {
		updateDevice(device);
	};

	const deleteDeviceSheet = (deviceId: string) => {
		fetchUserDevices();
		toast({
			title: t("sidebar.toastDeviceDeletedTitle"),
			description: t("sidebar.toastDeviceDeletedText") + deviceId,
		});
		navigate(routes.dashboard);
	};

	const items = [
		{
			title: t("sidebar.home"),
			url: routes.dashboard,
			icon: Home,
		},
	];

	const dynamicItemsConfig = deviceId
		? [
				{
					title: t("sidebar.remoteControl"),
					url: routes.remoteControl(deviceId),
					icon: Laptop,
				},
				{
					title: t("sidebar.history"),
					url: routes.history(deviceId),
					icon: History,
					requiredPermission: "view-history",
				},
				{
					title: t("sidebar.notifications"),
					url: routes.notifications(deviceId),
					icon: Bell,
				},
				{
					title: t("sidebar.parameterLog"),
					url: routes.parameterLog(deviceId),
					icon: ScrollText,
				},
				{
					title: t("sidebar.deviceInfo"),
					icon: Info,
					action: () => setIsSheetOpen(true),
					url: "",
					isButton: true,
				},
		  ]
		: [];

	const dynamicItems = deviceId ? dynamicItemsConfig.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission)) : [];

	return (
		<>
			<Sidebar collapsible="icon">
				<SidebarContent>
					{/* Main Navigation Group */}
					<SidebarGroup>
						<SidebarGroupLabel>{t("sidebar.kaiteki")}</SidebarGroupLabel>
						<SidebarGroupContent title={t("sidebar.navigation")}>
							<SidebarMenu>
								{items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<Link
												to={item.url}
												className={isActiveLink(item.url)}
												onClick={() => setOpenMobile(false)}
											>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>

						{/* Device Controls Group - Only shown when a device is selected */}
						{deviceId && (
							<>
								<Separator className="my-2" />
								<SidebarGroupContent title={t("sidebar.devicePages")}>
									<SidebarMenu>
										{dynamicItems
											.filter((item) => !item.isButton)
											.map((item) => (
												<SidebarMenuItem key={item.title}>
													<SidebarMenuButton asChild>
														<Link
															to={item.url}
															className={isActiveLink(item.url)}
															onClick={() => setOpenMobile(false)}
														>
															<item.icon />
															<span>{item.title}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}

										{/* Sheet Action*/}
										{dynamicItems
											.filter((item) => item.isButton)
											.map((item) => (
												<SidebarMenuItem key={item.title}>
													<SidebarMenuButton
														onClick={item.action}
														className="flex items-center"
													>
														<item.icon />
														<span>{item.title}</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
									</SidebarMenu>
								</SidebarGroupContent>
							</>
						)}

						{/** Temporary under permission */}
						{hasPermission("manage-automations") && (
							<>
								<Separator className="my-2" />

								<SidebarGroupContent title={t("sidebar.automations")}>
									<SidebarMenu>
										<SidebarMenuItem key="Settings">
											<SidebarMenuButton asChild>
												<Link
													to={routes.automations}
													className={isActiveLink(routes.automations)}
													onClick={() => setOpenMobile(false)}
												>
													<ServerCog />
													<span>{t("sidebar.automations")}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									</SidebarMenu>
								</SidebarGroupContent>
							</>
						)}

						{/* Admin Controls Group */}
						{(hasPermission("manage-users") || hasPermission("manage-devices") || hasPermission("manage-device-types")) && (
							<>
								<Separator className="my-2" />
								<SidebarGroupContent title={t("sidebar.system")}>
									<SidebarMenu>
										{hasPermission("manage-users") && (
											<SidebarMenuItem key="manageUsers">
												<SidebarMenuButton asChild>
													<Link
														to="/user-management"
														className={isActiveLink("/user-management")}
														onClick={() => setOpenMobile(false)}
													>
														<Users />
														<span>{t("sidebar.manageUsers")}</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										)}
										{hasPermission("manage-devices") && (
											<SidebarMenuItem key="manageDevices">
												<SidebarMenuButton asChild>
													<Link
														to="/devices-management"
														className={isActiveLink("/devices-management")}
														onClick={() => setOpenMobile(false)}
													>
														<Computer />
														<span>{t("sidebar.manageDevices")}</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										)}
										{hasPermission("manage-device-types") && (
											<SidebarMenuItem key="manageDeviceTypes">
												<SidebarMenuButton asChild>
													<Link
														to={routes.deviceTypesManagement}
														className={isActiveLink(routes.deviceTypesManagement)}
														onClick={() => setOpenMobile(false)}
													>
														<MonitorCog />
														<span>{t("sidebar.manageDeviceTypes")}</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										)}
									</SidebarMenu>
								</SidebarGroupContent>
							</>
						)}

						<Separator className="my-2" />

						<SidebarGroupContent title={t("sidebar.settings")}>
							<SidebarMenu>
								<SidebarMenuItem key="Settings">
									<SidebarMenuButton asChild>
										<Link
											to="/settings"
											className={isActiveLink("/settings")}
											onClick={() => setOpenMobile(false)}
										>
											<Settings />
											<span>{t("sidebar.settings")}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			{/* MoreInfoSheet for device details */}
			{deviceId && (
				<MoreInfoSheet
					open={isSheetOpen}
					onOpenChange={setIsSheetOpen}
					device={currentDevice ? currentDevice : undefined}
					updateDeviceSheet={updateDeviceSheet}
					deleteDeviceSheet={deleteDeviceSheet}
					showNotificationActions={false}
				/>
			)}
		</>
	);
}
