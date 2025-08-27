import React, { useMemo } from "react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { MonthlyTemperatureData } from "@/api/deviceHistory/model";
import { useTranslation } from "react-i18next";
import { cs, enUS } from "date-fns/locale";

interface MonthlyTemperatureChartProps {
	data: MonthlyTemperatureData[];
	sensors: string[];
	deviceType?: "standard" | "daitsu";
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

const MonthlyTemperatureChart: React.FC<MonthlyTemperatureChartProps> = ({ data, sensors, deviceType = "standard" }) => {
	const { t, i18n } = useTranslation("remote-control");
	const selectedLocale = i18n.language === "en" ? enUS : cs;

	const chartConfig = useMemo(() => {
		const config: Record<string, { label: string; color: string; unit: string }> = {};

		sensors.forEach((sensor, index) => {
			const avgKey = `avg_${sensor}`;
			const colors = ["#00ad2e", "#00d0ff", "#f59e0b", "#8b5cf6", "#ef4444"];

			// Get label from translations based on device type
			let labelKey: string;
			if (deviceType === "daitsu") {
				labelKey = `daitsu.charts.config.${avgKey}`;
			} else {
				labelKey = `charts.config.${avgKey}`;
			}

			config[avgKey] = {
				label: t(labelKey, sensor), // Fallback to sensor name if translation not found
				color: colors[index % colors.length],
				unit: t("charts.units.celsius"),
			};
		});

		return config;
	}, [sensors, deviceType, t]);

	const formattedData = useMemo(() => {
		if (!data || data.length === 0) return [];

		return data.map((item) => {
			// Create a date object for the first day of the month
			const date = new Date(item.year, item.month - 1, 1);
			// Format the month name using date-fns and selectedLocale
			let localizedMonth = format(date, "LLLL", { locale: selectedLocale });
			// Capitalize first letter
			if (localizedMonth.length > 0) {
				localizedMonth = localizedMonth.charAt(0).toUpperCase() + localizedMonth.slice(1);
			}

			const formattedItem: any = {
				name: `${localizedMonth} ${item.year}`,
			};

			// Add temperature data for each sensor
			sensors.forEach((sensor) => {
				const avgKey = `avg_${sensor}`;
				const value = item[avgKey] as number;
				formattedItem[avgKey] = value === -128 ? null : value;
			});

			return formattedItem;
		});
	}, [data, sensors, selectedLocale]);

	const activeMetrics = useMemo(() => {
		const metrics = sensors.map((sensor) => `avg_${sensor}`);
		return metrics.filter((metric) => formattedData.some((item) => item[metric] !== null));
	}, [formattedData, sensors]);

	const formatYAxis = (value: number) => `${value} ${t("charts.units.celsius")}`;

	const formatXAxisTick = (value: string) => {
		const parts = value.split(" ");
		return parts.length === 2 ? `${parts[0].substring(0, 3)} ${parts[1]}` : value;
	};

	const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
					<p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{label}</p>
					{payload.map((entry, index) => {
						const metricKey = entry.dataKey as keyof typeof chartConfig;
						const unit = chartConfig[metricKey]?.unit || "";
						if (entry.value === -128) return null;

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
									{entry.value.toFixed(1)} {unit}
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
				<BarChart
					data={formattedData}
					margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					barGap={2}
					barCategoryGap="15%"
				>
					<CartesianGrid
						strokeDasharray="3 3"
						opacity={0.3}
					/>
					<XAxis
						dataKey="name"
						tick={{ fontSize: 10 }}
						tickFormatter={formatXAxisTick}
						interval={0}
						padding={{ left: 10, right: 10 }}
						height={40}
						tickMargin={8}
					/>
					<YAxis
						tickFormatter={formatYAxis}
						domain={["auto", "auto"]}
						width={45}
						tick={{ fontSize: 10 }}
					/>
					<Tooltip
						content={<CustomTooltip />}
						wrapperStyle={{ zIndex: 10 }}
					/>
					<Legend
						verticalAlign="bottom"
						iconSize={12}
						wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
						iconType="circle"
					/>
					{activeMetrics.map((metric) => {
						const key = metric as keyof typeof chartConfig;
						return (
							<Bar
								key={metric}
								dataKey={metric}
								name={chartConfig[key]?.label || metric}
								fill={chartConfig[key]?.color || "#000"}
								radius={[4, 4, 0, 0]}
								maxBarSize={24}
							/>
						);
					})}
				</BarChart>
			</ChartContainer>
		</div>
	);
};

export const SimpleChart = React.memo(MonthlyTemperatureChart, (prevProps, nextProps) => {
	return prevProps.data === nextProps.data && prevProps.sensors === nextProps.sensors && prevProps.deviceType === nextProps.deviceType;
});
