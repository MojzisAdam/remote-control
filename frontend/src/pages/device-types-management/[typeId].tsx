import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useDeviceTypes } from "@/hooks/useDeviceTypes";
import { DeviceType } from "@/api/devices/model";
import { DeviceTypeView } from "@/components/device-types-management/device-type-view";
import { DeviceTypeEdit } from "@/components/device-types-management/device-type-edit";
import { DeleteDeviceTypeAlert } from "@/components/device-types-management/delete-device-type-alert";
import { useToast } from "@/hooks/use-toast";
import withAuthorization from "@/middleware/withAuthorization";
import usePageTitle from "@/hooks/usePageTitle";
import routes from "@/constants/routes";

const DeviceTypeDetailPage = () => {
	const { typeId } = useParams<{ typeId: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { t } = useTranslation(["deviceTypes", "global"]);
	const { loading, getDeviceType, deleteExistingDeviceType } = useDeviceTypes();

	usePageTitle(t("deviceTypes.detailPage.title"));

	const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
	const [activeTab, setActiveTab] = useState("view");
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);

	const getStringValue = (value: any): string => {
		return String(value || "");
	};

	useEffect(() => {
		const fetchDeviceType = async () => {
			if (!typeId) return;

			try {
				const result = await getDeviceType(typeId);
				if (result.success) {
					setDeviceType(result.data);
				} else {
					toast({
						title: t("deviceTypes.notifications.error"),
						description: t("deviceTypes.notifications.notFound"),
						variant: "destructive",
					});
					navigate(routes.deviceTypesManagement);
				}
			} catch (error) {
				toast({
					title: t("deviceTypes.notifications.error"),
					description: t("deviceTypes.notifications.genericError"),
					variant: "destructive",
				});
				navigate(routes.deviceTypesManagement);
			}
		};

		fetchDeviceType();
	}, [typeId, getDeviceType, navigate, t]);

	const handleDelete = async () => {
		if (!deviceType) return;

		try {
			const result = await deleteExistingDeviceType(deviceType.id);
			if (result.success) {
				toast({
					title: t("deviceTypes.notifications.deleted"),
					description: t("deviceTypes.notifications.deletedDescription", {
						name: getStringValue(deviceType.name),
					}),
				});
				navigate(routes.deviceTypesManagement);
			} else {
				toast({
					title: t("deviceTypes.notifications.error"),
					description: t("deviceTypes.notifications.genericError"),
					variant: "destructive",
				});
			}
		} catch {
			toast({
				title: t("deviceTypes.notifications.error"),
				description: t("deviceTypes.notifications.genericError"),
				variant: "destructive",
			});
		}
		setShowDeleteAlert(false);
	};

	const handleUpdate = (updatedDeviceType: DeviceType) => {
		setDeviceType(updatedDeviceType);
		setActiveTab("view"); // Switch to view tab after successful update
		toast({
			title: t("deviceTypes.notifications.updated"),
			description: t("deviceTypes.notifications.updatedDescription", {
				name: getStringValue(updatedDeviceType.name),
			}),
		});
	};

	// Show loading while fetching the device type
	if (loading || !deviceType) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center pt-[15%]">
					<div className="animate-pulse flex flex-col items-center justify-center">
						<svg
							className="w-8 h-8 text-gray-400 dark:text-gray-300 animate-spin"
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
						<p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{t("global:loading.message")}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-start space-y-4 flex-col">
					<div>
						<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{getStringValue(deviceType?.name)}</h1>
						<p className="text-sm text-muted-foreground">{t("deviceTypes.detailPage.subtitle", { id: deviceType?.id })}</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						size="sm"
						variant="secondary"
						onClick={() => navigate(routes.deviceTypesManagement)}
					>
						<ArrowLeft className="h-4 w-4" />
						{t("global:common.actions.back")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowDeleteAlert(true)}
						className="text-destructive hover:text-destructive"
					>
						<Trash2 className="h-4 w-4" />
						{t("deviceTypes.actions.delete")}
					</Button>
				</div>
			</div>

			{/* Description Section */}
			{(getStringValue(deviceType.description) || t("deviceTypes.noDescription")) && (
				<div className="border-l-2 border-muted pl-2">
					<p className="text-sm text-muted-foreground leading-relaxed">{getStringValue(deviceType.description) || t("deviceTypes.noDescription")}</p>
				</div>
			)}

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="max-w-6xl mx-auto mt-8"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger
						value="view"
						className="flex items-center gap-2"
					>
						<Eye className="h-4 w-4" />
						{t("deviceTypes.detailPage.tabs.view")}
					</TabsTrigger>
					<TabsTrigger
						value="edit"
						className="flex items-center gap-2"
					>
						<Edit className="h-4 w-4" />
						{t("deviceTypes.detailPage.tabs.edit")}
					</TabsTrigger>
				</TabsList>

				{deviceType && (
					<TabsContent
						value="view"
						className="mt-6"
					>
						<DeviceTypeView deviceType={deviceType} />
					</TabsContent>
				)}

				<TabsContent
					value="edit"
					className="mt-6"
				>
					<DeviceTypeEdit
						deviceType={deviceType}
						onUpdate={handleUpdate}
						onCancel={() => setActiveTab("view")}
					/>
				</TabsContent>
			</Tabs>

			{/* Delete Alert */}
			<DeleteDeviceTypeAlert
				open={showDeleteAlert}
				onOpenChange={setShowDeleteAlert}
				onSuccess={async (confirmed: boolean, deviceType: DeviceType | undefined) => {
					if (confirmed) {
						await handleDelete();
					}
					setShowDeleteAlert(false);
				}}
				deviceType={deviceType || undefined}
			/>
		</div>
	);
};

export default withAuthorization(DeviceTypeDetailPage, "manage-device-types");
