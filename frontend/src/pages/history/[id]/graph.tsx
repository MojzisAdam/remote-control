import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserManagement } from "@/hooks/useUserManagement";
import MainGraphContainer from "@/components/history/MainGraphContainer";
import CustomGraphsContainer from "@/components/history/CustomGraphsContainer";
import DeviceNotFound from "@/components/deviceNotFound";
import { History, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import routes from "@/constants/routes";
import PageHeading from "@/components/PageHeading";
import usePageTitle from "@/hooks/usePageTitle";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { useTranslation } from "react-i18next";

const HistoryGraphPage: React.FC = () => {
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
		<>
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
							onClick={() => navigate(routes.historyTable(deviceId as string))}
						>
							<Table className="h-4 w-4" />
						</Button>
					</div>
					{!isLoading ? (
						<>
							<MainGraphContainer deviceId={deviceId as string} />
							<CustomGraphsContainer deviceId={deviceId as string} />
						</>
					) : (
						<>
							<Skeleton className="w-full h-96" />
						</>
					)}
				</div>
			)}
		</>
	);
};

export default HistoryGraphPage;
