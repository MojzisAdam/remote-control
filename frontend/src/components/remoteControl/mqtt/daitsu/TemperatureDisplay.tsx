import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemperatureDisplayProps {
	data: {
		reg_2?: number;
		reg_3?: number;
		reg_4?: number;
		reg_104?: number;
		reg_105?: number;
		reg_106?: number;
		reg_107?: number;
		reg_108?: number;
		reg_109?: number;
		reg_110?: number;
		reg_111?: number;
		reg_112?: number;
		reg_113?: number;
		reg_114?: number;
		reg_115?: number;
		reg_120?: number;
		reg_121?: number;
		reg_135?: number;
		reg_136?: number;
		reg_137?: number;
	};
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({ data }) => {
	const { t } = useTranslation("remote-control");

	const getLabel = (key: string) => t(`daitsu.temperature.labels.${key}`);

	const getTemperatureStyles = (temp: number | undefined): { textColor: string; bgColor: string; borderColor: string } => {
		if (temp === undefined || temp == 255) {
			return {
				textColor: "text-gray-400 dark:text-gray-500",
				bgColor: "bg-gray-50 dark:bg-gray-800",
				borderColor: "border-gray-200 dark:border-gray-700",
			};
		}

		if (temp < 0) {
			return {
				textColor: "text-blue-600 dark:text-blue-400",
				bgColor: "bg-blue-50 dark:bg-blue-900/20",
				borderColor: "border-blue-100 dark:border-blue-800",
			};
		}

		if (temp < 20) {
			return {
				textColor: "text-emerald-600 dark:text-emerald-400",
				bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
				borderColor: "border-emerald-100 dark:border-emerald-800",
			};
		}

		if (temp < 40) {
			return {
				textColor: "text-amber-600 dark:text-amber-400",
				bgColor: "bg-amber-50 dark:bg-amber-900/20",
				borderColor: "border-amber-100 dark:border-amber-800",
			};
		}

		if (temp < 60) {
			return {
				textColor: "text-orange-600 dark:text-orange-400",
				bgColor: "bg-orange-50 dark:bg-orange-900/20",
				borderColor: "border-orange-100 dark:border-orange-800",
			};
		}

		return {
			textColor: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-50 dark:bg-red-900/20",
			borderColor: "border-red-100 dark:border-red-800",
		};
	};

	const formatTemperature = (value: number | undefined): string => {
		if (value === undefined || value == 255) return t("temperature.fallback");
		return `${value} °C`;
	};

	const getDesiredTempSensorOne = (curve: number | undefined, setpoint: number | undefined, zone: number): number | undefined => {
		if (zone === 1) {
			// T1s_z1 logic: use reg_136 if not 255, otherwise use upper 8 bits of reg_2
			if (setpoint !== undefined && setpoint !== 255) {
				return setpoint;
			} else if (curve !== undefined) {
				return (curve >> 8) & 0xff;
			}
		} else if (zone === 2) {
			// T1s_z2 logic: use reg_137 if not 255, otherwise use lower 8 bits of reg_2
			if (setpoint !== undefined && setpoint !== 255) {
				return setpoint;
			} else if (curve !== undefined) {
				return curve & 0xff;
			}
		}
		return undefined;
	};

	const temperatureReadings = [
		{ key: "reg_104", value: data.reg_104 },
		{ key: "reg_105", value: data.reg_105 },
		{ key: "reg_106", value: data.reg_106 },
		{ key: "reg_107", value: data.reg_107 },
		{ key: "reg_108", value: data.reg_108 },
		{ key: "reg_109", value: data.reg_109 },
		{ key: "reg_110", value: data.reg_110 },
		{ key: "reg_111", value: data.reg_111 },
		{ key: "reg_112", value: data.reg_112 },
		{ key: "reg_113", value: data.reg_113 },
		{ key: "reg_114", value: data.reg_114 },
		{ key: "reg_115", value: data.reg_115 },
		{ key: "reg_120", value: data.reg_120 },
		{ key: "reg_121", value: data.reg_121 },
		{ key: "reg_135", value: data.reg_135 },
	].filter((item) => item.value !== undefined && item.value != 255);

	const desiredTemperatures = [
		{ key: "T1s_z1", value: getDesiredTempSensorOne(data.reg_2, data.reg_136, 1) },
		{ key: "T1s_z2", value: getDesiredTempSensorOne(data.reg_2, data.reg_137, 2) },
		{ key: "reg_3", value: data.reg_3 !== undefined ? data.reg_3 / 2 : undefined },
		{ key: "reg_4", value: data.reg_4 },
	].filter((item) => item.value !== undefined && item.value != 255);

	const renderTemperatureCard = (item: { key: string; value: number | undefined }) => {
		const { key, value } = item;
		const { textColor, bgColor } = getTemperatureStyles(value);

		return (
			<div
				key={key}
				className={`flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-zinc-900/55`}
			>
				<div className="px-4 py-3 bg-white dark:bg-zinc-900 h-full flex flex-col justify-between">
					<div className="text-sm font-medium text-gray-500 dark:text-gray-400">{getLabel(key)}</div>
					<div className={`mt-1 text-xl font-semibold ${textColor}`}>{formatTemperature(value)}</div>
				</div>
				<div className={`h-2 w-full ${bgColor}`}></div>
			</div>
		);
	};

	const SectionTitle = ({ title }: { title: string }) => (
		<div className="mb-4">
			<h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</h2>
			<div className="h-1 w-16 bg-red-500 dark:bg-red-400 rounded mt-1"></div>
		</div>
	);

	return (
		<Card className="shadow-lg w-full h-fit">
			<CardHeader>
				<CardTitle className="text-xl font-bold flex items-center gap-2">
					<Thermometer />
					{t("temperature.title")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				{/* Temperature Readings Section */}
				{temperatureReadings.length > 0 && (
					<div>
						<SectionTitle title={t("temperature.current")} />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{temperatureReadings.map(renderTemperatureCard)}</div>
					</div>
				)}

				{/* Desired Temperatures Section */}
				{desiredTemperatures.length > 0 && (
					<div>
						<SectionTitle title={t("temperature.desired")} />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{desiredTemperatures.map(renderTemperatureCard)}</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default TemperatureDisplay;
