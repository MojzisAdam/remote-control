"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, ChartEvent, Tooltip, TimeScale, ChartOptions, TooltipItem } from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { chartConfig, chartColors } from "@/constants/chartConstants";
import { DeviceHistory } from "@/api/deviceHistory/model";
import { useTranslation } from "react-i18next";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, TimeScale, zoomPlugin);

interface BaseGraphProps {
	data: DeviceHistory[];
	selectedMetrics?: string[];
	hiddenLines?: string[];
	savePreferences?: (hidden: string[]) => void;
	className?: string;
	height?: string;
}

const BaseHistoryGraph: React.FC<BaseGraphProps> = ({ data = [], selectedMetrics, hiddenLines = [], savePreferences, className = "", height = "h-60 md:h-80" }) => {
	const { t } = useTranslation("history");
	const { resolvedTheme } = useTheme();
	const [isZoomEnabled, setIsZoomEnabled] = useState(false);
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstanceRef = useRef<ChartJS<"line"> | null>(null);
	const [hidden, setHidden] = useState<string[]>(hiddenLines);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkIfMobile();
		window.addEventListener("resize", checkIfMobile);

		return () => {
			window.removeEventListener("resize", checkIfMobile);
		};
	}, []);

	const currentColors = resolvedTheme === "dark" ? chartColors.dark : chartColors.light;

	const handleChartClick = () => setIsZoomEnabled(true);

	useEffect(() => {
		let mouseDownInside = false;

		const handleMouseDown = (event: MouseEvent) => {
			if (chartRef.current?.contains(event.target as Node)) {
				mouseDownInside = true;
			} else {
				mouseDownInside = false;
			}
		};

		const handleMouseUp = (event: MouseEvent) => {
			if (!chartRef.current?.contains(event.target as Node) && !mouseDownInside) {
				setIsZoomEnabled(false);
			}
		};

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	useEffect(() => {
		const canvas = chartRef.current?.querySelector("canvas");
		const handleDoubleClick = () => {
			setIsZoomEnabled(false);
			chartInstanceRef.current?.resetZoom?.();
		};
		canvas?.addEventListener("dblclick", handleDoubleClick);
		return () => {
			canvas?.removeEventListener("dblclick", handleDoubleClick);
		};
	}, []);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);

		if (isMobile) {
			return new Intl.DateTimeFormat("en-GB", {
				day: "2-digit",
				month: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
				.format(date)
				.replace(",", "");
		} else {
			return new Intl.DateTimeFormat("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
				.format(date)
				.replace(",", "");
		}
	};

	const chartData = useMemo(() => {
		return {
			labels: data.map((item) => new Date(item.cas)),
			datasets: Object.keys(chartConfig)
				.filter((key) => (selectedMetrics ? selectedMetrics.includes(key) : true))
				.map((key) => ({
					label: chartConfig[key as keyof typeof chartConfig].label,
					data: data.map((item) => {
						const value = item[key as keyof DeviceHistory];
						return hidden.includes(key) || value == null ? null : Number(value);
					}),
					borderColor: hidden.includes(key) ? "#808080" : chartConfig[key as keyof typeof chartConfig].color,
					backgroundColor: hidden.includes(key) ? "#808080" : chartConfig[key as keyof typeof chartConfig].color,
					hidden: hidden.includes(key),
					pointRadius: 0,
					pointHitRadius: 15,
					borderWidth: 2,
					unit: chartConfig[key as keyof typeof chartConfig].unit,
				})),
		};
	}, [data, hidden, selectedMetrics, isMobile]);

	const options: ChartOptions<"line"> = {
		layout: {
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
		responsive: true,
		animation: false,
		maintainAspectRatio: false,
		interaction: {
			mode: "nearest" as const,
			intersect: true,
			axis: "xy",
		},
		plugins: {
			legend: {
				position: "bottom" as const,
				onClick: (e: ChartEvent, legendItem: import("chart.js").LegendItem) => {
					const key = legendItem.text;
					const newHidden = hidden.includes(key) ? hidden.filter((line) => line !== key) : [...hidden, key];

					setHidden(newHidden);
					savePreferences?.(newHidden);
				},
				labels: {
					boxWidth: isMobile ? 15 : 20,
					boxHeight: 3,
					font: { size: isMobile ? 11 : 12 },
					padding: isMobile ? 10 : 15,
				},
			},
			tooltip: {
				caretPadding: 25,
				mode: "nearest" as const,
				itemSort: (a, b) => 0,
				callbacks: {
					label: function (tooltipItem: TooltipItem<"line">) {
						const dataset = tooltipItem.dataset;
						const label = dataset.label;
						const value = tooltipItem.raw;
						const unit = (dataset as unknown as { unit: string }).unit;

						const key = Object.keys(chartConfig).find((k) => chartConfig[k as keyof typeof chartConfig].label === label);

						if (key) {
							const config = chartConfig[key as keyof typeof chartConfig];

							const valueMap = config.valueMap;
							if (valueMap && value !== null && typeof value === "number") {
								const valueKey = value.toString();
								const translatedValue = t(`chart.${key}_valueMap.${valueKey}`, { defaultValue: valueMap[valueKey] });

								return `${label}: ${translatedValue}`;
							}
						}

						return `${label}: ${value} ${unit}`;
					},
				},
				titleFont: { size: isMobile ? 11 : 14 },
				bodyFont: { size: isMobile ? 10 : 12 },
				padding: isMobile ? 6 : 10,
			},
			zoom: {
				pan: { enabled: isZoomEnabled, mode: "x" },
				zoom: {
					wheel: { enabled: isZoomEnabled },
					pinch: { enabled: isZoomEnabled },
					mode: "x",
				},
			},
		},
		scales: {
			x: {
				type: "time",
				time: {
					unit: "minute",
					tooltipFormat: "dd/MM/yyyy HH:mm",
					displayFormats: {
						minute: "HH:mm",
						hour: "HH:mm",
						day: "dd/MM",
					},
				},
				offset: false,
				ticks: {
					color: currentColors.axisColor,
					maxRotation: isMobile ? 90 : 0,
					minRotation: isMobile ? 90 : 0,
					font: {
						size: isMobile ? 9 : 12,
					},
					maxTicksLimit: isMobile ? 8 : 15,
				},
				grid: { color: currentColors.gridColor, display: false },
			},
			y: {
				ticks: {
					color: currentColors.axisColor,
					font: {
						size: isMobile ? 10 : 12,
					},
					callback: function (value) {
						if (isMobile && typeof value === "number" && value >= 1000) {
							return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}k`;
						}
						return value;
					},
				},
				grid: { color: currentColors.gridColor, tickBorderDash: isMobile ? [2, 4] : undefined },
			},
		},
	};

	return (
		<div
			className={`w-full ${height} ${className}`}
			ref={chartRef}
			onClick={handleChartClick}
		>
			<Line
				data={chartData}
				options={options}
				ref={(chart) => {
					if (chart) chartInstanceRef.current = chart;
				}}
			/>
		</div>
	);
};

export default BaseHistoryGraph;
