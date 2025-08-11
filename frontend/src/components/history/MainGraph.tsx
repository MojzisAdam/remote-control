"use client";
import React from "react";
import BaseHistoryGraph from "./BaseHistoryGraph";
import { DeviceHistory } from "@/api/deviceHistory/model";
import { ChartColumn } from "@/constants/chartConstants/factory";

interface MainGraphProps {
	data: DeviceHistory[];
	hiddenLines: string[];
	savePreferences: (hidden: string[]) => void;
	className?: string;
	isFullscreen?: boolean;
	availableColumnsConfig: ChartColumn[];
}

const MainGraphMemo: React.FC<MainGraphProps> = ({ data, hiddenLines, savePreferences, className, isFullscreen, availableColumnsConfig }) => {
	const heightClass = isFullscreen ? "h-[calc(100vh-100px)] w-full min-h-[700px]" : "h-[calc(100vh-200px)] md:min-h-[500px] lg:min-h-[600px] min-h-[700px]";

	return (
		<BaseHistoryGraph
			data={data}
			hiddenLines={hiddenLines}
			savePreferences={savePreferences}
			className={className}
			height={heightClass}
			availableColumnsConfig={availableColumnsConfig}
		/>
	);
};

export const MainGraph = React.memo(MainGraphMemo);
