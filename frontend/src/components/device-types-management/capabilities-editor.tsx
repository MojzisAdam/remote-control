import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, Hash, Target, Type, Settings, Info, Globe, Zap, Play, AlertTriangle, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface CapabilityValue {
	label: Record<string, string>;
	value: number | string;
}

export interface Capability {
	id: string;
	type: "number" | "boolean" | "enum";
	role: ("action" | "trigger" | "condition")[];
	register?: number;
	default_value?: any;
	unit?: string;
	min_value?: number;
	max_value?: number;
	increment_value?: number;
	description: Record<string, string>;
	values?: CapabilityValue[];
	labels?: Record<string, Record<string, string>>;
}

interface CapabilitiesEditorProps {
	capabilities: Record<string, any>;
	onChange: (capabilities: Record<string, any>) => void;
	className?: string;
}

export const CapabilitiesEditor: React.FC<CapabilitiesEditorProps> = ({ capabilities, onChange, className = "" }) => {
	const { t, i18n } = useTranslation("deviceTypes");
	const [capabilitiesList, setCapabilitiesList] = useState<Capability[]>([]);
	const [activeLanguage, setActiveLanguage] = useState<string>(i18n.language);
	const [expandedCapabilities, setExpandedCapabilities] = useState<Set<number>>(new Set());
	const [showAllCapabilities, setShowAllCapabilities] = useState(false);

	const supportedLanguages = [
		{ code: "en", name: "English" },
		{ code: "cs", name: "Čeština" },
	];

	useEffect(() => {
		if (capabilities && typeof capabilities === "object" && !Array.isArray(capabilities)) {
			const capabilitiesArray = Object.entries(capabilities).map(([id, config]) => {
				// Handle values localization for enum types
				let values: CapabilityValue[] = [];
				if (config.values && Array.isArray(config.values)) {
					values = config.values.map((value: any) => ({
						label: typeof value.label === "object" && value.label !== null ? value.label : { [i18n.language]: value.label || "", en: value.label || "" },
						value: value.value !== undefined ? value.value : value,
					}));
				}

				// Handle labels localization
				let labels: Record<string, Record<string, string>> = {};
				if (config.labels && typeof config.labels === "object") {
					for (const [key, value] of Object.entries(config.labels)) {
						labels[key] = typeof value === "object" && value !== null ? (value as Record<string, string>) : { [i18n.language]: String(value), en: String(value) };
					}
				}

				// Handle temporary keys for new capabilities
				const actualId = id.startsWith("__temp_") ? "" : id;

				return {
					id: actualId,
					type: config.type || "number",
					role: config.role || [],
					register: config.register,
					default_value: config.default_value,
					unit: config.unit || "",
					min_value: config.min_value,
					max_value: config.max_value,
					increment_value: config.increment_value,
					description: config.description,
					values,
					labels,
				};
			});
			setCapabilitiesList(capabilitiesArray);
		} else {
			setCapabilitiesList([]);
		}
	}, [capabilities, i18n.language]);

	// Convert array back to object format and notify parent
	const updateCapabilities = (newCapabilitiesList: Capability[]) => {
		setCapabilitiesList(newCapabilitiesList);
		const capabilitiesObject = newCapabilitiesList.reduce((acc, capability, index) => {
			// Only include capabilities with valid IDs in the final object, but use temp key for state management
			const hasValidId = capability.id.trim();
			const key = hasValidId ? capability.id.trim() : `__temp_${index}`;

			const capabilityConfig: any = {
				type: capability.type,
				role: capability.role,
				description: capability.description,
			};

			// Add optional fields only if they have values
			if (capability.register !== undefined) capabilityConfig.register = capability.register;
			if (capability.default_value !== undefined) capabilityConfig.default_value = capability.default_value;
			if (capability.unit) capabilityConfig.unit = capability.unit;
			if (capability.min_value !== undefined) capabilityConfig.min_value = capability.min_value;
			if (capability.max_value !== undefined) capabilityConfig.max_value = capability.max_value;
			if (capability.increment_value !== undefined) capabilityConfig.increment_value = capability.increment_value;
			if (capability.values && capability.values.length > 0) capabilityConfig.values = capability.values;
			if (capability.labels && Object.keys(capability.labels).length > 0) capabilityConfig.labels = capability.labels;

			// Always add to accumulator for state management, but mark temp keys
			acc[key] = capabilityConfig;
			return acc;
		}, {} as Record<string, any>);
		onChange(capabilitiesObject);
	};

	const addCapability = () => {
		const newCapability: Capability = {
			id: "",
			type: "number",
			role: [],
			description: { en: "", cs: "" },
			unit: "",
			values: [],
			labels: {},
		};
		const updatedList = [newCapability, ...capabilitiesList];

		// Auto-expand the new capability
		const newIndex = 0;
		setExpandedCapabilities((prev) => {
			// Shift existing indices by 1 and add the new item at index 0
			const shifted = new Set([...prev].map((index) => index + 1));
			shifted.add(newIndex);
			return shifted;
		});

		updateCapabilities(updatedList);
	};

	const removeCapability = (index: number) => {
		const newCapabilitiesList = capabilitiesList.filter((_, i) => i !== index);
		updateCapabilities(newCapabilitiesList);
	};

	const updateCapability = (index: number, field: keyof Capability, value: any) => {
		const newCapabilitiesList = [...capabilitiesList];
		newCapabilitiesList[index] = { ...newCapabilitiesList[index], [field]: value };
		updateCapabilities(newCapabilitiesList);
	};

	const updateLocalizedDescription = (index: number, language: string, value: string) => {
		const capability = capabilitiesList[index];
		const newDescription = { ...capability.description, [language]: value };
		updateCapability(index, "description", newDescription);
	};

	const updateCapabilityRole = (index: number, role: string, checked: boolean) => {
		const capability = capabilitiesList[index];
		const newRoles = checked ? [...capability.role, role as "action" | "trigger" | "condition"] : capability.role.filter((r) => r !== role);
		updateCapability(index, "role", newRoles);
	};

	const addValue = (index: number) => {
		const capability = capabilitiesList[index];
		const newValues = [
			...(capability.values || []),
			{
				label: { en: "", cs: "" },
				value: "",
			},
		];
		updateCapability(index, "values", newValues);
	};

	const removeValue = (capabilityIndex: number, valueIndex: number) => {
		const capability = capabilitiesList[capabilityIndex];
		const newValues = (capability.values || []).filter((_, i) => i !== valueIndex);
		updateCapability(capabilityIndex, "values", newValues);
	};

	const updateValue = (capabilityIndex: number, valueIndex: number, field: "label" | "value", language: string, value: string) => {
		const capability = capabilitiesList[capabilityIndex];
		const newValues = [...(capability.values || [])];

		if (field === "label") {
			newValues[valueIndex] = {
				...newValues[valueIndex],
				label: { ...newValues[valueIndex].label, [language]: value },
			};
		} else {
			newValues[valueIndex] = {
				...newValues[valueIndex],
				value: isNaN(Number(value)) ? value : Number(value),
			};
		}
		updateCapability(capabilityIndex, "values", newValues);
	};

	const addLabel = (index: number) => {
		const capability = capabilitiesList[index];
		const newLabels = {
			...capability.labels,
			"": { en: "", cs: "" },
		};
		updateCapability(index, "labels", newLabels);
	};

	const removeLabel = (capabilityIndex: number, key: string) => {
		const capability = capabilitiesList[capabilityIndex];
		const newLabels = { ...capability.labels };
		delete newLabels[key];
		updateCapability(capabilityIndex, "labels", newLabels);
	};

	const updateLabel = (capabilityIndex: number, oldKey: string, newKey: string, language: string, value: string) => {
		const capability = capabilitiesList[capabilityIndex];
		const newLabels = { ...capability.labels };

		if (oldKey !== newKey) {
			if (newLabels[oldKey]) {
				newLabels[newKey] = newLabels[oldKey];
				delete newLabels[oldKey];
			}
		}

		if (!newLabels[newKey]) {
			newLabels[newKey] = { en: "", cs: "" };
		}

		newLabels[newKey] = { ...newLabels[newKey], [language]: value };
		updateCapability(capabilityIndex, "labels", newLabels);
	};

	// Helper functions for managing expanded states
	const toggleCapabilityExpanded = (index: number) => {
		const newExpanded = new Set(expandedCapabilities);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedCapabilities(newExpanded);
	};

	const toggleAllCapabilities = () => {
		if (showAllCapabilities) {
			setExpandedCapabilities(new Set());
			setShowAllCapabilities(false);
		} else {
			setExpandedCapabilities(new Set(capabilitiesList.map((_, index) => index)));
			setShowAllCapabilities(true);
		}
	};

	// Helper function to get capability type icon
	const getCapabilityTypeIcon = (type: string) => {
		switch (type) {
			case "number":
				return <Hash className="h-4 w-4" />;
			case "boolean":
				return <Target className="h-4 w-4" />;
			case "enum":
				return <Type className="h-4 w-4" />;
			default:
				return <Settings className="h-4 w-4" />;
		}
	};

	// Helper function to get role icon and color
	const getRoleConfig = (role: string) => {
		switch (role) {
			case "action":
				return { icon: <Play className="h-3 w-3" />, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
			case "trigger":
				return { icon: <Zap className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
			case "condition":
				return { icon: <AlertTriangle className="h-3 w-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
			default:
				return { icon: <Settings className="h-3 w-3" />, color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" };
		}
	};

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<Label className="text-lg font-semibold">{t("deviceTypes.columns.capabilities")}</Label>
						<p className="text-sm text-muted-foreground mt-1">{t("deviceTypes.detailPage.capabilitiesDescription")}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{capabilitiesList.length > 0 && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={toggleAllCapabilities}
							className="flex items-center gap-2"
						>
							{showAllCapabilities ? (
								<>
									<EyeOff className="h-4 w-4" />
									{t("deviceTypes.actions.collapseAll")}
								</>
							) : (
								<>
									<Eye className="h-4 w-4" />
									{t("deviceTypes.actions.expandAll")}
								</>
							)}
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addCapability}
						className="flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						{t("deviceTypes.editors.capabilities.addCapability")}
					</Button>
				</div>
			</div>

			{capabilitiesList.length > 0 && (
				<div className="mb-4 flex items-center gap-4 border-2 p-2 px-4 rounded-lg">
					<Info className="h-4 w-4 text-blue-600" />
					<AlertDescription className="text-blue-800 dark:text-blue-200">{t("deviceTypes.editors.capabilities.editorHelper")}</AlertDescription>
				</div>
			)}

			<div className="space-y-6">
				{capabilitiesList.map((capability, index) => {
					const isExpanded = expandedCapabilities.has(index);

					return (
						<Card
							key={index}
							className={`relative border-0 shadow-lg bg-white/80 dark:bg-zinc-950/90 backdrop-blur hover:shadow-xl transition-all duration-200 ${
								!capability.id.trim() ? "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20" : ""
							}`}
						>
							<CardHeader className="">
								<div className="flex items-center justify-between">
									<div
										className="flex items-center gap-3 cursor-pointer flex-1"
										onClick={() => toggleCapabilityExpanded(index)}
									>
										<div className="p-2 bg-blue-100 dark:bg-zinc-900 rounded-lg">{getCapabilityTypeIcon(capability.type)}</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-base font-bold">{capability.id || t("deviceTypes.editors.capabilities.newCapability")}</CardTitle>
												{!capability.id.trim() && (
													<Badge
														variant="destructive"
														className="text-xs"
													>
														{t("deviceTypes.editors.required")}
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-2 mt-1">
												<Badge
													variant="outline"
													className="text-xs flex items-center gap-1"
												>
													{getCapabilityTypeIcon(capability.type)}
													{t(`deviceTypes.editors.types.${capability.type}`)}
												</Badge>
												{capability.role?.map((role: string) => {
													const config = getRoleConfig(role);
													return (
														<Badge
															key={role}
															className={`flex items-center gap-1 text-xs ${config.color}`}
														>
															{config.icon}
															{t(`deviceTypes.editors.roleTypes.${role}`)}
														</Badge>
													);
												})}
											</div>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="p-1 h-8 w-8"
										>
											{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
										</Button>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeCapability(index)}
										className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 ml-2"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							{isExpanded && (
								<CardContent className="space-y-6">
									{/* Basic Info */}
									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<Label
													htmlFor={`capability-id-${index}`}
													className="text-sm font-medium"
												>
													{t("deviceTypes.editors.capabilities.capabilityId")}
												</Label>
												<Badge
													variant="default"
													className="text-xs"
												>
													{t("deviceTypes.editors.required")}
												</Badge>
											</div>
											<Input
												id={`capability-id-${index}`}
												type="text"
												value={capability.id}
												onChange={(e) => updateCapability(index, "id", e.target.value)}
												placeholder={t("deviceTypes.editors.capabilities.placeholders.capabilityId")}
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor={`capability-type-${index}`}
												className="text-sm font-medium"
											>
												{t("deviceTypes.editors.capabilities.type")}
											</Label>
											<Select
												value={capability.type}
												onValueChange={(value) => updateCapability(index, "type", value)}
											>
												<SelectTrigger className="">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="number">
														<div className="flex items-center gap-2">
															<Hash className="h-4 w-4" />
															{t("deviceTypes.editors.types.number")}
														</div>
													</SelectItem>
													<SelectItem value="boolean">
														<div className="flex items-center gap-2">
															<Target className="h-4 w-4" />
															{t("deviceTypes.editors.types.boolean")}
														</div>
													</SelectItem>
													<SelectItem value="enum">
														<div className="flex items-center gap-2">
															<Type className="h-4 w-4" />
															{t("deviceTypes.editors.types.enum")}
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Localized Description */}
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Label className="text-sm font-medium">{t("deviceTypes.editors.capabilities.description")}</Label>
											<Badge
												variant="outline"
												className="text-xs"
											>
												{t("deviceTypes.editors.optional")}
											</Badge>
										</div>
										<Tabs
											value={activeLanguage}
											onValueChange={setActiveLanguage}
											className="w-full"
										>
											<div className="flex items-center justify-between mb-3">
												<TabsList className="grid w-auto grid-cols-2">
													{supportedLanguages.map((lang) => (
														<TabsTrigger
															key={lang.code}
															value={lang.code}
															className="flex items-center gap-1 text-xs"
														>
															<Globe className="h-3 w-3" />
															{lang.name}
														</TabsTrigger>
													))}
												</TabsList>
											</div>
											{supportedLanguages.map((lang) => (
												<TabsContent
													key={lang.code}
													value={lang.code}
													className="mt-3"
												>
													<Textarea
														value={capability.description[lang.code] || ""}
														onChange={(e) => updateLocalizedDescription(index, lang.code, e.target.value)}
														placeholder={t("deviceTypes.editors.capabilities.placeholders.description")}
														rows={3}
													/>
												</TabsContent>
											))}
										</Tabs>
									</div>

									{/* Role Selection */}
									<div className="space-y-3">
										<Label className="text-sm font-medium">{t("deviceTypes.editors.capabilities.rolesLabel")}</Label>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											{["action", "trigger", "condition"].map((role) => {
												const config = getRoleConfig(role);
												return (
													<div
														key={role}
														className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
															capability.role.includes(role as any) ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
														}`}
													>
														<Checkbox
															id={`capability-role-${index}-${role}`}
															checked={capability.role.includes(role as any)}
															onCheckedChange={(checked) => updateCapabilityRole(index, role, !!checked)}
														/>
														<Label
															htmlFor={`capability-role-${index}-${role}`}
															className="flex items-center gap-2 text-sm font-medium cursor-pointer"
														>
															{config.icon}
															{t(`deviceTypes.editors.capabilities.roleTypes.${role}`)}
														</Label>
													</div>
												);
											})}
										</div>
									</div>

									{/* Type-specific fields */}
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label
												htmlFor={`capability-register-${index}`}
												className="text-sm"
											>
												{t("deviceTypes.editors.capabilities.register")}
											</Label>
											<Input
												id={`capability-register-${index}`}
												type="number"
												value={capability.register || ""}
												onChange={(e) => updateCapability(index, "register", e.target.value ? Number(e.target.value) : undefined)}
												placeholder={t("deviceTypes.editors.capabilities.placeholders.register")}
												className="mt-1"
											/>
										</div>

										<div>
											<Label
												htmlFor={`capability-unit-${index}`}
												className="text-sm"
											>
												{t("deviceTypes.editors.capabilities.unit")}
											</Label>
											<Input
												id={`capability-unit-${index}`}
												type="text"
												value={capability.unit}
												onChange={(e) => updateCapability(index, "unit", e.target.value)}
												placeholder={t("deviceTypes.editors.capabilities.placeholders.unit")}
												className="mt-1"
											/>
										</div>
									</div>

									{/* Number-specific fields */}
									{capability.type === "number" && (
										<>
											<div className="grid grid-cols-3 gap-4">
												<div>
													<Label
														htmlFor={`capability-min-${index}`}
														className="text-sm"
													>
														{t("deviceTypes.editors.capabilities.minValue")}
													</Label>
													<Input
														id={`capability-min-${index}`}
														type="number"
														value={capability.min_value || ""}
														onChange={(e) => updateCapability(index, "min_value", e.target.value ? Number(e.target.value) : undefined)}
														className="mt-1"
													/>
												</div>

												<div>
													<Label
														htmlFor={`capability-max-${index}`}
														className="text-sm"
													>
														{t("deviceTypes.editors.capabilities.maxValue")}
													</Label>
													<Input
														id={`capability-max-${index}`}
														type="number"
														value={capability.max_value || ""}
														onChange={(e) => updateCapability(index, "max_value", e.target.value ? Number(e.target.value) : undefined)}
														className="mt-1"
													/>
												</div>

												<div>
													<Label
														htmlFor={`capability-increment-${index}`}
														className="text-sm"
													>
														{t("deviceTypes.editors.capabilities.incrementValue")}
													</Label>
													<Input
														id={`capability-increment-${index}`}
														type="number"
														value={capability.increment_value || ""}
														onChange={(e) => updateCapability(index, "increment_value", e.target.value ? Number(e.target.value) : undefined)}
														className="mt-1"
													/>
												</div>
											</div>

											<div>
												<Label
													htmlFor={`capability-default-${index}`}
													className="text-sm"
												>
													{t("deviceTypes.editors.capabilities.defaultValue")}
												</Label>
												<Input
													id={`capability-default-${index}`}
													type="number"
													value={capability.default_value || ""}
													onChange={(e) => updateCapability(index, "default_value", e.target.value ? Number(e.target.value) : undefined)}
													className="mt-1"
												/>
											</div>
										</>
									)}

									{/* Boolean-specific fields */}
									{capability.type === "boolean" && (
										<div>
											<Label
												htmlFor={`capability-default-bool-${index}`}
												className="text-sm"
											>
												{t("deviceTypes.editors.capabilities.defaultValue")}
											</Label>
											<Select
												value={capability.default_value === undefined ? "undefined" : String(capability.default_value)}
												onValueChange={(value) => updateCapability(index, "default_value", value === "undefined" ? undefined : value === "true")}
											>
												<SelectTrigger className="mt-1">
													<SelectValue placeholder={t("deviceTypes.editors.capabilities.selectDefault")} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="undefined">{t("deviceTypes.editors.capabilities.noDefault")}</SelectItem>
													<SelectItem value="true">{t("deviceTypes.editors.capabilities.true")}</SelectItem>
													<SelectItem value="false">{t("deviceTypes.editors.capabilities.false")}</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}

									{/* Enum-specific fields */}
									{capability.type === "enum" && (
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Label className="text-sm font-medium">{t("deviceTypes.editors.capabilities.enumValues")}</Label>
													<Badge
														variant="outline"
														className="text-xs"
													>
														<Type className="h-3 w-3 mr-1" />
														{t("deviceTypes.editors.capabilities.enumType")}
													</Badge>
												</div>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => addValue(index)}
													className="flex items-center gap-2"
												>
													<Plus className="h-4 w-4" />
													{t("deviceTypes.editors.capabilities.addValue")}
												</Button>
											</div>
											<div className="space-y-3">
												{(capability.values || []).map((value, valueIndex) => (
													<Card
														key={valueIndex}
														className="border border-purple-200 dark:border-purple-800 bg-zinc-50/30 dark:bg-zinc-950/20 shadow-sm"
													>
														<CardContent className="p-4 space-y-4">
															<div className="flex items-center gap-3">
																<div className="flex-1">
																	<Label className="text-xs text-muted-foreground mb-1 block">{t("deviceTypes.editors.capabilities.valueValue")}</Label>
																	<Input
																		placeholder="0, 1, 2..."
																		value={String(value.value)}
																		onChange={(e) => updateValue(index, valueIndex, "value", "", e.target.value)}
																		className="w-full font-mono border-purple-200 dark:border-purple-700"
																	/>
																</div>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	onClick={() => removeValue(index, valueIndex)}
																	className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 mt-5"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
															<div>
																<Label className="text-xs text-muted-foreground mb-2 block">{t("deviceTypes.editors.capabilities.valueLabels")}</Label>
																<Tabs
																	value={activeLanguage}
																	onValueChange={setActiveLanguage}
																>
																	<TabsList className="grid w-full grid-cols-2 mb-3">
																		{supportedLanguages.map((lang) => (
																			<TabsTrigger
																				key={lang.code}
																				value={lang.code}
																				className="flex items-center gap-1 text-xs"
																			>
																				<Globe className="h-3 w-3" />
																				{lang.name}
																			</TabsTrigger>
																		))}
																	</TabsList>
																	{supportedLanguages.map((lang) => (
																		<TabsContent
																			key={lang.code}
																			value={lang.code}
																		>
																			<Input
																				placeholder={t("deviceTypes.editors.capabilities.placeholders.valueLabel")}
																				value={value.label[lang.code] || ""}
																				onChange={(e) => updateValue(index, valueIndex, "label", lang.code, e.target.value)}
																				className="border-purple-200 dark:border-purple-700"
																			/>
																		</TabsContent>
																	))}
																</Tabs>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
											{(!capability.values || capability.values.length === 0) && (
												<Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/10">
													<CardContent className="text-center py-8">
														<div className="flex flex-col items-center gap-3">
															<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
																<Type className="h-6 w-6 text-purple-600 dark:text-purple-400" />
															</div>
															<div>
																<p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t("deviceTypes.editors.capabilities.noEnumValues")}</p>
																<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{t("deviceTypes.editors.capabilities.noEnumValuesDescription")}</p>
															</div>
														</div>
													</CardContent>
												</Card>
											)}
										</div>
									)}

									{/* Labels (for boolean) */}
									{capability.type === "boolean" && (
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Label className="text-sm font-medium">{t("deviceTypes.editors.capabilities.labels")}</Label>
													<Badge
														variant="outline"
														className="text-xs"
													>
														<Target className="h-3 w-3 mr-1" />
														{t("deviceTypes.editors.capabilities.booleanLabels")}
													</Badge>
												</div>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => addLabel(index)}
													className="flex items-center gap-2 "
												>
													<Plus className="h-4 w-4" />
													{t("deviceTypes.editors.capabilities.addLabel")}
												</Button>
											</div>
											<div className="space-y-3">
												{Object.entries(capability.labels || {}).map(([key, labelObj]) => (
													<Card
														key={key}
														className="border border-green-200 dark:border-green-800 bg-zinc-50/30 dark:bg-zinc-950/20 shadow-sm"
													>
														<CardContent className="p-4 space-y-4">
															<div>
																<Label className="text-xs text-muted-foreground mb-1 block">{t("deviceTypes.editors.capabilities.labelKey")}</Label>
																<Input
																	placeholder="true, false, on, off..."
																	value={key}
																	onChange={(e) => {
																		const oldKey = key;
																		const newKey = e.target.value;
																		if (labelObj.en !== undefined) {
																			updateLabel(index, oldKey, newKey, "en", labelObj.en);
																		}
																		if (labelObj.cs !== undefined) {
																			updateLabel(index, oldKey, newKey, "cs", labelObj.cs);
																		}
																	}}
																	className="font-mono border-green-200 dark:border-green-700"
																/>
															</div>
															<div>
																<Label className="text-xs text-muted-foreground mb-2 block">{t("deviceTypes.editors.capabilities.labelTranslations")}</Label>
																<Tabs
																	value={activeLanguage}
																	onValueChange={setActiveLanguage}
																>
																	<TabsList className="grid w-full grid-cols-2 mb-3">
																		{supportedLanguages.map((lang) => (
																			<TabsTrigger
																				key={lang.code}
																				value={lang.code}
																				className="flex items-center gap-1 text-xs"
																			>
																				<Globe className="h-3 w-3" />
																				{lang.name}
																			</TabsTrigger>
																		))}
																	</TabsList>
																	{supportedLanguages.map((lang) => (
																		<TabsContent
																			key={lang.code}
																			value={lang.code}
																		>
																			<div className="flex gap-2">
																				<Input
																					placeholder={t("deviceTypes.editors.capabilities.placeholders.labelValue")}
																					value={labelObj[lang.code] || ""}
																					onChange={(e) => updateLabel(index, key, key, lang.code, e.target.value)}
																					className="flex-1 border-green-200 dark:border-green-700"
																				/>
																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					onClick={() => removeLabel(index, key)}
																					className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
																				>
																					<Trash2 className="h-4 w-4" />
																				</Button>
																			</div>
																		</TabsContent>
																	))}
																</Tabs>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
											{(!capability.labels || Object.keys(capability.labels).length === 0) && (
												<Card className="border-2 border-dashed border-green-200 dark:border-green-800 bg-green-50/20 dark:bg-green-950/10">
													<CardContent className="text-center py-8">
														<div className="flex flex-col items-center gap-3">
															<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
																<Target className="h-6 w-6 text-green-600 dark:text-green-400" />
															</div>
															<div>
																<p className="text-sm font-medium text-green-800 dark:text-green-200">{t("deviceTypes.editors.capabilities.noBooleanLabels")}</p>
																<p className="text-xs text-green-600 dark:text-green-400 mt-1">{t("deviceTypes.editors.capabilities.noBooleanLabelsDescription")}</p>
															</div>
														</div>
													</CardContent>
												</Card>
											)}
										</div>
									)}
								</CardContent>
							)}
						</Card>
					);
				})}

				{capabilitiesList.length === 0 && (
					<Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/5">
						<CardContent className="text-center py-12">
							<div className="flex flex-col items-center gap-4">
								<div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold">{t("deviceTypes.editors.capabilities.noCapabilities")}</h3>
									<p className="text-sm text-muted-foreground max-w-md">{t("deviceTypes.editors.capabilities.noCapabilitiesDescription")}</p>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={addCapability}
									className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50"
								>
									<Plus className="h-4 w-4 mr-2" />
									{t("deviceTypes.editors.capabilities.addFirstCapability")}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
