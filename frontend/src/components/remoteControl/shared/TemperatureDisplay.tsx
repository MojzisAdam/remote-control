import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemperatureDisplayProps {
	data: {
		reg_192?: number;
		reg_673?: number;
		reg_674?: number;
		reg_675?: number;
		reg_676?: number;
		reg_677?: number;
		reg_678?: number;
		reg_679?: number;
		reg_680?: number;
		reg_685?: number;
		reg_704?: number;
		reg_705?: number;
		reg_707?: number;
		reg_708?: number;
		reg_681?: number;
		she_hum?: number;
	};
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({ data }) => {
	const { t } = useTranslation("remote-control");

	const getLabel = (key: string) => t(`temperature.labels.${key}`);

	const getTemperatureStyles = (temp: number | undefined): { textColor: string; bgColor: string; borderColor: string } => {
		if (temp === undefined || temp == -128) {
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

	const getHumidityStyles = (value: number | undefined): { textColor: string; bgColor: string; borderColor: string } => {
		if (value === undefined || value == -1) {
			return {
				textColor: "text-gray-400 dark:text-gray-500",
				bgColor: "bg-gray-50 dark:bg-gray-800",
				borderColor: "border-gray-200 dark:border-gray-700",
			};
		}

		return {
			textColor: "text-sky-600 dark:text-sky-400",
			bgColor: "bg-sky-50 dark:bg-sky-900/20",
			borderColor: "border-sky-100 dark:border-sky-800",
		};
	};

	const formatHumidity = (value: number | undefined): string => {
		if (value === undefined || value == -1) return t("temperature.fallback");
		return `${value} %`;
	};

	const formatTemperature = (value: number | undefined): string => {
		if (value === undefined || value == -128) return t("temperature.fallback");
		return `${value} °C`;
	};

	const getProstorovaTeplota = (): string => {
		if (data.reg_192 == 1) {
			if (data.reg_677 == -128) return t("temperature.fallback");
			return `${data.reg_677} °C`;
		} else if (data.reg_192 == 2) {
			if (data.reg_681 === undefined) return t("temperature.fallback");
			return `${data.reg_681} °C`;
		}
		return t("temperature.fallback");
	};

	const getProstorovaTemperatureValue = (): number | undefined => {
		if (data.reg_192 == 1) {
			return data.reg_677;
		} else if (data.reg_192 == 2) {
			return data.reg_681;
		}
		return undefined;
	};

	const temperatureReadings = [
		{ key: "reg_673", value: data.reg_673 },
		{ key: "reg_674", value: data.reg_674 },
		{ key: "reg_675", value: data.reg_675 },
		...(data.reg_676 !== undefined && data.reg_676 != -128 ? [{ key: "reg_676", value: data.reg_676 }] : []),
		...(data.reg_677 !== undefined && data.reg_677 != -128 ? [{ key: "reg_677", value: data.reg_677 }] : []),
		...(data.reg_678 !== undefined && data.reg_678 != -128 ? [{ key: "reg_678", value: data.reg_678 }] : []),
		...(data.reg_679 !== undefined && data.reg_679 != -128 ? [{ key: "reg_679", value: data.reg_679 }] : []),
		...(data.reg_680 !== undefined && data.reg_680 != -128 ? [{ key: "reg_680", value: data.reg_680 }] : []),
		...(data.reg_685 !== undefined && data.reg_685 != -128 ? [{ key: "reg_685", value: data.reg_685 }] : []),
	].filter((item) => item.value !== undefined && item.value != -128);

	const desiredTemperatures = [
		{ key: "reg_704", value: data.reg_704 },
		{ key: "reg_705", value: data.reg_705 },
		{ key: "reg_707", value: data.reg_707 },
		...(data.reg_708 !== undefined && data.reg_708 != -128 ? [{ key: "reg_708", value: data.reg_708 }] : []),
	].filter((item) => item.value !== undefined && item.value != -128);

	const renderTemperatureCard = (item: { key: string; value: number | undefined }) => {
		const { key, value } = item;
		const { textColor, bgColor } = getTemperatureStyles(value);

		return (
			<div
				key={key}
				className={`flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-zinc-900/55`}
			>
				<div className="px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-zinc-900 h-full flex flex-col justify-between">
					<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getLabel(key)}</div>
					<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${textColor}`}>{formatTemperature(value)}</div>
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

	const showProstorovaTeplota = getProstorovaTemperatureValue() !== undefined && getProstorovaTemperatureValue() != -128;
	const showProstorovaHumidity = data.she_hum !== undefined && data.she_hum !== -1;
	const showProstorovyTermostat = showProstorovaTeplota || showProstorovaHumidity;

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
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{temperatureReadings.map(renderTemperatureCard)}</div>
					</div>
				)}

				{/* Desired Temperatures Section */}
				{desiredTemperatures.length > 0 && (
					<div>
						<SectionTitle title={t("temperature.desired")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{desiredTemperatures.map(renderTemperatureCard)}</div>
					</div>
				)}

				{/* Room Thermostat Section */}
				{showProstorovyTermostat && (
					<div>
						<SectionTitle title={t("temperature.thermostat")} />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{showProstorovaTeplota && (
								<div className={`flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-none`}>
									<div className="px-4 py-3 bg-white dark:bg-zinc-900">
										<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getLabel("reg_681")}</div>
										<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${getTemperatureStyles(getProstorovaTemperatureValue()).textColor}`}>
											{getProstorovaTeplota()}
										</div>
									</div>
									<div className={`h-2 w-full ${getTemperatureStyles(getProstorovaTemperatureValue()).bgColor}`}></div>
								</div>
							)}

							{showProstorovaHumidity && (
								<div className={`flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-none`}>
									<div className="px-4 py-3 bg-white dark:bg-zinc-900">
										<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getLabel("she_hum")}</div>
										<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${getHumidityStyles(data.she_hum).textColor}`}>
											{formatHumidity(data.she_hum)}
										</div>
									</div>
									<div className={`h-2 w-full ${getHumidityStyles(data.she_hum).bgColor}`}></div>
								</div>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default TemperatureDisplay;
