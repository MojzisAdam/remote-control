import React from "react";
import ErrorHint from "@/components/remoteControl/shared/ErrorHint";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { NotebookText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeviceStatesProps {
	data: {
		reg_100?: number;
		reg_101?: number;
		reg_102?: number;
		reg_122?: number;
		reg_124?: number;
		reg_128?: number;
		reg_129?: number;
		reg_132?: number;
		reg_138?: number;
		reg_130?: number;
		script_version?: string;
	};
	hasExtendedView?: boolean;
}

const DeviceStates: React.FC<DeviceStatesProps> = ({ data, hasExtendedView }) => {
	const { t } = useTranslation("remote-control");

	const display_version: boolean = false;

	const getLabel = (key: string) => t(`daitsu.deviceStates.labels.${key}`);

	const getBitName = (register: string, bit: number): string => {
		return t(`daitsu.deviceStates.bits.${register}.bit${bit}`);
	};

	const createBitCards = (value: number | undefined, register: string, bitIndices: number[]): { key: string; value: number | undefined; bitNumber: number }[] => {
		const cards: { key: string; value: number | undefined; bitNumber: number }[] = [];

		for (const i of bitIndices) {
			const bitValue = value !== undefined ? ((value & (1 << i)) !== 0 ? 1 : 0) : undefined;
			cards.push({
				key: `${register}_bit${i}`,
				value: bitValue,
				bitNumber: i,
			});
		}

		return cards;
	};

	const renderBitCard = (item: { key: string; value: number | undefined; bitNumber: number }, register: string) => {
		const { key, value, bitNumber } = item;
		const isOn = value === 1;
		const isUnknown = value === undefined;

		const bgColor = isUnknown ? "bg-gray-50 dark:bg-gray-800" : isOn ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-50 dark:bg-gray-800";

		const textColor = isUnknown ? "text-gray-500 dark:text-gray-400" : isOn ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400";

		return (
			<div
				key={key}
				className="flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-zinc-900/55"
			>
				<div className="px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-zinc-900 h-full flex flex-col justify-between">
					<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getBitName(register, bitNumber)}</div>
					<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${textColor}`}>
						{isUnknown ? t("daitsu.deviceStates.values.unknown") : isOn ? t("daitsu.deviceStates.values.on") : t("daitsu.deviceStates.values.off")}
					</div>
				</div>
				<div className={`h-2 min-h-2 w-full ${bgColor}`}></div>
			</div>
		);
	};

	const getStateDescription = (key: string, value: number | undefined): string => {
		if (value === undefined) return t("daitsu.deviceStates.values.unknown");

		switch (key) {
			case "reg_100":
				return `${value} ${t("daitsu.deviceStates.units.hz")}`;
			case "reg_101":
				switch (value) {
					case 0:
						return t("daitsu.deviceStates.values.modes.off");
					case 2:
						return t("daitsu.deviceStates.values.modes.cooling");
					case 3:
						return t("daitsu.deviceStates.values.modes.heating");
					default:
						return t("daitsu.deviceStates.values.unknown");
				}
			case "reg_102":
				return `${value} ${t("daitsu.deviceStates.units.rpm")}`;
			case "reg_122":
				return `${value} ${t("daitsu.deviceStates.units.hours")}`;
			case "reg_124":
				return value > 0 ? `${t("daitsu.deviceStates.values.error")}: ${value}` : t("daitsu.deviceStates.values.noError");
			case "reg_128":
			case "reg_129":
				// These will be handled by renderBitField in the component
				return `0x${value.toString(16).toUpperCase().padStart(4, "0")}`;
			case "reg_132":
				return `${value} ${t("daitsu.deviceStates.units.hz")}`;
			case "reg_138":
				return `${value} ${t("daitsu.deviceStates.units.m3h")}`;
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

		if (key === "reg_124" && value > 0) {
			return {
				bgColor: "bg-red-50 dark:bg-red-900/20",
				textColor: "text-red-600 dark:text-red-400",
				icon: "alert-circle",
			};
		}

		if (key === "reg_101") {
			if (value === 0)
				return {
					bgColor: "bg-gray-50 dark:bg-gray-800",
					textColor: "text-gray-600 dark:text-gray-400",
					icon: "power",
				};
			if (value === 2)
				return {
					bgColor: "bg-sky-50 dark:bg-sky-900/20",
					textColor: "text-sky-600 dark:text-sky-400",
					icon: "snowflake",
				};
			if (value === 3)
				return {
					bgColor: "bg-amber-50 dark:bg-amber-900/20",
					textColor: "text-amber-600 dark:text-amber-400",
					icon: "flame",
				};
		}

		if (key === "reg_100" || key === "reg_132") {
			return {
				bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
				textColor: "text-indigo-600 dark:text-indigo-400",
				icon: "activity",
			};
		}

		if (key === "reg_102") {
			return {
				bgColor: "bg-violet-50 dark:bg-violet-900/20",
				textColor: "text-violet-600 dark:text-violet-400",
				icon: "fan",
			};
		}

		if (key === "reg_122") {
			return {
				bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
				textColor: "text-emerald-600 dark:text-emerald-400",
				icon: "clock",
			};
		}

		if (key === "reg_128" || key === "reg_129") {
			return {
				bgColor: "bg-purple-50 dark:bg-purple-900/20",
				textColor: "text-purple-600 dark:text-purple-400",
				icon: "cpu",
			};
		}

		if (key === "reg_138") {
			return {
				bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
				textColor: "text-cyan-600 dark:text-cyan-400",
				icon: "droplets",
			};
		}

		if (key === "script_version") {
			return {
				bgColor: "bg-green-50 dark:bg-green-900/20",
				textColor: "text-green-600 dark:text-green-400",
				icon: "code",
			};
		}

		return {
			bgColor: "bg-gray-50 dark:bg-gray-800",
			textColor: "text-gray-600 dark:text-gray-400",
			icon: "circle",
		};
	};

	const operationStates = [
		{ key: "reg_101", value: data.reg_101 }, // Operating Mode
		{ key: "reg_100", value: data.reg_100 }, // Operating frequency
		{ key: "reg_132", value: data.reg_132 }, // Unit target frequency
	];

	const blockingStates = [
		{ key: "reg_124", value: data.reg_124 }, // Current fault
	];

	const performanceStates = [
		{ key: "reg_102", value: data.reg_102 }, // Fan Speed
		{ key: "reg_122", value: data.reg_122 }, // Compressor operating time
		...(data.reg_138 !== undefined ? [{ key: "reg_138", value: data.reg_138 }] : []), // Water flow
	];

	const circulatorCards = createBitCards(data.reg_129, "reg_129", [3, 6, 8]);

	// Define which specific bits to display for each register
	const reg128DisplayBits = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Display all bits 0-9
	const reg129DisplayBits = [11, 12, 13, 14, 15]; // Display all bits 0-15

	// Create individual bit cards for reg_128 and reg_129
	const reg128BitCards = createBitCards(data.reg_128, "reg_128", reg128DisplayBits);
	const reg129BitCards = createBitCards(data.reg_129, "reg_129", reg129DisplayBits);

	const firmwareInfo = [{ key: "script_version", value: data.script_version as any }];

	const renderStateCard = (item: { key: string; value: number | string | undefined }) => {
		const { key, value } = item;
		const { bgColor, textColor } = getStatusInfo(key, value as number);

		return (
			<div
				key={key}
				className="flex flex-col rounded-xl overflow-hidden transition-all hover:shadow-md border dark:shadow-zinc-900/55"
			>
				<div className="px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-zinc-900 h-full flex flex-col justify-between">
					<div className="text-[13px] min-[1700px]:text-[14px] leading-[1.4] font-medium text-gray-500 dark:text-gray-400">{getLabel(key)}</div>
					<div className={`mt-1 text-[16px] min-[1700px]:text-[17px] leading-[1.5] font-semibold ${textColor}`}>
						{key === "reg_124" ? (
							<ErrorHint
								errorCode={value ? (value as number) : 0}
								deviceType="3"
							/>
						) : key === "script_version" ? (
							value || t("daitsu.deviceStates.values.unknown")
						) : (
							getStateDescription(key, value as number)
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
					{t("daitsu.deviceStates.title")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="space-y-8">
					{/* Operation States */}
					<div>
						<SectionTitle title={t("daitsu.deviceStates.sections.operation")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{operationStates.map(renderStateCard)}</div>
					</div>

					{/* Blocking States */}
					<div>
						<SectionTitle title={t("daitsu.deviceStates.sections.blocking")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">{blockingStates.map(renderStateCard)}</div>
					</div>

					{/* Performance States */}
					<div>
						<SectionTitle title={t("daitsu.deviceStates.sections.performance")} />
						<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4">
							{performanceStates.map(renderStateCard)} {circulatorCards.map((card) => renderBitCard(card, "reg_129"))}
						</div>
					</div>

					{hasExtendedView && (
						<div>
							<SectionTitle title={t("daitsu.deviceStates.sections.statusBits")} />
							<div className="space-y-6">
								{/* reg_128 Status Bit 1 */}
								<div>
									<h3 className="text-sm md:text-md font-medium text-gray-600 dark:text-gray-300 mb-3">{t("daitsu.deviceStates.labels.reg_128")}</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">{reg128BitCards.map((card) => renderBitCard(card, "reg_128"))}</div>
								</div>

								{/* reg_129 Load Output */}
								<div>
									<h3 className="text-sm md:text-md font-medium text-gray-600 dark:text-gray-300 mb-3">{t("daitsu.deviceStates.labels.reg_129")}</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">{reg129BitCards.map((card) => renderBitCard(card, "reg_129"))}</div>
								</div>
							</div>
						</div>
					)}

					{/* Firmware Info */}
					{display_version && (
						<div>
							<SectionTitle title={t("daitsu.deviceStates.sections.firmware")} />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">{firmwareInfo.map(renderStateCard)}</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default DeviceStates;
