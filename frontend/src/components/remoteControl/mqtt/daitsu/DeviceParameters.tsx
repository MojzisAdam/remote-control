import React, { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Pencil, Minus, Plus, Thermometer, Droplet, Sun, Home, Settings, Zap, LayoutGrid, Gauge } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import parametersDataEN from "@/jsons/parameters_daitsu.json";
import parametersDataCZ from "@/jsons/parameters_daitsu_cz.json";
import { isCzech } from "@/utils/langUtils";

import { useDeviceParameterLogs } from "@/hooks/useDeviceParameterLogs";

interface ParameterOption {
	[key: string]: string;
}

interface BitfieldBit {
	description: string;
	options: ParameterOption;
}

interface BitfieldRange {
	description: string;
	start_bit: number;
	end_bit: number;
	min_value?: number;
	max_value?: number;
	unit?: string;
}

interface BaseParameter {
	register: number;
	default_value: number;
	user_access: boolean;
	description: string;
	type: string;
}

interface IntParameter extends BaseParameter {
	type: "int";
	min_value: number;
	max_value: number;
	increment_value?: number;
	unit?: string;
}

interface FloatParameter extends BaseParameter {
	type: "float";
	min_value: number;
	max_value: number;
	increment_value?: number;
	multiplied?: number;
	unit?: string;
}

interface OptionsParameter extends BaseParameter {
	type: "options";
	options: ParameterOption;
}

interface SwitchParameter extends BaseParameter {
	type: "switch";
	options: ParameterOption;
}

interface BitfieldParameter extends BaseParameter {
	type: "bitfield";
	bits?: { [bitNumber: string]: BitfieldBit };
	ranges?: { [rangeName: string]: BitfieldRange };
}

type Parameter = IntParameter | FloatParameter | OptionsParameter | SwitchParameter | BitfieldParameter;

interface DeviceData {
	[key: string]: number | string | undefined;
}

interface DeviceParametersProps {
	deviceId: string;
	deviceData: DeviceData;
	onUpdateParameter: (register: number, value: number) => void;
	isExtendedMode?: boolean;
}

interface PendingUpdate {
	register: number;
	oldValue: number | null;
	newValue: number;
	timestamp: number;
	error?: boolean;
	remove?: boolean;
	// For bitfield parameters
	bitNumber?: number;
	rangeName?: string;
	parameterKey?: string; // The specific parameter key (e.g., "reg_0_bit_3")
}

const groupIcons: Record<string, ReactNode> = {
	basicParameters: <Gauge className="w-4 h-4" />,
	commonRegulatorParameters: <Settings className="w-4 h-4" />,
	heatingCircuitParameters: <Thermometer className="w-4 h-4" />,
	domesticHotWaterParameters: <Droplet className="w-4 h-4" />,
	bivalentSourceParameters: <Zap className="w-4 h-4" />,
	photovoltaicParameters: <Sun className="w-4 h-4" />,
	roomThermostatParameters: <Home className="w-4 h-4" />,
	basicParameters2: <Gauge className="w-4 h-4" />,
	heatingCircuit2Parameters: <Thermometer className="w-4 h-4" />,
	extendedParameters: <LayoutGrid className="w-4 h-4" />,
};

const parameterGroups = {
	basicParameters: [0, 1, 5, 7, 8, 9, 10, 13, 209, 210, 211],
	commonRegulatorParameters: [
		215, 216, 217, 221, 222, 223, 224, 225, 228, 229, 230, 235, 238, 240, 241, 242, 245, 246, 247, 248, 249, 250, 251, 252, 254, 255, 256, 257, 258, 259, 260, 269, 270, 271,
	],
	heatingCircuitParameters: [2, 6, 201, 202, 203, 204, 205, 206, 218, 220, 261, 262, 263, 264, 265, 266, 267, 268],
	domesticHotWaterParameters: [4, 207, 208, 212, 213, 214, 219, 226, 227, 231, 232, 233, 234, 237, 243, 244],
	bivalentSourceParameters: [],
	photovoltaicParameters: [],
	roomThermostatParameters: [3],
	basicParameters2: [],
	heatingCircuit2Parameters: [],
	extendedParameters: ["fhi", 200, 272],
};

// Utility functions for bitfield operations
const getBitValue = (value: number, bit: number): boolean => {
	return (value & (1 << bit)) !== 0;
};

const setBitValue = (value: number, bit: number, enable: boolean): number => {
	if (enable) {
		return value | (1 << bit);
	} else {
		return value & ~(1 << bit);
	}
};

