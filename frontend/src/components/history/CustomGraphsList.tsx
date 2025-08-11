import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";
import CustomGraphContainer from "./CustomGraphContainer";
import { useDeviceHistory } from "@/hooks/useDeviceHistory";
import { UserCustomGraph } from "@/api/deviceHistory/model";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteCustomGraphAlert } from "@/components/history/DeleteCustomGraphAlert";
import { useToast } from "@/hooks/use-toast";
import ErrorAlert from "@/components/history/ErrorAlert";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";

import CustomGraphDialog from "./CustomGraphDialog";

interface CustomGraphsListProps {
	device: Device;
}

const CustomGraphsList: React.FC<CustomGraphsListProps> = ({ device }) => {
	const { t } = useTranslation("history");
	const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
	const [chartName, setChartName] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingGraph, setEditingGraph] = useState<{
		id: number;
		graphName: string;
		selectedMetrics: string[];
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
	const [graphToDelete, setGraphToDelete] = useState<number | null>(null);

	const [loadingError, setLoadingError] = useState(false);

	const { toast } = useToast();

	const { loading, customGraphs, setCustomGraphs, deleteGraph, createGraph, updateGraph, loadUserCustomGraphs } = useDeviceHistory();

	useEffect(() => {
		loadCustomGraphs();
	}, []);

	const loadCustomGraphs = async () => {
		setIsLoading(true);
		const result = await loadUserCustomGraphs(device.id);
		if (!result.success) {
			setLoadingError(true);
		}
		setIsLoading(false);
	};

	const handleSaveGraph = async () => {
		if (!chartName || selectedMetrics.length === 0) return;

		const graphData: Partial<UserCustomGraph> = {
			deviceId: device.id,
			graphName: chartName,
			selectedMetrics: selectedMetrics,
		};

		if (editingGraph) {
			const result = await updateGraph(editingGraph.id!, {
				...graphData,
			});
			setEditingGraph(null);
			if (result.success) {
				toast({ title: t("customGraphs.toast.updateSuccess") });
			} else {
				toast({
					title: t("customGraphs.toast.errorTitle"),
					description: t("customGraphs.toast.errorDescription"),
				});
			}
		} else {
			const result = await createGraph(graphData);
			if (result.success) {
				setCustomGraphs((prevGraphs) => [...prevGraphs, result.data.data]);
				toast({ title: t("customGraphs.toast.createSuccess") });
			} else {
				toast({
					title: t("customGraphs.toast.errorTitle"),
					description: t("customGraphs.toast.errorDescription"),
				});
			}
		}

		setChartName("");
		setSelectedMetrics([]);
		setIsModalOpen(false);
	};

	const handleDeleteButtonClick = (id: number) => {
		setGraphToDelete(id);
		setDeleteAlertOpen(true);
	};

	const handleDeleteGraph = async (id: number) => {
		const result = await deleteGraph(id);
		if (result.success) {
			setCustomGraphs((prevGraphs) => prevGraphs.filter((graph) => graph.id !== id));
			toast({ title: t("customGraphs.toast.deleteSuccess") });
		} else {
			toast({
				title: t("customGraphs.toast.errorTitle"),
				description: t("customGraphs.toast.errorDescription"),
			});
		}
	};

	if (isLoading) {
		return <Skeleton className="h-60 w-full rounded-lg" />;
	}

	if (loadingError) {
		return (
			<ErrorAlert
				title={t("customGraphs.errorTitle")}
				description={t("customGraphs.errorDescription")}
			/>
		);
	}

	return (
		<>
			<CustomGraphDialog
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				chartName={chartName}
				setChartName={setChartName}
				selectedMetrics={selectedMetrics}
				setSelectedMetrics={setSelectedMetrics}
				isLoading={loading}
				handleSaveGraph={handleSaveGraph}
				editingGraph={!!editingGraph}
				device={device}
			/>

			{/* Custom Graphs List */}
			<div className="mt-4 grid grid-cols-1 2xl:grid-cols-2 gap-4">
				{customGraphs.length === 0 ? (
					<p className="text-muted-foreground col-span-1 2xl:col-span-2 mt-4">{t("customGraphs.empty")}</p>
				) : (
					customGraphs.map(({ id, graphName, selectedMetrics }) => (
						<Card
							key={id}
							className="mt-4"
						>
							<CardHeader className="flex justify-between max-sm:px-4">
								<div className="flex justify-between items-center">
									<CardTitle>{graphName}</CardTitle>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => {
												setEditingGraph({
													id,
													graphName,
													selectedMetrics,
												});
												setChartName(graphName);
												setSelectedMetrics(selectedMetrics);
												setIsModalOpen(true);
											}}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											onClick={() => handleDeleteButtonClick(id)}
										>
											<Trash className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="max-sm:px-4">
								<CustomGraphContainer
									selectedMetrics={selectedMetrics}
									device={device}
								/>
							</CardContent>
						</Card>
					))
				)}
			</div>

			<DeleteCustomGraphAlert
				open={deleteAlertOpen}
				onOpenChange={setDeleteAlertOpen}
				onSuccess={() => {
					if (graphToDelete !== null) {
						handleDeleteGraph(graphToDelete);
					}
					setDeleteAlertOpen(false);
				}}
			/>
		</>
	);
};

export default CustomGraphsList;
