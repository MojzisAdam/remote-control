import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, Network, ArrowUpDown, Code, Info, MessageCircle, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface MqttTopic {
	name: string;
	subscribe?: string;
	command?: string;
	description?: string;
}

interface MqttTopicsEditorProps {
	topics: Record<string, any> | null;
	onChange: (topics: Record<string, any>) => void;
	className?: string;
}

export const MqttTopicsEditor: React.FC<MqttTopicsEditorProps> = ({ topics, onChange, className = "" }) => {
	const { t } = useTranslation("deviceTypes");
	const [topicsList, setTopicsList] = useState<MqttTopic[]>([]);
	const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
	const [showAllTopics, setShowAllTopics] = useState(false);

	// Convert topics object to array format for editing
	useEffect(() => {
		if (topics && typeof topics === "object") {
			const topicsArray = Object.entries(topics).map(([name, config]) => ({
				// Handle temporary keys for new topics
				name: name.startsWith("__temp_") ? "" : name,
				subscribe: config.subscribe || "",
				command: config.command || "",
				description: config.description || "",
			}));
			setTopicsList(topicsArray);
		} else {
			setTopicsList([]);
		}
	}, [topics]);

	// Convert array back to object format and notify parent
	const updateTopics = (newTopicsList: MqttTopic[]) => {
		setTopicsList(newTopicsList);
		const topicsObject = newTopicsList.reduce((acc, topic, index) => {
			// Only include topics with valid names in the final object, but use temp key for state management
			const hasValidName = topic.name.trim();
			const key = hasValidName ? topic.name.trim() : `__temp_${index}`;

			acc[key] = {
				...(topic.subscribe && { subscribe: topic.subscribe }),
				...(topic.command && { command: topic.command }),
				...(topic.description && { description: topic.description }),
			};
			return acc;
		}, {} as Record<string, any>);
		onChange(topicsObject);
	};

	const addTopic = () => {
		const newTopic: MqttTopic = {
			name: "",
			subscribe: "",
			command: "",
			description: "",
		};
		const updatedList = [newTopic, ...topicsList];

		// Auto-expand the new topic
		const newIndex = 0;
		setExpandedTopics((prev) => {
			// Shift existing indices by 1 and add the new item at index 0
			const shifted = new Set([...prev].map((index) => index + 1));
			shifted.add(newIndex);
			return shifted;
		});

		updateTopics(updatedList);
	};

	const removeTopic = (index: number) => {
		const newTopicsList = topicsList.filter((_, i) => i !== index);
		updateTopics(newTopicsList);
	};

	const updateTopic = (index: number, field: keyof MqttTopic, value: string) => {
		const newTopicsList = [...topicsList];
		newTopicsList[index] = { ...newTopicsList[index], [field]: value };
		updateTopics(newTopicsList);
	};

	// Helper functions for managing expanded states
	const toggleTopicExpanded = (index: number) => {
		const newExpanded = new Set(expandedTopics);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedTopics(newExpanded);
	};

	const toggleAllTopics = () => {
		if (showAllTopics) {
			setExpandedTopics(new Set());
			setShowAllTopics(false);
		} else {
			setExpandedTopics(new Set(topicsList.map((_, index) => index)));
			setShowAllTopics(true);
		}
	};

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
						<Network className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<Label className="text-lg font-semibold">{t("deviceTypes.mqttTopics")}</Label>
						<p className="text-sm text-muted-foreground mt-1">{t("deviceTypes.detailPage.mqttTopicsDescription")}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{topicsList.length > 0 && (
						<Button
							type="button"
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
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addTopic}
						className="flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						{t("deviceTypes.editors.mqttTopics.addTopic")}
					</Button>
				</div>
			</div>

			{topicsList.length > 0 && (
				<div className="mb-4 flex items-center gap-4 border-2 p-2 px-4 rounded-lg">
					<Info className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800 dark:text-green-200">{t("deviceTypes.editors.mqttTopics.editorHelper")}</AlertDescription>
				</div>
			)}

			<div className="space-y-6">
				{topicsList.map((topic, index) => {
					const isExpanded = expandedTopics.has(index);

					return (
						<Card
							key={index}
							className={`relative border-0 shadow-lg bg-white/80 dark:bg-zinc-950/90 backdrop-blur hover:shadow-xl transition-all duration-200 ${
								!topic.name.trim() ? "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20" : ""
							}`}
						>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div
										className="flex items-center gap-3 cursor-pointer flex-1"
										onClick={() => toggleTopicExpanded(index)}
									>
										<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
											<Network className="h-4 w-4 text-green-600 dark:text-green-400" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-base font-bold">{topic.name || t("deviceTypes.editors.mqttTopics.newTopic")}</CardTitle>
												{!topic.name.trim() && (
													<Badge
														variant="destructive"
														className="text-xs"
													>
														{t("deviceTypes.editors.required")}
													</Badge>
												)}
											</div>
											<Badge
												variant="outline"
												className="text-xs mt-1"
											>
												{t("deviceTypes.mqttTopics")}
											</Badge>
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
										onClick={() => removeTopic(index)}
										className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 ml-2"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							{isExpanded && (
								<CardContent className="space-y-6">
									{/* Topic Name */}
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Label
												htmlFor={`topic-name-${index}`}
												className="text-sm font-medium"
											>
												{t("deviceTypes.editors.mqttTopics.topicName")}
											</Label>
											<Badge
												variant="default"
												className="text-xs"
											>
												{t("deviceTypes.editors.required")}
											</Badge>
										</div>
										<Input
											id={`topic-name-${index}`}
											type="text"
											value={topic.name}
											onChange={(e) => updateTopic(index, "name", e.target.value)}
											placeholder={t("deviceTypes.editors.mqttTopics.placeholders.topicName")}
										/>
									</div>

									{/* Subscribe Pattern */}
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<ArrowUpDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											<Label
												htmlFor={`topic-subscribe-${index}`}
												className="text-sm font-medium"
											>
												{t("deviceTypes.editors.mqttTopics.subscribePattern")}
											</Label>
											<Badge
												variant="outline"
												className="text-xs"
											>
												{t("deviceTypes.editors.optional")}
											</Badge>
										</div>
										<div className="relative">
											<Input
												id={`topic-subscribe-${index}`}
												type="text"
												value={topic.subscribe}
												onChange={(e) => updateTopic(index, "subscribe", e.target.value)}
												placeholder={t("deviceTypes.editors.mqttTopics.placeholders.subscribePattern")}
												className="font-mono text-sm  border-blue-200 dark:border-blue-800 focus:border-blue-400"
											/>
										</div>
									</div>

									{/* Command Pattern */}
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
											<Label
												htmlFor={`topic-command-${index}`}
												className="text-sm font-medium"
											>
												{t("deviceTypes.editors.mqttTopics.commandPattern")}
											</Label>
											<Badge
												variant="outline"
												className="text-xs"
											>
												{t("deviceTypes.editors.optional")}
											</Badge>
										</div>
										<div className="relative">
											<Input
												id={`topic-command-${index}`}
												type="text"
												value={topic.command}
												onChange={(e) => updateTopic(index, "command", e.target.value)}
												placeholder={t("deviceTypes.editors.mqttTopics.placeholders.commandPattern")}
												className="font-mono text-sm  border-purple-200 dark:border-purple-800 focus:border-purple-400"
											/>
										</div>
									</div>

									{/* Description */}
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
											<Label
												htmlFor={`topic-description-${index}`}
												className="text-sm font-medium"
											>
												{t("deviceTypes.editors.mqttTopics.description")}
											</Label>
											<Badge
												variant="outline"
												className="text-xs"
											>
												{t("deviceTypes.editors.optional")}
											</Badge>
										</div>
										<Textarea
											id={`topic-description-${index}`}
											value={topic.description}
											onChange={(e) => updateTopic(index, "description", e.target.value)}
											placeholder={t("deviceTypes.editors.mqttTopics.placeholders.description")}
											className="min-h-[80px] border-slate-200 dark:border-slate-700"
											rows={3}
										/>
									</div>
								</CardContent>
							)}
						</Card>
					);
				})}

				{topicsList.length === 0 && (
					<Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/5">
						<CardContent className="text-center py-12">
							<div className="flex flex-col items-center gap-4">
								<div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
									<Network className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold">{t("deviceTypes.editors.mqttTopics.noTopics")}</h3>
									<p className="text-sm text-muted-foreground max-w-md">{t("deviceTypes.editors.mqttTopics.noTopicsDescription")}</p>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={addTopic}
									className="bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/50"
								>
									<Plus className="h-4 w-4 mr-2" />
									{t("deviceTypes.editors.mqttTopics.placeholders.addFirstTopic")}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
