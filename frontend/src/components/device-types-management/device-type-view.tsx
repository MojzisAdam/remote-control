import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Zap, Settings, Hash, Type, MessageCircle, Database, ArrowUpDown, Target, Info, Play, AlertTriangle, Gauge, Code, Network, Globe, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { DeviceType } from "@/api/devices/model";

interface DeviceTypeViewProps {
	deviceType: DeviceType;
}

export function DeviceTypeView({ deviceType }: DeviceTypeViewProps) {
	const { t, i18n } = useTranslation("deviceTypes");
	const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());
	const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
	const [showAllCapabilities, setShowAllCapabilities] = useState(false);
	const [showAllTopics, setShowAllTopics] = useState(false);

	const getStringValue = (value: any): string => {
		return String(value || "");
	};

	// Get capability description
	const getCapabilityDescription = (capability: any): string => {
		if (capability.description) {
			return getStringValue(capability.description);
		}
		return "";
	};

	// Get localized enum values
	const getEnumValues = (capability: any): Array<{ label: string; value: any }> => {
		if (!capability.values || !Array.isArray(capability.values)) return [];

		return capability.values.map((item: any) => {
			let label = "";
			let value = item;

			if (typeof item === "object" && item !== null) {
				if (item.label && typeof item.label === "object") {
					// Localized label object
					label = item.label[i18n.language] || item.label.en || "";
				} else if (item.label) {
					// Simple string label
					label = getStringValue(item.label);
				}
				value = item.value !== undefined ? item.value : item;
			} else {
				// Simple primitive value
				label = getStringValue(item);
				value = item;
			}

			return { label, value };
		});
	};

	// Get localized labels for boolean types
	const getLabels = (capability: any): Record<string, string> => {
		if (!capability.labels) return {};

		if (Array.isArray(capability.labels)) {
			const labels: Record<string, string> = {};
			capability.labels.forEach((item: any, index: number) => {
				if (typeof item === "object" && item !== null) {
					// Localized label object
					const label = item[i18n.language] || item.en || "";
					labels[index.toString()] = label;
				} else {
					// Simple string label
					labels[index.toString()] = getStringValue(item);
				}
			});
			return labels;
		}

		if (typeof capability.labels === "object") {
			const labels: Record<string, string> = {};
			for (const [key, value] of Object.entries(capability.labels)) {
				if (typeof value === "object" && value !== null) {
					// Localized label object
					labels[key] = (value as any)[i18n.language] || (value as any).en || "";
				} else {
					// Simple string label
					labels[key] = getStringValue(value);
				}
			}
			return labels;
		}

		return {};
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

	// Helper function to get role icon
	const getRoleIcon = (role: string) => {
		switch (role) {
			case "action":
				return <Play className="h-3 w-3" />;
			case "trigger":
				return <Zap className="h-3 w-3" />;
			case "condition":
				return <AlertTriangle className="h-3 w-3" />;
			default:
				return <Settings className="h-3 w-3" />;
		}
	};

	// Helper function to get role color
	const getRoleColor = (role: string) => {
		switch (role) {
			case "action":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
			case "trigger":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
			case "condition":
				return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
		}
	};

	const capabilities = deviceType.capabilities || {};
	const mqttTopics = deviceType.mqtt_topics || {};
	const capabilityEntries = Object.entries(capabilities);
	const mqttTopicEntries = Object.entries(mqttTopics);

	// Helper functions for managing expanded states
	const toggleCapabilityExpanded = (capabilityId: string) => {
		const newExpanded = new Set(expandedCapabilities);
		if (newExpanded.has(capabilityId)) {
			newExpanded.delete(capabilityId);
		} else {
			newExpanded.add(capabilityId);
		}
		setExpandedCapabilities(newExpanded);
	};

	const toggleTopicExpanded = (topicId: string) => {
		const newExpanded = new Set(expandedTopics);
		if (newExpanded.has(topicId)) {
			newExpanded.delete(topicId);
		} else {
			newExpanded.add(topicId);
		}
		setExpandedTopics(newExpanded);
	};

	const toggleAllCapabilities = () => {
		if (showAllCapabilities) {
			setExpandedCapabilities(new Set());
			setShowAllCapabilities(false);
		} else {
			setExpandedCapabilities(new Set(capabilityEntries.map(([id]) => id)));
			setShowAllCapabilities(true);
		}
	};

	const toggleAllTopics = () => {
		if (showAllTopics) {
			setExpandedTopics(new Set());
			setShowAllTopics(false);
		} else {
			setExpandedTopics(new Set(mqttTopicEntries.map(([id]) => id)));
			setShowAllTopics(true);
		}
	};

	return (
		<div className="space-y-8 max-w-6xl mx-auto">
			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
					<CardContent className="p-4 px-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t("deviceTypes.totalCapabilities")}</p>
								<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{capabilityEntries.length}</p>
							</div>
							<div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
								<Zap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
					<CardContent className="p-4 px-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 dark:text-green-400">MQTT Topics</p>
								<p className="text-3xl font-bold text-green-900 dark:text-green-100">{mqttTopicEntries.length}</p>
							</div>
							<div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
								<Network className="h-6 w-6 text-green-600 dark:text-green-300" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Capabilities */}
			<Card className="border-0 shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
				<CardHeader className="pb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
								<Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-2xl flex items-center gap-3">
									{t("deviceTypes.columns.capabilities")}
									<Badge
										variant="secondary"
										className="text-sm px-3 py-1"
									>
										{capabilityEntries.length} {capabilityEntries.length === 1 ? t("deviceTypes.capability") : t("deviceTypes.capabilities")}
									</Badge>
								</CardTitle>
								<CardDescription className="text-base mt-2">{t("deviceTypes.detailPage.capabilitiesDescription")}</CardDescription>
							</div>
						</div>
						{capabilityEntries.length > 0 && (
							<Button
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
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{capabilityEntries.length > 0 ? (
						<div className="grid gap-6">
							{capabilityEntries.map(([capabilityId, capability]) => {
								const isExpanded = expandedCapabilities.has(capabilityId);

								return (
									<Card
										key={capabilityId}
										className="border border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200"
									>
										<CardContent className="p-6">
											{/* Header */}
											<div
												className="flex items-start justify-between cursor-pointer"
												onClick={() => toggleCapabilityExpanded(capabilityId)}
											>
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-blue-100 dark:bg-zinc-700/30 rounded-lg">{getCapabilityTypeIcon(capability.type)}</div>
													<div>
														<h4 className="font-bold font-mono text-lg text-blue-900 dark:text-blue-100">{capabilityId}</h4>
														<div className="flex items-center gap-2 mt-1">
															<Badge
																variant="outline"
																className="flex items-center gap-1 text-xs font-medium"
															>
																{getCapabilityTypeIcon(capability.type)}
																{t(`deviceTypes.editors.types.${capability.type}`)}
															</Badge>
															{capability.register && (
																<Badge
																	variant="secondary"
																	className="text-xs font-mono"
																>
																	<Database className="h-3 w-3 mr-1" />
																	{capability.register}
																</Badge>
															)}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="flex flex-wrap gap-2">
														{capability.role?.map((role: string) => (
															<Badge
																key={role}
																className={`flex items-center gap-1 text-xs font-medium ${getRoleColor(role)}`}
															>
																{getRoleIcon(role)}
																{t(`deviceTypes.editors.roleTypes.${role}`)}
															</Badge>
														))}
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="p-1 h-8 w-8"
													>
														{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
													</Button>
												</div>
											</div>

											{/* Collapsible Content */}
											{isExpanded && (
												<div className="mt-4 space-y-6">
													{/* Description */}
													{getCapabilityDescription(capability) && (
														<div className="flex items-center gap-4 border-2 p-2 px-4 rounded-lg">
															<MessageCircle className="h-4 w-4" />
															<AlertDescription className="">{getCapabilityDescription(capability)}</AlertDescription>
														</div>
													)}

													{/* Properties Grid */}
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
														{capability.unit && (
															<div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
																<Gauge className="h-4 w-4 text-gray-600 dark:text-gray-400" />
																<div>
																	<p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t("deviceTypes.editors.propertyLabels.unit")}</p>
																	<p className="font-semibold">{capability.unit}</p>
																</div>
															</div>
														)}

														{capability.default_value !== undefined && (
															<div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
																<Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
																<div>
																	<p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t("deviceTypes.editors.propertyLabels.default")}</p>
																	<p className="font-semibold font-mono">{String(capability.default_value)}</p>
																</div>
															</div>
														)}

														{capability.type === "number" && capability.min_value !== undefined && (
															<div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
																<ArrowUpDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
																<div>
																	<p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t("deviceTypes.editors.propertyLabels.range")}</p>
																	<p className="font-semibold font-mono">
																		{capability.min_value} - {capability.max_value || "∞"}
																	</p>
																</div>
															</div>
														)}

														{capability.type === "number" && capability.increment_value !== undefined && (
															<div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
																<ArrowUpDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
																<div>
																	<p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t("deviceTypes.editors.propertyLabels.step")}</p>
																	<p className="font-semibold font-mono">{capability.increment_value}</p>
																</div>
															</div>
														)}
													</div>

													{/* Enum Values */}
													{capability.type === "enum" && getEnumValues(capability).length > 0 && (
														<div className="space-y-3">
															<h5 className="font-semibold text-sm flex items-center gap-2">
																<Type className="h-4 w-4" />
																{t("deviceTypes.editors.enumValues")}
															</h5>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
																{getEnumValues(capability).map((enumValue, index) => (
																	<div
																		key={index}
																		className="flex items-center justify-between p-3 bg-slate-100 dark:bg-zinc-900 rounded-lg"
																	>
																		<span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{enumValue.value}</span>
																		<span className="text-sm text-slate-600 dark:text-slate-400">{enumValue.label}</span>
																	</div>
																))}
															</div>
														</div>
													)}

													{/* Labels */}
													{Object.keys(getLabels(capability)).length > 0 && (
														<div className="space-y-3 mt-4 pt-4 border-t border-border">
															<h5 className="font-semibold text-sm flex items-center gap-2">
																<Globe className="h-4 w-4" />
																{t("deviceTypes.editors.labels")}
															</h5>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
																{Object.entries(getLabels(capability)).map(([key, label]) => (
																	<div
																		key={key}
																		className="flex items-center justify-between p-3 bg-slate-100 dark:bg-zinc-900 rounded-lg"
																	>
																		<span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{key}</span>
																		<span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<Alert className="text-center py-12">
							<Info className="h-5 w-5 mx-auto mb-4 text-muted-foreground" />
							<AlertDescription className="text-base">{t("deviceTypes.noCapabilities")}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* MQTT Topics */}
			<Card className="border-0 shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
				<CardHeader className="pb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
								<Network className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-2xl flex items-center gap-3">
									{t("deviceTypes.mqttTopics")}
									<Badge
										variant="secondary"
										className="text-sm px-3 py-1"
									>
										{mqttTopicEntries.length} {t("deviceTypes.detailPage.topics")}
									</Badge>
								</CardTitle>
								<CardDescription className="text-base mt-2">{t("deviceTypes.detailPage.mqttTopicsDescription")}</CardDescription>
							</div>
						</div>
						{mqttTopicEntries.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={toggleAllTopics}
								className="flex items-center gap-2"
							>
								{showAllTopics ? (
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
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{mqttTopicEntries.length > 0 ? (
						<div className="grid gap-6">
							{mqttTopicEntries.map(([topicName, topic]) => {
								const isExpanded = expandedTopics.has(topicName);

								return (
									<Card
										key={topicName}
										className="border border-l-4 border-l-green-500 hover:shadow-md transition-all duration-200 "
									>
										<CardContent className="p-6">
											{/* Header */}
											<div
												className="flex items-center justify-between mb-4 cursor-pointer"
												onClick={() => toggleTopicExpanded(topicName)}
											>
												<div className="flex items-center gap-3">
													<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
														<Network className="h-5 w-5 text-green-600 dark:text-green-400" />
													</div>
													<div>
														<h4 className="font-bold text-lg text-green-900 dark:text-green-100">{topicName}</h4>
														<Badge
															variant="outline"
															className="text-xs mt-1"
														>
															{t("deviceTypes.mqttTopics")}
														</Badge>
													</div>
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="p-1 h-8 w-8"
												>
													{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
												</Button>
											</div>

											{/* Collapsible Content */}
											{isExpanded && (
												<div className="mt-4 space-y-4">
													{/* Description */}
													{topic.description && (
														<div className="flex items-center gap-4 border-2 p-2 px-4 rounded-lg">
															<MessageCircle className="h-4 w-4 text-green-600" />
															<AlertDescription className="text-green-800 dark:text-green-200">{topic.description}</AlertDescription>
														</div>
													)}

													{/* Topic Patterns */}
													<div className="space-y-4">
														{topic.subscribe && (
															<div className="p-4 bg-zinc-50 dark:bg-zinc-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
																<div className="flex items-center gap-2 mb-2">
																	<div className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">
																		<ArrowUpDown className="h-3 w-3 text-blue-600 dark:text-blue-300" />
																	</div>
																	<span className="font-semibold text-sm text-blue-800 dark:text-blue-200">
																		{t("deviceTypes.editors.mqttTopics.subscribePattern")}
																	</span>
																</div>
																<code className="block w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-mono text-sm text-blue-900 dark:text-blue-100 break-all">
																	{topic.subscribe}
																</code>
															</div>
														)}

														{topic.command && (
															<div className="p-4 bg-zinc-50 dark:bg-zinc-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
																<div className="flex items-center gap-2 mb-2">
																	<div className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">
																		<Code className="h-3 w-3 text-purple-600 dark:text-purple-300" />
																	</div>
																	<span className="font-semibold text-sm text-purple-800 dark:text-purple-200">
																		{t("deviceTypes.editors.mqttTopics.commandPattern")}
																	</span>
																</div>
																<code className="block w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-mono text-sm text-purple-900 dark:text-purple-100 break-all">
																	{topic.command}
																</code>
															</div>
														)}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<Alert className="text-center py-12">
							<Info className="h-5 w-5 mx-auto mb-4 text-muted-foreground" />
							<AlertDescription className="text-base">{t("deviceTypes.noMqttTopics")}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
