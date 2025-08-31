import React from "react";
import ErrorHint from "@/components/remoteControl/shared/ErrorHint";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { NotebookText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeviceStatesProps {
	data: {
		reg_736?: number;
		reg_737?: number;
		reg_739?: number;
		reg_740?: number;
		reg_741?: number;
		reg_608?: number;
		reg_610?: number;
		reg_640?: number;
		reg_646?: number;
		reg_745?: number;
		reg_746?: number;
		reg_512?: number;
		reg_834?: number;
		fw_v?: string | number;
	};
}

const DeviceStates: React.FC<DeviceStatesProps> = ({ data }) => {
	const { t } = useTranslation("remote-control");

	const display_version: boolean = false;

	const getLabel = (key: string) => t(`deviceStates.labels.${key}`);

	const getStateDescription = (key: string, value: number | undefined): string => {
		if (value === undefined) return t("deviceStates.values.unknown");

		switch (key) {
			case "reg_736":
				return t(`deviceStates.values.modes.${value}`);
			case "reg_737":
				return t(`deviceStates.values.unitStates.${value}`);
			case "reg_739":
			case "reg_740":
				return value === 0 ? t("deviceStates.values.notBlocked") : t("deviceStates.values.blocked");
			case "reg_741":
				return value === 0 ? t("deviceStates.values.winter") : t("deviceStates.values.summer");
			case "reg_608":
				return value === 0 ? t("deviceStates.values.off") : t("deviceStates.values.on");
			case "reg_610":
				return `${value} ${t("deviceStates.units.percent")}`;
			case "reg_640":
			case "reg_646":
				return t(`deviceStates.values.dzLevels.${value}`);
			case "reg_745":
				return `${value} ${t("deviceStates.units.m3h")}`;
			case "reg_746":
				return `${value} ${t("deviceStates.units.kw")}`;
			case "reg_834":
				return value !== undefined ? (value / 100).toFixed(2) : t("deviceStates.values.unknown");
			default:
				return value.toString();
		}
	};

	const getStatusInfo = (key: string, value: number | undefined): { bgColor: string; textColor: string; icon: string } => {
		if (value === undefined)
			return {
				bgColor: "bg-gray-50 dark:bg-gray-800",
				textColor: "text-gray-500 dark:text-gray-400",
				icon: "question-mark",
			};

		if (key === "reg_512" && value > 0) {
			return {
				bgColor: "bg-red-50 dark:bg-red-900/20",
				textColor: "text-red-600 dark:text-red-400",
				icon: "alert-circle",
			};
		}

		if (key === "reg_736") {
			if (value === 0)
				return {
					bgColor: "bg-gray-50 dark:bg-gray-800",
					textColor: "text-gray-600 dark:text-gray-400",
					icon: "power",
				};
			if ([1, 2, 4, 6].includes(value))
				return {
					bgColor: "bg-amber-50 dark:bg-amber-900/20",
					textColor: "text-amber-600 dark:text-amber-400",
					icon: "flame",
				};
			return {
				bgColor: "bg-sky-50 dark:bg-sky-900/20",
				textColor: "text-sky-600 dark:text-sky-400",
				icon: "snowflake",
			};
		}

		if (key === "reg_737") {
			if (value === 0)
				return {
					bgColor: "bg-gray-50 dark:bg-gray-800",
					textColor: "text-gray-600 dark:text-gray-400",
					icon: "power-off",
				};
			if ([1, 2].includes(value))
				return {
					bgColor: "bg-amber-50 dark:bg-amber-900/20",
					textColor: "text-amber-600 dark:text-amber-400",
					icon: "flame",
				};
			return {
				bgColor: "bg-sky-50 dark:bg-sky-900/20",
				textColor: "text-sky-600 dark:text-sky-400",
				icon: "snowflake",
			};
		}

		if (key === "reg_739" || key === "reg_740") {
			return value === 0
				? {
						bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
						textColor: "text-emerald-600 dark:text-emerald-400",
						icon: "check",
				  }
				: {
						bgColor: "bg-red-50 dark:bg-red-900/20",
						textColor: "text-red-600 dark:text-red-400",
						icon: "x",
				  };
		}

		if (key === "reg_741") {
			return value === 0
				? {
						bgColor: "bg-sky-50 dark:bg-sky-900/20",
						textColor: "text-sky-600 dark:text-sky-400",
						icon: "snowflake",
				  }
				: {
						bgColor: "bg-amber-50 dark:bg-amber-900/20",
						textColor: "text-amber-600 dark:text-amber-400",
						icon: "sun",
				  };
		}

		if (key === "reg_608") {
			return value === 0
				? {
						bgColor: "bg-gray-50 dark:bg-gray-800",
						textColor: "text-gray-600 dark:text-gray-400",
						icon: "power-off",
				  }
				: {
						bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
						textColor: "text-emerald-600 dark:text-emerald-400",
						icon: "play",
				  };
		}

		if (key === "reg_610") {
			return {
				bgColor: "bg-violet-50 dark:bg-violet-900/20",
				textColor: "text-violet-600 dark:text-violet-400",
				icon: "activity",
			};
		}

		if (key === "reg_640" || key === "reg_646") {
			if (value === 0)
				return {
					bgColor: "bg-gray-50 dark:bg-gray-800",
					textColor: "text-gray-600 dark:text-gray-400",
					icon: "power-off",
				};
			return {
				bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
				textColor: "text-emerald-600 dark:text-emerald-400",
				icon: "zap",
			};
		}

		if (key === "reg_745" || key === "reg_746") {
			return {
				bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
				textColor: "text-indigo-600 dark:text-indigo-400",
				icon: "bar-chart",
			};
		}

		return {
			bgColor: "bg-gray-50 dark:bg-gray-800",
			textColor: "text-gray-600 dark:text-gray-400",
			icon: "circle",
		};
	};

	const operationStates = [
		{ key: "reg_736", value: data.reg_736 },
		{ key: "reg_737", value: data.reg_737 },
		{ key: "reg_741", value: data.reg_741 },
	];

	const blockingStates = [
		{ key: "reg_739", value: data.reg_739 },
		{ key: "reg_740", value: data.reg_740 },
		{ key: "reg_512", value: data.reg_512 },
	];

	const performanceStates = [
		{ key: "reg_608", value: data.reg_608 },
		{ key: "reg_610", value: data.reg_610 },
		...(data.reg_745 !== undefined ? [{ key: "reg_745", value: data.reg_745 }] : []),
		...(data.reg_746 !== undefined ? [{ key: "reg_746", value: data.reg_746 }] : []),
	];

	const auxiliaryStates = [
		{ key: "reg_640", value: data.reg_640 },
		{ key: "reg_646", value: data.reg_646 },
	];

	const firmwareInfo = [
		{ key: "fw_v", value: data.fw_v as number },
		{ key: "reg_834", value: data.reg_834 },
	];

	const renderStateCard = (item: { key: string; value: number | undefined }) => {
		const { key, value } = item;
		const { bgColor, textColor } = getStatusInfo(key, value);

		return (
			<div
				key={key}
				className="flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-zinc-900/55"
			>
				<div className="px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-zinc-900 h-full flex flex-col justify-between">
					<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getLabel(key)}</div>
					<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${textColor}`}>
						{key === "reg_512" ? (
							<ErrorHint
								errorCode={value ? value : 0}
								firmwareVersion={data.reg_834}
								deviceType="1"
							/>
						) : (
							getStateDescription(key, value)
						)}
					</div>
				</div>
				<div className={`h-2 min-h-2 w-full ${bgColor}`}></div>
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
					<NotebookText />
					{t("deviceStates.title")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="space-y-8">
					{/* Operation States */}
					<div>
						<SectionTitle title={t("deviceStates.sections.operation")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{operationStates.map(renderStateCard)}</div>
					</div>

					{/* Blocking States */}
					<div>
						<SectionTitle title={t("deviceStates.sections.blocking")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{blockingStates.map(renderStateCard)}</div>
					</div>

					{/* Performance States */}
					<div>
						<SectionTitle title={t("deviceStates.sections.performance")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{performanceStates.map(renderStateCard)}</div>
					</div>

					{/* Auxiliary States */}
					<div>
						<SectionTitle title={t("deviceStates.sections.auxiliary")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{auxiliaryStates.map(renderStateCard)}</div>
					</div>

					{/* Firmware Info */}
					{display_version && (
						<div>
							<SectionTitle title={t("deviceStates.sections.firmware")} />
							<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{firmwareInfo.map(renderStateCard)}</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default DeviceStates;
