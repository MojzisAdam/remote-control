"use client";
import React from "react";
import BaseHistoryGraph from "./BaseHistoryGraph";
import { DeviceHistory } from "@/api/deviceHistory/model";

interface CustomdGraphProps {
	data: DeviceHistory[];
	selectedMetrics: string[];
	className?: string;
}

const CustomGraphMemo: React.FC<CustomdGraphProps> = ({ data, selectedMetrics, className }) => {
	return (
		<BaseHistoryGraph
			data={data}
			selectedMetrics={selectedMetrics}
			className={className}
			height="h-[calc(100vh-400px)] min-h-[500px]"
		/>
	);
};
export const CustomGraph = React.memo(CustomGraphMemo);
