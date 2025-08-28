import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { DeviceHistory } from "@/api/deviceHistory/model";
import { useTranslation } from "react-i18next";

interface HistoryGraphProps {
	data: DeviceHistory[];
	selectedMetrics: string[];
}

interface TooltipPayload {
	dataKey: string;
	value: number;
	color: string;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayload[];
	label?: string;
}

const HistoryGraph: React.FC<HistoryGraphProps> = ({ data, selectedMetrics }) => {
	const { t } = useTranslation("remote-control");

	const chartConfig = {
		TS1: { label: t("charts.config.TS1"), color: "#00ad2e", unit: t("charts.units.celsius") },
		TS2: { label: t("charts.config.TS2"), color: "#00d0ff", unit: t("charts.units.celsius") },
		TS4: { label: t("charts.config.TS4"), color: "#f59e0b", unit: t("charts.units.celsius") },
		komp: { label: t("charts.config.komp"), color: "#10b981", unit: t("charts.units.percent") },

		reg_107: { label: t("daitsu.charts.config.reg_107"), color: "#00ad2e", unit: t("charts.units.celsius") },
		reg_110: { label: t("daitsu.charts.config.reg_110"), color: "#00d0ff", unit: t("charts.units.celsius") },
		reg_115: { label: t("daitsu.charts.config.reg_115"), color: "#f59e0b", unit: t("charts.units.celsius") },
	};

	const formattedData = useMemo(() => {
		if (!data || data.length === 0) return [];

		const dateFormatter = new Intl.DateTimeFormat("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		return data.map((item) => ({
			...item,
			cas: dateFormatter.format(new Date(item.cas)).replace(",", ""),
		}));
	}, [data]);

	const chartLines = useMemo(() => {
		return selectedMetrics.map((key) => (
			<Line
				key={key}
				type="monotone"
				dataKey={key}
				name={chartConfig[key as keyof typeof chartConfig]?.label || key}
				stroke={chartConfig[key as keyof typeof chartConfig]?.color || "#000"}
				strokeWidth={2}
				dot={false}
				activeDot={{ r: 6 }}
			/>
		));
	}, [selectedMetrics]);

	const formatYAxis = (value: number, selectedMetric: string) => {
		const unit = chartConfig[selectedMetric as keyof typeof chartConfig]?.unit || "";
		return `${value} ${unit}`;
	};

	const formatXAxis = (value: string) => {
		return value.split(" ")[1];
	};

	const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
					<p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{label}</p>
					{payload.map((entry, index) => {
						const metricKey = entry.dataKey as keyof typeof chartConfig;
						const unit = chartConfig[metricKey]?.unit || "";
						return (
							<div
								key={`item-${index}`}
								className="flex justify-between items-center mb-1"
							>
								<span
									style={{ color: entry.color }}
									className="text-sm mr-4"
								>
									{chartConfig[metricKey]?.label || metricKey}:
								</span>
								<span
									style={{ color: entry.color }}
									className="text-sm font-medium"
								>
									{entry.value} {unit}
								</span>
							</div>
						);
					})}
				</div>
			);
		}
		return null;
	};

	if (!formattedData.length) {
		return <div className="h-full w-full flex items-center justify-center text-center px-4">{t("charts.noData")}</div>;
	}

	return (
		<div className="flex flex-col w-full">
			<ChartContainer
				config={chartConfig}
				className="h-[300px] w-full"
			>
				<LineChart
					data={formattedData}
					margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						opacity={0.3}
					/>
					<XAxis
						dataKey="cas"
						tick={{ fontSize: 10 }}
						tickFormatter={formatXAxis}
						interval="preserveStartEnd"
						padding={{ left: 10, right: 10 }}
					></XAxis>
					<YAxis
						tickFormatter={(value) => (selectedMetrics.length > 0 ? formatYAxis(value, selectedMetrics[0]) : value.toString())}
						width={45}
						tick={{ fontSize: 10 }}
						domain={["auto", "auto"]}
					></YAxis>
					<Tooltip
						content={<CustomTooltip />}
						wrapperStyle={{ zIndex: 10 }}
					/>
					<Legend
						verticalAlign="bottom"
						iconSize={12}
						wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
					/>
					{chartLines}
				</LineChart>
			</ChartContainer>
		</div>
	);
};

export const SimpleChart = React.memo(HistoryGraph, (prevProps, nextProps) => {
	return prevProps.selectedMetrics.length === nextProps.selectedMetrics.length && prevProps.selectedMetrics.every((m, i) => m === nextProps.selectedMetrics[i]) && prevProps.data === nextProps.data;
});