const getRangeValue = (value: number, startBit: number, endBit: number): number => {
	const mask = (1 << (endBit - startBit + 1)) - 1;
	return (value >> startBit) & mask;
};

const setRangeValue = (value: number, startBit: number, endBit: number, rangeValue: number): number => {
	const mask = (1 << (endBit - startBit + 1)) - 1;
	const clearedValue = value & ~(mask << startBit);
	return clearedValue | ((rangeValue & mask) << startBit);
};

export const DeviceParameters: React.FC<DeviceParametersProps> = ({ deviceId, deviceData, onUpdateParameter, isExtendedMode = false }) => {
	const { logChange } = useDeviceParameterLogs();
	const { i18n, t } = useTranslation("remote-control");
	const parametersData = isCzech(i18n.language) ? parametersDataCZ : parametersDataEN;

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedParameter, setSelectedParameter] = useState<{
		key: string;
		param: Parameter;
		value: number | null;
		originalParam?: Parameter;
		originalKey?: string;
		bitNumber?: number;
		rangeName?: string;
		rangeConfig?: BitfieldRange;
	} | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const [editSwitchValue, setEditSwitchValue] = useState<boolean>(false);
	const [editBitfieldValue, setEditBitfieldValue] = useState<number>(0);
	const [activeTab, setActiveTab] = useState<string>();
	const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
	const [prevDeviceData, setPrevDeviceData] = useState<DeviceData>(deviceData);

	const storageKey = `deviceParamsState_${deviceId}`;
	const latestState = useRef({ activeTab, pendingUpdates });

	useEffect(() => {
		latestState.current = { activeTab, pendingUpdates };
	}, [activeTab, pendingUpdates]);

	useEffect(() => {
		const savedState = sessionStorage.getItem(storageKey);
		if (savedState) {
			try {
				const parsed = JSON.parse(savedState);
				if (availableGroups.includes(parsed.activeTab)) {
					setActiveTab(parsed.activeTab);
				} else {
					setActiveTab(availableGroups[0]);
				}
				setPendingUpdates(parsed.pendingUpdates);
			} catch (error) {
				console.error("Error parsing saved state", error);
			}
		} else {
			setActiveTab(availableGroups[0]);
		}
		return () => {
			sessionStorage.setItem(storageKey, JSON.stringify(latestState.current));
		};
	}, []);

	const groupedParameters = useMemo(() => {
		const result: {
			[groupName: string]: {
				key: string;
				param: Parameter;
				value: number | null;
				bitNumber?: number;
				rangeName?: string;
				rangeConfig?: BitfieldRange;
				originalParam?: Parameter;
				originalValue?: number | null;
			}[];
		} = {};

		const addParameterToGroup = (groupName: string, item: any) => {
			if (!result[groupName]) {
				result[groupName] = [];
			}
			result[groupName].push(item);
		};

		// Always use the same logic regardless of isExtendedMode
		Object.entries(deviceData).forEach(([key, value]) => {
			if (key in parametersData) {
				const param = parametersData[key as keyof typeof parametersData] as Parameter;
				const register = param.register;

				const groupEntry = Object.entries(parameterGroups).find(([, registers]) => {
					return registers.some((reg) => (typeof reg === "number" && reg === register) || (typeof reg === "string" && reg === key));
				});

				if (groupEntry) {
					const groupName = groupEntry[0];
					const numericValue = typeof value === "string" ? Number(value) : value;

					if (param.type === "bitfield") {
						// Expand bitfield into individual bits and ranges
						if (param.bits) {
							Object.entries(param.bits).forEach(([bitNumber, bitConfig]) => {
								const bitNum = parseInt(bitNumber);
								const isSet = getBitValue(numericValue || 0, bitNum);

								addParameterToGroup(groupName, {
									key: `${key}_bit_${bitNumber}`,
									param: {
										...param,
										type: "switch",
										description: bitConfig.description,
										options: bitConfig.options,
									} as SwitchParameter,
									value: isSet ? 1 : 0,
									bitNumber: bitNum,
									originalParam: param,
									originalValue: numericValue,
								});
							});
						}

						if (param.ranges) {
							Object.entries(param.ranges).forEach(([rangeName, rangeConfig]) => {
								const currentRangeValue = getRangeValue(numericValue || 0, rangeConfig.start_bit, rangeConfig.end_bit);

								addParameterToGroup(groupName, {
									key: `${key}_range_${rangeName}`,
									param: {
										...param,
										type: "int",
										description: rangeConfig.description,
										min_value: rangeConfig.min_value || 0,
										max_value: rangeConfig.max_value || (1 << (rangeConfig.end_bit - rangeConfig.start_bit + 1)) - 1,
										unit: rangeConfig.unit,
									} as IntParameter,
									value: currentRangeValue,
									rangeName,
									rangeConfig,
									originalParam: param,
									originalValue: numericValue,
								});
							});
						}
					} else {
						// Regular parameter
						if (value !== undefined) {
							addParameterToGroup(groupName, {
								key,
								param,
								value: numericValue,
							});
						}
					}
				}
			}
		});

		return result;
	}, [deviceData, isExtendedMode]);

	const availableGroups = useMemo(() => {
		// Return groups in the order they are defined in parameterGroups
		return Object.keys(parameterGroups).filter((group) => group in groupedParameters);
	}, [groupedParameters]);

	useEffect(() => {
		if (!activeTab || !availableGroups.includes(activeTab)) {
			if (availableGroups.length > 0) {
				setActiveTab(availableGroups[0]);
			}
		}
	}, [availableGroups, activeTab]);

	useEffect(() => {
		const currentTime = Date.now();
		const timeoutPeriod = 30000;

		setPendingUpdates((prev) =>
			prev
				.map((update) => {
					if (update.parameterKey) {
						// For bitfield parameters, find the specific parameter item
						let currentParameterValue: number | undefined = undefined;

						Object.entries(groupedParameters).forEach(([, params]) => {
							params.forEach(({ key, value }) => {
								if (key === update.parameterKey) {
									currentParameterValue = value !== null ? value : undefined;
								}
							});
						});

						// Check if the specific bit/range value matches the expected new value
						if (currentParameterValue !== undefined && currentParameterValue === update.newValue) {
							return { ...update, remove: true };
						}

						// Check for timeout
						if (currentTime - update.timestamp > timeoutPeriod && !update.error) {
							return { ...update, error: true };
						}

						return update;
					} else {
						// Regular parameter handling (existing logic)
						let regKey: string | null = null;
						let currentValue: number | undefined = undefined;

						Object.entries(groupedParameters).forEach(([, params]) => {
							params.forEach(({ key, param, value }) => {
								if (param.register === update.register) {
									regKey = key;
									currentValue = value !== null ? value : undefined;
								}
							});
						});

						if (!regKey) return update;

						if (currentValue !== undefined && currentValue === update.newValue) {
							return { ...update, remove: true };
						}

						const prevValue = prevDeviceData[regKey] as number | undefined;
						if (currentValue !== undefined && prevValue !== undefined && currentValue !== prevValue && currentValue !== update.newValue) {
							return { ...update, remove: true };
						}

						if (currentTime - update.timestamp > timeoutPeriod && !update.error) {
							return { ...update, error: true };
						}

						return update;
					}
				})
				.filter((update) => !update.remove)
		);

		setPrevDeviceData(deviceData);
	}, [deviceData, prevDeviceData, groupedParameters]);

	const getPendingUpdate = (register: number, parameterKey?: string) => {
		return pendingUpdates.find((update) => {
			if (parameterKey && update.parameterKey) {
				// For bitfield parameters, match by specific parameter key
				return update.parameterKey === parameterKey;
			}
			// For regular parameters, match by register
			return update.register === register && !update.parameterKey;
		});
	};

	const handleParameterClick = (item: {
		key: string;
		param: Parameter;
		value: number | null;
		bitNumber?: number;
		rangeName?: string;
		rangeConfig?: BitfieldRange;
		originalParam?: Parameter;
		originalValue?: number | null;
	}) => {
		// if (!param.user_access || value === null) return;
		if (item.value === null) return;

		if (item.originalParam && item.originalParam.type === "bitfield") {
			// This is a synthetic parameter from a bitfield
			setSelectedParameter({
				key: item.key,
				param: item.param,
				value: item.value,
				originalParam: item.originalParam,
				originalKey: item.key.includes("_bit_") ? item.key.split("_bit_")[0] : item.key.split("_range_")[0],
				bitNumber: item.bitNumber,
				rangeName: item.rangeName,
				rangeConfig: item.rangeConfig,
			});
		} else {
			// Regular parameter
			setSelectedParameter({ key: item.key, param: item.param, value: item.value });
		}

		if (item.param.type === "switch") {
			setEditSwitchValue(item.value === 1);
		} else if (item.param.type === "bitfield") {
			setEditBitfieldValue(item.value);
		} else if (item.param.type === "float" && item.param.multiplied && item.value !== null) {
			setEditValue((item.value / item.param.multiplied).toString());
		} else {
			setEditValue(item.value !== null ? item.value.toString() : item.param.default_value.toString());
		}

		setIsDrawerOpen(true);
	};

	const handleSaveParameter = () => {
		if (!selectedParameter) return;

		const param = selectedParameter.param;
		let newValue: number;

		if (selectedParameter.originalParam && selectedParameter.originalParam.type === "bitfield") {
			// Handle bitfield bit or range update
			const originalKey = selectedParameter.originalKey!;
			const currentBitfieldValue = typeof deviceData[originalKey] === "string" ? Number(deviceData[originalKey]) : deviceData[originalKey] || 0;

			if (selectedParameter.bitNumber !== undefined) {
				// Update a specific bit
				if (param.type === "switch") {
					newValue = editSwitchValue ? 1 : 0;
					const updatedBitfieldValue = setBitValue(currentBitfieldValue, selectedParameter.bitNumber, newValue === 1);

					if (selectedParameter.value !== newValue) {
						setPendingUpdates((prev) => [
							...prev.filter((update) => update.parameterKey !== selectedParameter.key),
							{
								register: selectedParameter.originalParam!.register,
								oldValue: selectedParameter.value,
								newValue: newValue,
								timestamp: Date.now(),
								bitNumber: selectedParameter.bitNumber,
								parameterKey: selectedParameter.key,
							},
						]);
						onUpdateParameter(selectedParameter.originalParam!.register, updatedBitfieldValue);

						logChange(deviceId, {
							parameter: String(selectedParameter.key),
							old_value: selectedParameter.value !== null ? String(selectedParameter.value) : "",
							new_value: String(newValue),
						});
					}
				}
			} else if (selectedParameter.rangeConfig) {
				// Update a bit range
				newValue = parseInt(editValue, 10);

				if (selectedParameter.rangeConfig.min_value !== undefined && newValue < selectedParameter.rangeConfig.min_value) {
					newValue = selectedParameter.rangeConfig.min_value;
				}
				if (selectedParameter.rangeConfig.max_value !== undefined && newValue > selectedParameter.rangeConfig.max_value) {
					newValue = selectedParameter.rangeConfig.max_value;
				}

				const updatedBitfieldValue = setRangeValue(currentBitfieldValue, selectedParameter.rangeConfig.start_bit, selectedParameter.rangeConfig.end_bit, newValue);

				if (selectedParameter.value !== newValue) {
					setPendingUpdates((prev) => [
						...prev.filter((update) => update.parameterKey !== selectedParameter.key),
						{
							register: selectedParameter.originalParam!.register,
							oldValue: selectedParameter.value,
							newValue: newValue,
							timestamp: Date.now(),
							rangeName: selectedParameter.rangeName,
							parameterKey: selectedParameter.key,
						},
					]);
					onUpdateParameter(selectedParameter.originalParam!.register, updatedBitfieldValue);

					logChange(deviceId, {
						parameter: String(selectedParameter.key),
						old_value: selectedParameter.value !== null ? String(selectedParameter.value) : "",
						new_value: String(newValue),
					});
				}
			}
		} else {
			// Regular parameter handling
			if (param.type === "switch") {
				newValue = editSwitchValue ? 1 : 0;
			} else if (param.type === "bitfield") {
				newValue = editBitfieldValue;
			} else if (param.type === "float") {
				newValue = parseFloat(editValue);

				if (param.multiplied) {
					newValue = Math.round(newValue * param.multiplied);
				}

				if (param.min_value !== undefined && newValue < param.min_value * (param.multiplied || 1)) {
					newValue = Math.round(param.min_value * (param.multiplied || 1));
				}
				if (param.max_value !== undefined && newValue > param.max_value * (param.multiplied || 1)) {
					newValue = Math.round(param.max_value * (param.multiplied || 1));
				}
			} else if (param.type === "int") {
				newValue = parseInt(editValue, 10);

				if (param.min_value !== undefined && newValue < param.min_value) {
					newValue = param.min_value;
				}
				if (param.max_value !== undefined && newValue > param.max_value) {
					newValue = param.max_value;
				}
			} else {
				newValue = parseInt(editValue, 10);
			}

			if (selectedParameter.value !== newValue) {
				setPendingUpdates((prev) => [
					...prev.filter((update) => update.register !== param.register),
					{
						register: param.register,
						oldValue: selectedParameter.value,
						newValue: newValue,
						timestamp: Date.now(),
					},
				]);
				onUpdateParameter(param.register, newValue);

				logChange(deviceId, {
					parameter: String(selectedParameter.key),
					old_value: selectedParameter.value !== null ? String(selectedParameter.value) : "",
					new_value: String(newValue),
				});
			}
		}

		setIsDrawerOpen(false);
	};

	const handleRetry = (register: number, newValue: number, parameterKey?: string) => {
		setPendingUpdates((prev) =>
			prev.map((update) => {
				if (parameterKey && update.parameterKey) {
					// For bitfield parameters, match by parameter key
					return update.parameterKey === parameterKey ? { ...update, error: false, timestamp: Date.now() } : update;
				}
				// For regular parameters, match by register
				return update.register === register && !update.parameterKey ? { ...update, error: false, timestamp: Date.now() } : update;
			})
		);

		onUpdateParameter(register, newValue);
	};

	const formatDisplayValue = (param: Parameter, value: number | null) => {
		if (value === null) return "—";

		if (param.type === "options" || param.type === "switch") {
			return param.options[value.toString()] || value;
		} else if (param.type === "float" && param.multiplied) {
			const floatValue = value / param.multiplied;
			return `${floatValue.toFixed(1)} ${param.unit || ""}`;
		} else if (param.type === "bitfield") {
			// For bitfield, show the raw value in hex format
			return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
		} else if (param.type === "int" || param.type === "float") {
			return `${value} ${param.unit || ""}`;
		}

		return value.toString();
	};

	return (
		<div className="w-full max-w-[1400px] mx-auto">
			{availableGroups.length > 0 ? (
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex flex-col xl:flex-row w-full gap-8 "
				>
					<div className="max-sm:-mx-[calc((100vw-100%)/2)] max-sm:w-screen mb-4 max-sm:bg-muted max-sm:overflow-x-scroll">
						<TabsList className="flex flex-row xl:flex-col max-xl:overflow-x-scroll xl:mb-0 xl:mr-4 xl:h-fit w-auto h-full gap-2 max-sm:justify-normal max-sm:w-fit max-sm:mx-auto max-sm:rounded-none">
							{availableGroups.map((group) => (
								<TabsTrigger
									key={group}
									value={group}
									className="flex items-center justify-center xl:justify-start gap-2 py-3 px-4 text-sm whitespace-nowrap xl:w-full rounded-lg
                data-[state=active]:bg-blue-50 data-[state=active]:text-primary dark:data-[state=active]:bg-background/50 dark:data-[state=active]:text-primary
                transition-all hover:bg-gray-200 dark:hover:bg-background/30 max-sm:first:ml-2 max-sm:last:mr-2"
								>
									{groupIcons[group]}
									<span className="hidden xl:inline">{t(`parameterGroups.${group}`)}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{availableGroups.map((group) => (
						<TabsContent
							key={group}
							value={group}
							className="mt-0 flex-1 w-full focus-visible:ring-0"
						>
							<Card className="shadow-sm">
								<CardHeader className="pb-2 mb-2">
									<CardTitle className="text-lg max-md:text-base flex items-center gap-2">
										{groupIcons[group]} {t(`parameterGroups.${group}`)}
									</CardTitle>
								</CardHeader>
								<CardContent className="">
									<div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
										{groupedParameters[group].map((item) => {
											const { key, param, value } = item;
											// For bitfield synthetic parameters, use specific parameter key for pending updates
											const pendingUpdate = item.originalParam ? getPendingUpdate(item.originalParam.register, key) : getPendingUpdate(param.register);

											return (
												<div
													key={key}
													className={`p-4 border rounded-lg flex flex-col transition-all dark:bg-zinc-900/60 overflow-hidden ${
														// param.user_access &&
														value !== null ? "cursor-pointer hover:border-primary dark:hover:border-primary hover:shadow-md" : ""
													} ${
														pendingUpdate
															? pendingUpdate.error
																? "border-red-200 bg-red-50/50 dark:bg-red-950/10"
																: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10"
															: "border-gray-200 dark:border-gray-800"
													}`}
													onClick={() => handleParameterClick(item)}
												>
													{/* Main content area */}
													<div className="flex flex-col md:flex-row md:justify-between items-start gap-3 mb-3">
														{/* Parameter description */}
														<div className="flex-grow">
															<span className="font-medium text-sm text-gray-800 dark:text-gray-200">{param.description}</span>
														</div>

														{/* Value display */}
														<div className="flex flex-col items-end max-md:items-start shrink-0 max-md:w-full ">
															{pendingUpdate ? (
																<div className="text-sm font-medium w-full md:w-auto">
																	<div className="flex flex-col gap-1">
																		<div className="flex items-center md:justify-end gap-1">
																			<span className="text-gray-400 line-through break-words whitespace-normal max-w-full">
																				{formatDisplayValue(param, pendingUpdate.oldValue)}
																			</span>
																		</div>
																		<div className="flex items-center md:justify-end gap-1">
																			<span className={`break-words whitespace-normal max-w-full ${pendingUpdate.error ? "text-red-500" : "text-amber-500"}`}>
																				{formatDisplayValue(param, pendingUpdate.newValue)}
																			</span>
																		</div>
																	</div>
																</div>
															) : (
																<span
																	className={`text-sm font-medium break-words whitespace-normal max-w-full ${
																		value === null ? "text-gray-400" : "text-blue-500 dark:text-blue-400"
																	}`}
																>
																	{formatDisplayValue(param, value)}
																</span>
															)}

															{/* Error or update status */}
															{pendingUpdate && pendingUpdate.error && (
																<div className="flex items-center text-xs text-red-500 mt-3">
																	<AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
																	<span>{t("parameterEdit.updateFailed")}</span>
																</div>
															)}

															{pendingUpdate && !pendingUpdate.error && <span className="text-xs text-amber-500 mt-3">{t("parameterEdit.updating")}</span>}
														</div>
													</div>

													{/* Actions area */}
													<div className="self-end mt-auto">
														{pendingUpdate && pendingUpdate.error ? (
															<div className="flex gap-1.5">
																<Button
																	variant="outline"
																	size="sm"
																	className="text-xs py-1 h-7 px-2.5 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-800"
																	onClick={(e) => {
																		e.stopPropagation();
																		if (item.originalParam) {
																			// For bitfield parameters, need to recalculate the full bitfield value
																			// Get the original register key
																			const originalKey = item.key.includes("_bit_") ? item.key.split("_bit_")[0] : item.key.split("_range_")[0];
																			const currentBitfieldValue =
																				typeof deviceData[originalKey] === "string" ? Number(deviceData[originalKey]) : deviceData[originalKey] || 0;

																			let updatedBitfieldValue = currentBitfieldValue;

																			if (item.bitNumber !== undefined) {
																				// Update bit
																				updatedBitfieldValue = setBitValue(currentBitfieldValue, item.bitNumber, pendingUpdate.newValue === 1);
																			} else if (item.rangeConfig) {
																				// Update range
																				updatedBitfieldValue = setRangeValue(
																					currentBitfieldValue,
																					item.rangeConfig.start_bit,
																					item.rangeConfig.end_bit,
																					pendingUpdate.newValue
																				);
																			}

																			handleRetry(item.originalParam.register, updatedBitfieldValue, pendingUpdate.parameterKey);
																		} else {
																			handleRetry(param.register, pendingUpdate.newValue);
																		}
																	}}
																>
																	{t("common.retry")}
																</Button>
																<Button
																	variant="outline"
																	size="sm"
																	className="text-xs py-1 h-7 px-2.5 border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700"
																	onClick={(e) => {
																		e.stopPropagation();
																		if (item.originalParam && pendingUpdate.parameterKey) {
																			// For bitfield parameters, remove by parameter key
																			setPendingUpdates((prev) => prev.filter((update) => update.parameterKey !== pendingUpdate.parameterKey));
																		} else {
																			// For regular parameters, remove by register
																			setPendingUpdates((prev) => prev.filter((update) => update.register !== param.register && !update.parameterKey));
																		}
																	}}
																>
																	{t("common.cancel")}
																</Button>
															</div>
														) : (
															// param.user_access &&
															value !== null && (
																<Button
																	variant="outline"
																	size="sm"
																	className="text-xs py-1 h-7 px-2.5 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50"
																>
																	{pendingUpdate ? (
																		t("parameterEdit.updating")
																	) : (
																		<>
																			{" "}
																			<Pencil className="h-3.5 w-3.5 mr-1" /> {t("common.edit")}
																		</>
																	)}
																</Button>
															)
														)}
													</div>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					))}
				</Tabs>
			) : (
				<Card className="shadow-sm">
					<CardContent className="flex items-center justify-center p-8">
						<p className="text-gray-500">{t("parameterEdit.noParameters")}</p>
					</CardContent>
				</Card>
			)}

			{/* Edit Dialog */}
			{selectedParameter && (
				<Drawer
					open={isDrawerOpen}
					onOpenChange={setIsDrawerOpen}
				>
					<DrawerContent className="pb-4">
						<div className="mx-auto w-full max-w-md mt-2">
							<DrawerHeader>
								<DrawerTitle className="text-xl font-semibold dark:text-white">{selectedParameter.param.description}</DrawerTitle>
								<DrawerDescription className="opacity-80 dark:text-gray-300"></DrawerDescription>
							</DrawerHeader>

							<div className="p-4 mb-4">
								<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{}</p>

								{selectedParameter.param.type === "int" && (
									<div className="flex gap-4 w-full py-4">
										<Button
											variant="outline"
											size="sm"
											className="px-2 py-1 rounded-full"
											onClick={() => {
												const param = selectedParameter.param as IntParameter;
												setEditValue((prev) => String(Math.max(parseInt(prev, 10) - (param.increment_value ?? 1), param.min_value)));
											}}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<div className="space-y-2 w-full">
											<Label className="flex justify-center text-center mb-6 text-lg font-medium dark:text-white">
												{editValue} {selectedParameter.param.unit && `${selectedParameter.param.unit}`}
											</Label>
											<Slider
												defaultValue={[parseInt(editValue, 10)]}
												value={[parseInt(editValue, 10)]}
												min={selectedParameter.param.min_value}
												max={selectedParameter.param.max_value}
												onValueChange={(value) => setEditValue(String(value[0]))}
												step={selectedParameter.param.increment_value || 1}
												className="h-2 cursor-pointer"
											/>
											{selectedParameter.param.min_value !== undefined && selectedParameter.param.max_value !== undefined && (
												<div className="flex items-center justify-between mt-2">
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
														{selectedParameter.param.min_value}
														{selectedParameter.param.unit && ` ${selectedParameter.param.unit}`}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
														{selectedParameter.param.max_value}
														{selectedParameter.param.unit && ` ${selectedParameter.param.unit}`}
													</p>
												</div>
											)}
										</div>
										<Button
											variant="outline"
											size="sm"
											className="px-2 py-1 rounded-full"
											onClick={() => {
												const param = selectedParameter.param as IntParameter;
												setEditValue((prev) => String(Math.min(parseInt(prev, 10) + (param.increment_value ?? 1), param.max_value)));
											}}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}

								{selectedParameter.param.type === "float" && (
									<div className="flex gap-4 w-full py-4">
										<Button
											variant="outline"
											size="sm"
											className="px-2 py-1 rounded-full"
											onClick={() => {
												const param = selectedParameter.param as FloatParameter;
												setEditValue((prev) => {
													const newValue = Math.max(parseFloat(prev) - (param.increment_value ?? 0.1), param.min_value);
													return newValue.toFixed(1);
												});
											}}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<div className="space-y-2 w-full">
											<Label className="flex justify-center text-center mb-6 text-lg font-medium dark:text-white">
												{editValue} {selectedParameter.param.unit && `${selectedParameter.param.unit}`}
											</Label>
											<Slider
												defaultValue={[parseFloat(editValue)]}
												value={[parseFloat(editValue)]}
												min={selectedParameter.param.min_value}
												max={selectedParameter.param.max_value}
												onValueChange={(value) => setEditValue(String(value[0]))}
												step={selectedParameter.param.increment_value || 0.1}
												className="h-2 cursor-pointer"
											/>
											{selectedParameter.param.min_value !== undefined && selectedParameter.param.max_value !== undefined && (
												<div className="flex items-center justify-between mt-2">
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
														{selectedParameter.param.min_value}
														{selectedParameter.param.unit && ` ${selectedParameter.param.unit}`}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
														{selectedParameter.param.max_value}
														{selectedParameter.param.unit && ` ${selectedParameter.param.unit}`}
													</p>
												</div>
											)}
										</div>
										<Button
											variant="outline"
											size="sm"
											className="px-2 py-1 rounded-full"
											onClick={() => {
												const param = selectedParameter.param as FloatParameter;
												setEditValue((prev) => {
													const newValue = Math.min(parseFloat(prev) + (param.increment_value ?? 0.1), param.max_value);
													return newValue.toFixed(1);
												});
											}}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}

								{selectedParameter.param.type === "options" && (
									<div className="space-y-6 pb-2">
										<div className="mb-1 w-full text-center">
											<div className="font-medium text-gray-800 dark:text-white">{selectedParameter.param.options && selectedParameter.param.options[editValue]}</div>
										</div>
										<Separator className="my-4 w-4/5 mx-auto" />
										<Select
											value={editValue}
											onValueChange={setEditValue}
										>
											<SelectTrigger className="w-full p-3 border rounded-lg shadow-sm">
												<SelectValue placeholder={t("dialog.selectPlaceholder")} />
											</SelectTrigger>
											<SelectContent>
												{selectedParameter.param.options &&
													Object.entries(selectedParameter.param.options).map(([value, label]) => (
														<SelectItem
															key={value}
															value={value}
														>
															{label}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>
								)}

								{selectedParameter.param.type === "switch" && (
									<div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-900">
										<div className="flex items-center justify-between mb-2">
											<Label
												htmlFor="param-switch"
												className="text-base font-medium dark:text-white"
											>
												{selectedParameter.param.description}
											</Label>
											<Switch
												id="param-switch"
												checked={editSwitchValue}
												onCheckedChange={setEditSwitchValue}
												className="data-[state=unchecked]:bg-zinc-700"
											/>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
											{editSwitchValue ? selectedParameter.param.options["1"] : selectedParameter.param.options["0"]}
										</p>
									</div>
								)}

								{selectedParameter.param.type === "bitfield" && (
									<div className="space-y-4">
										<div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-900">
											<div className="mb-4">
												<Label className="text-base font-medium dark:text-white">
													{t("parameterEdit.currentValue")}: 0x{editBitfieldValue.toString(16).toUpperCase().padStart(2, "0")}
												</Label>
											</div>

											{/* Individual Bits */}
											{selectedParameter.param.bits &&
												Object.entries(selectedParameter.param.bits).map(([bitNumber, bitConfig]) => {
													const bitNum = parseInt(bitNumber);
													const isSet = getBitValue(editBitfieldValue, bitNum);

													return (
														<div
															key={bitNumber}
															className="flex items-center justify-between mb-3 p-2 border rounded"
														>
															<div>
																<Label className="text-sm font-medium dark:text-white">
																	{t("parameterEdit.bit")} {bitNumber}: {bitConfig.description}
																</Label>
																<p className="text-xs text-gray-600 dark:text-gray-300">{isSet ? bitConfig.options["1"] : bitConfig.options["0"]}</p>
															</div>
															<Switch
																checked={isSet}
																onCheckedChange={(checked) => {
																	setEditBitfieldValue(setBitValue(editBitfieldValue, bitNum, checked));
																}}
																className="data-[state=unchecked]:bg-zinc-700"
															/>
														</div>
													);
												})}

											{/* Bit Ranges */}
											{selectedParameter.param.ranges &&
												Object.entries(selectedParameter.param.ranges).map(([rangeName, rangeConfig]) => {
													const currentRangeValue = getRangeValue(editBitfieldValue, rangeConfig.start_bit, rangeConfig.end_bit);

													return (
														<div
															key={rangeName}
															className="mb-4 p-3 border rounded"
														>
															<Label className="text-sm font-medium dark:text-white block mb-2">
																{rangeConfig.description} (bits {rangeConfig.start_bit}-{rangeConfig.end_bit})
															</Label>
															<div className="flex items-center gap-2">
																<input
																	type="number"
																	min={rangeConfig.min_value || 0}
																	max={rangeConfig.max_value || (1 << (rangeConfig.end_bit - rangeConfig.start_bit + 1)) - 1}
																	value={currentRangeValue}
																	onChange={(e) => {
																		const newRangeValue = parseInt(e.target.value, 10);
																		if (!isNaN(newRangeValue)) {
																			setEditBitfieldValue(setRangeValue(editBitfieldValue, rangeConfig.start_bit, rangeConfig.end_bit, newRangeValue));
																		}
																	}}
																	className="w-20 p-2 border rounded text-center"
																/>
																{rangeConfig.unit && <span className="text-sm text-gray-600 dark:text-gray-300">{rangeConfig.unit}</span>}
															</div>
															{(rangeConfig.min_value !== undefined || rangeConfig.max_value !== undefined) && (
																<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
																	Range: {rangeConfig.min_value || 0} - {rangeConfig.max_value || (1 << (rangeConfig.end_bit - rangeConfig.start_bit + 1)) - 1}
																</p>
															)}
														</div>
													);
												})}
										</div>
									</div>
								)}
							</div>

							<DrawerFooter className="flex-col justify-center w-full gap-4 mt-2">
								<Button
									onClick={handleSaveParameter}
									className="rounded-lg transition-colors py-5"
								>
									{t("common.saveChanges")}
								</Button>
								<DrawerClose asChild>
									<Button
										variant="outline"
										className="rounded-lg transition-colors py-5"
									>
										{t("common.cancel")}
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</div>
					</DrawerContent>
				</Drawer>
			)}
		</div>
	);
};

export default DeviceParameters;
