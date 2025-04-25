import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { useUserManagement } from "@/hooks/useUserManagement";
import TableContainer from "@/components/history/table/TableContainer";
import DeviceNotFound from "@/components/deviceNotFound";
import { ChartLine, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import routes from "@/constants/routes";
import PageHeading from "@/components/PageHeading";
import usePageTitle from "@/hooks/usePageTitle";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { useTranslation } from "react-i18next";
import withAuthorization from "@/middleware/withAuthorization";

const HistoryTablePage: React.FC = () => {
	const { t } = useTranslation("history");
	const navigate = useNavigate();
	const { id: deviceId } = useParams<{ id: string }>();

	const { currentDevice, isLoading, notFound, loadDevice } = useDeviceContext();

	const { setLastVisited } = useUserManagement();

	usePageTitle(t("pageTitle", { deviceId }));

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
		<div className="">
			{notFound ? (
				<DeviceNotFound />
			) : (
				<div className="history-page flex flex-col gap-8">
					<div className="flex justify-between items-center">
						<PageHeading
							icon={History}
							heading={t("heading")}
							device={currentDevice}
							initialLoading={isLoading}
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => navigate(routes.history(deviceId as string))}
						>
							<ChartLine className="h-4 w-4" />
						</Button>
					</div>
					{!isLoading ? (
						<>
							<TableContainer deviceId={deviceId as string} />
						</>
					) : (
						<>
							<Skeleton className="w-full h-96" />
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default withAuthorization(HistoryTablePage, "view-history");
