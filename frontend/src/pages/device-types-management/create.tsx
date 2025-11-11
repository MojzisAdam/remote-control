import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { DeviceType } from "@/api/devices/model";
import { DeviceTypeEdit } from "@/components/device-types-management/device-type-edit";
import { useToast } from "@/hooks/use-toast";
import withAuthorization from "@/middleware/withAuthorization";
import usePageTitle from "@/hooks/usePageTitle";
import routes from "@/constants/routes";

const CreateDeviceTypePage = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { t } = useTranslation(["deviceTypes", "global"]);

	usePageTitle(t("deviceTypes.actions.create"));

	const getStringValue = (value: any): string => {
		return String(value || "");
	};

	const handleCreate = (createdDeviceType: DeviceType) => {
		// Navigate to the newly created device type's detail page
		navigate(routes.deviceTypeDetail(createdDeviceType.id));
		toast({
			title: t("deviceTypes.notifications.created"),
			description: t("deviceTypes.notifications.createdDescription", {
				name: getStringValue(createdDeviceType.name),
			}),
		});
	};

	const handleCancel = () => {
		navigate(routes.deviceTypesManagement);
	};

	return (
		<div className="">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-4">
					<div>
						<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{t("deviceTypes.actions.create")}</h1>
						<p className="text-muted-foreground">{t("deviceTypes.createModal.description")}</p>
					</div>
				</div>
				<Button
					size="sm"
					variant="secondary"
					onClick={() => navigate(routes.deviceTypesManagement)}
				>
					<ArrowLeft className="h-4 w-4" />
					{t("global:common.actions.back")}
				</Button>
			</div>

			<DeviceTypeEdit
				deviceType={null} // null indicates create mode
				onUpdate={handleCreate}
				onCancel={handleCancel}
			/>
		</div>
	);
};

export default withAuthorization(CreateDeviceTypePage, "manage-device-types");
