import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { MonthlyTemperatureData } from "@/api/deviceHistory/model";
import { useTranslation } from "react-i18next";
import { cs, enUS } from "date-fns/locale";

interface MonthlyTemperatureChartProps {
	data: MonthlyTemperatureData[];
	sensors: string[];
	displayType?: "standard" | "daitsu";
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

const MonthlyTemperatureChart: React.FC<MonthlyTemperatureChartProps> = ({ data, sensors, displayType = "standard" }) => {
	const { t, i18n } = useTranslation("remote-control");
	const selectedLocale = i18n.language === "en" ? enUS : cs;
	const [containerWidth, setContainerWidth] = useState<number>(0);

	// Hook to track container width for responsive behavior
	useEffect(() => {
		const handleResize = () => {
			const container = document.querySelector("[data-chart-container]");
			if (container) {
				setContainerWidth(container.clientWidth);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const chartConfig = useMemo(() => {
		const config: Record<string, { label: string; color: string; unit: string }> = {};

		sensors.forEach((sensor, index) => {
			const avgKey = `avg_${sensor}`;
			const colors = ["#00ad2e", "#00d0ff", "#f59e0b", "#8b5cf6", "#ef4444"];

			// Get label from translations based on device type
			let labelKey: string;
			if (displayType === "daitsu") {
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
	}, [sensors, displayType, t]);

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
				shortName: `${format(date, "MMM", { locale: selectedLocale })} ${item.year.toString().slice(-2)}`, // Short format for mobile
				fullDate: date, // Keep full date for sorting/reference
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

	// Responsive X-axis configuration
	const getXAxisConfig = useMemo(() => {
		const isSmallScreen = containerWidth < 640; // Tailwind sm breakpoint
		const isMediumScreen = containerWidth < 768; // Tailwind md breakpoint
		const dataLength = formattedData.length;

		let interval: number | "preserveStartEnd" = 0;
		let angle = 0;
		let height = 35;

		if (isSmallScreen && dataLength > 6) {
			// On very small screens with lots of data, show every 2nd or 3rd item
			interval = dataLength > 12 ? 2 : 1;
			angle = -45;
			height = 35;
		} else if (isMediumScreen && dataLength > 8) {
			// On medium screens, angle text if there's too much data
			angle = -30;
			height = 35;
		} else if (dataLength > 12) {
			// On larger screens, still angle if there's a lot of data
			angle = -15;
			height = 35;
		}

		return { interval, angle, height };
	}, [containerWidth, formattedData.length]);

	const formatXAxisTick = (value: string, index: number) => {
		const isSmallScreen = containerWidth < 640;
		const item = formattedData[index];

		// Use short format on small screens
		if (isSmallScreen && item?.shortName) {
			return item.shortName;
		}

		// Otherwise use abbreviated format
		const parts = value.split(" ");
		return parts.length === 2 ? `${parts[0].substring(0, 3)} ${parts[1]}` : value;
	};

	const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div
					className={`
					bg-white dark:bg-gray-800
					border border-gray-200 dark:border-gray-700
					shadow-md rounded-md
					p-3 sm:p-4
					max-w-[220px] sm:max-w-xs
					text-xs sm:text-sm
					break-words
				`}
				>
					<p className="text-gray-600 dark:text-gray-300 font-medium mb-2 truncate">{label}</p>
					{payload.map((entry, index) => {
						const metricKey = entry.dataKey as keyof typeof chartConfig;
						const unit = chartConfig[metricKey]?.unit || "";
						if (entry.value === -128) return null;

						return (
							<div
								key={`item-${index}`}
								className="flex justify-between items-center mb-1 gap-2"
							>
								<span
									style={{ color: entry.color }}
									className="truncate"
								>
									{chartConfig[metricKey]?.label || metricKey}:
								</span>
								<span
									style={{ color: entry.color }}
									className="font-medium whitespace-nowrap"
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
		<div className="flex flex-col w-full overflow-visible">
			<ChartContainer
				config={chartConfig}
				className="h-[300px] w-full overflow-visible"
				data-chart-container
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
						tick={{
							fontSize: containerWidth < 640 ? 9 : 10,
						}}
						tickFormatter={formatXAxisTick}
						interval={getXAxisConfig.interval}
						padding={{ left: 10, right: 10 }}
						height={getXAxisConfig.height}
						tickMargin={8}
						angle={getXAxisConfig.angle}
						textAnchor={getXAxisConfig.angle < 0 ? "end" : "middle"}
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
	return prevProps.data === nextProps.data && prevProps.sensors === nextProps.sensors && prevProps.displayType === nextProps.displayType;
});
