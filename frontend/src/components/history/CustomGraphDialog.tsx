import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import ButtonWithSpinner from "@/components/ButtonWithSpinner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { graphColumns } from "@/constants/chartConstants";
import { useTranslation } from "react-i18next";

interface CustomGraphDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	chartName: string;
	setChartName: (name: string) => void;
	selectedMetrics: string[];
	setSelectedMetrics: (metrics: string[]) => void;
	isLoading: boolean;
	handleSaveGraph: () => Promise<void>;
	editingGraph: boolean;
}

const CustomGraphDialog: React.FC<CustomGraphDialogProps> = ({ isOpen, onOpenChange, chartName, setChartName, selectedMetrics, setSelectedMetrics, isLoading, handleSaveGraph, editingGraph }) => {
	const { t } = useTranslation("history");

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogTrigger asChild>
				<Button onClick={() => (setChartName(""), setSelectedMetrics([]))}>
					<Plus className="h-4 w-4 mr-2" /> {t("customGraphs.addChart")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>{editingGraph ? t("customGraphs.editChart") : t("customGraphs.createChart")}</DialogTitle>
				<Input
					placeholder={t("customGraphs.namePlaceholder")}
					value={chartName}
					onChange={(e) => setChartName(e.target.value)}
				/>
				<div className="max-w-xl mt-2">
					<MultiSelect
						options={graphColumns}
						onValueChange={setSelectedMetrics}
						defaultValue={selectedMetrics}
						placeholder={t("customGraphs.metricsPlaceholder")}
						maxCount={10}
					/>
				</div>
				<DialogFooter>
					<ButtonWithSpinner
						disabled={!chartName || selectedMetrics.length === 0}
						onClick={handleSaveGraph}
						className="py-3 font-medium"
						isLoading={isLoading}
						label={editingGraph ? t("customGraphs.updateChart") : t("customGraphs.createChartButton")}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CustomGraphDialog;
