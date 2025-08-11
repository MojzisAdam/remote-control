"use client";
import React from "react";
import BaseHistoryGraph from "./BaseHistoryGraph";
import { DeviceHistory } from "@/api/deviceHistory/model";
import { ChartColumn } from "@/constants/chartConstants/factory";

interface CustomdGraphProps {
	data: DeviceHistory[];
	selectedMetrics: string[];
	className?: string;
	availableColumnsConfig: ChartColumn[];
}

const CustomGraphMemo: React.FC<CustomdGraphProps> = ({ data, selectedMetrics, className, availableColumnsConfig }) => {
	return (
		<BaseHistoryGraph
			data={data}
			selectedMetrics={selectedMetrics}
			className={className}
			height="h-[calc(100vh-400px)] min-h-[500px]"
			availableColumnsConfig={availableColumnsConfig}
		/>
	);
};
export const CustomGraph = React.memo(CustomGraphMemo);
