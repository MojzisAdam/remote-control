import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

import { Plus, Search, MoreHorizontal, Edit, Trash2, Pause, Eye, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { useAutomations } from "@/hooks/useAutomations";
import { Automation } from "@/api/automation/model";
import routes from "@/constants/routes";
import usePageTitle from "@/hooks/usePageTitle";
import withAuthorization from "@/middleware/withAuthorization";

const AutomationList: React.FC = () => {
	const { t } = useTranslation("automations");
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");

	usePageTitle(t("page-title-list"));

	const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [automationToDelete, setAutomationToDelete] = useState<Automation | null>(null);

	const {
		loading,
		automations,
		error,
		pagination,
		stats: automationStats,
		statsLoading,
		toggleLoading,
		fetchAutomations,
		fetchAutomationStats,
		deleteExistingAutomation,
		toggleAutomationStatus,
	} = useAutomations();

	// Fetch automations and stats on component mount
	useEffect(() => {
		fetchAutomations();
		fetchAutomationStats();
	}, [fetchAutomations, fetchAutomationStats]);

	// Refetch data when search or filter changes
	useEffect(() => {
		const params = {
			search: searchQuery.trim() || undefined,
			enabled: filterEnabled !== null ? filterEnabled : undefined,
		};
		fetchAutomations(params);
		fetchAutomationStats({ search: searchQuery.trim() || undefined });
	}, [searchQuery, filterEnabled, fetchAutomations, fetchAutomationStats]);

	// Handle automation toggle
	const handleToggleAutomation = async (automation: Automation) => {
		const result = await toggleAutomationStatus(automation.id);
		if (result.success) {
			const action = automation.enabled ? t("disabled") : t("enabled");
			toast({
				title: t("success"),
				description: t("list.toggleSuccess", { action }),
			});
		}
	};

	// Handle automation deletion
	const handleDeleteAutomation = async () => {
		if (!automationToDelete) return;

		const result = await deleteExistingAutomation(automationToDelete.id);
		if (result.success) {
			toast({
				title: t("success"),
				description: t("list.deleteSuccess"),
			});
		}

		setDeleteDialogOpen(false);
		setAutomationToDelete(null);
	};

	// Confirm deletion
	const confirmDeleteAutomation = (automation: Automation) => {
		setAutomationToDelete(automation);
		setDeleteDialogOpen(true);
	};

	// Navigate to builder
	const handleCreateNew = () => {
		navigate(routes.automationBuilder);
	};

	const handleEditAutomation = (automationId: number) => {
		navigate(routes.automationBuilderEdit(automationId));
	};

	const handleViewLogs = (automationId: number) => {
		navigate(routes.automationLogs(automationId));
	};

	// Handle pagination
	const handlePageChange = (page: number) => {
		const params = {
			search: searchQuery.trim() || undefined,
			enabled: filterEnabled !== null ? filterEnabled : undefined,
			page,
			per_page: pagination.per_page,
		};
		fetchAutomations(params);
	};

	const getStatusBadge = (automation: Automation) => {
		if (automation.is_draft) {
			return <Badge variant="outline">{t("draft")}</Badge>;
		}

		if (!automation.enabled) {
			return <Badge variant="secondary">{t("disabled")}</Badge>;
		}

		// Check if the last execution failed (only the most recent log)
		const lastLog = automation.recent_logs?.[0];
		if (lastLog && lastLog.status === "failed") {
			return <Badge variant="destructive">{t("error")}</Badge>;
		}

		return (
			<Badge
				variant="default"
				className="bg-green-500 hover:bg-green-600"
			>
				{t("active")}
			</Badge>
		);
	};

	const formatLastRun = (automation: Automation) => {
		if (!automation.stats || automation.stats.last_execution === undefined || automation.stats.last_execution === null) {
			return t("neverRun");
		}

		const date = new Date(automation.stats.last_execution);
		return date.toLocaleString();
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center gap-8">
				<div>
					<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{t("list.title")}</h1>
				</div>
				<Button
					onClick={handleCreateNew}
					className="gap-2"
				>
					<Plus className="w-4 h-4" />
					{t("list.createNew")}
				</Button>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("statistics.total")}</p>
								<p className="text-2xl font-bold">{automationStats.total}</p>
							</div>
							<Activity className="w-8 h-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("statistics.active")}</p>
								<p className="text-2xl font-bold text-green-600">{automationStats.enabled}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-green-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("statistics.disabled")}</p>
								<p className="text-2xl font-bold text-gray-600">{automationStats.disabled}</p>
							</div>
							<Pause className="w-8 h-8 text-gray-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("statistics.withErrors")}</p>
								<p className="text-2xl font-bold text-red-600">{automationStats.withErrors}</p>
							</div>
							<AlertCircle className="w-8 h-8 text-red-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder={t("list.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								variant={filterEnabled === null ? "default" : "outline"}
								size="sm"
								onClick={() => setFilterEnabled(null)}
							>
								{t("list.filterAll")}
							</Button>
							<Button
								variant={filterEnabled === true ? "default" : "outline"}
								size="sm"
								onClick={() => setFilterEnabled(true)}
							>
								{t("list.filterActive")}
							</Button>
							<Button
								variant={filterEnabled === false ? "default" : "outline"}
								size="sm"
								onClick={() => setFilterEnabled(false)}
							>
								{t("list.filterDisabled")}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error State */}
			{error && (
				<Card className="border-red-200">
					<CardContent className="p-4">
						<div className="flex items-center gap-2 text-red-600">
							<AlertCircle className="w-4 h-4" />
							<span>{error}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Automation List */}
			<div className="grid gap-4">
				{loading ? (
					<Card>
						<CardContent className="p-8 text-center">
							<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
							<p className="mt-4 text-muted-foreground">{t("loading")}</p>
						</CardContent>
					</Card>
				) : automations.length === 0 ? (
					<Card>
						<CardContent className="p-8 text-center">
							<Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium mb-2">{t("list.noAutomations")}</h3>
							<p className="text-muted-foreground mb-4">{searchQuery || filterEnabled !== null ? t("list.noMatches") : t("list.noAutomationsDescription")}</p>
							{!searchQuery && filterEnabled === null && (
								<Button
									onClick={handleCreateNew}
									className="gap-2"
								>
									<Plus className="w-4 h-4" />
									{t("list.createNew")}
								</Button>
							)}
						</CardContent>
					</Card>
				) : (
					automations.map((automation: Automation) => (
						<Card
							key={automation.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardContent className="p-6">
								<div className="flex items-center justify-between gap-8 max-lg:flex-col max-lg:gap-12 max-lg:items-start">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-lg font-medium">{automation.name}</h3>
											{getStatusBadge(automation)}
										</div>

										{automation.description && <p className="text-muted-foreground mb-3 text-sm">{automation.description}</p>}

										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Activity className="w-4 h-4" />
												<span>
													{automation.triggers?.length || 0} {t("triggers")}, {automation.conditions?.length || 0} {t("conditions")}, {automation.actions?.length || 0}{" "}
													{t("actions")}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>
													{t("lastRun")}: {formatLastRun(automation)}
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
											<Switch
												checked={automation.enabled}
												onCheckedChange={() => handleToggleAutomation(automation)}
												disabled={toggleLoading[automation.id] || automation.is_draft}
											/>
											<span className="text-xs">{automation.enabled ? t("list.enabledToggle") : t("list.disabledToggle")}</span>
											{toggleLoading[automation.id] && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>}
										</div>

										<Button
											onClick={() => handleEditAutomation(automation.id)}
											variant={"secondary"}
											size="sm"
										>
											<Edit className="w-4 h-4 mr-2" />
											{t("edit")}
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													size="sm"
												>
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleViewLogs(automation.id)}>
													<Eye className="w-4 h-4 mr-2" />
													{t("list.viewLogs")}
												</DropdownMenuItem>
												<Separator />
												<DropdownMenuItem
													onClick={() => confirmDeleteAutomation(automation)}
													className="text-red-600"
												>
													<Trash2 className="w-4 h-4 mr-2" />
													{t("delete")}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{/* Pagination */}
			{pagination.last_page > 1 && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								{t("list.showing")} {pagination.from || 0} {t("list.to")} {pagination.to || 0} {t("list.of")} {pagination.total} {t("list.results")}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.current_page - 1)}
									disabled={pagination.current_page === 1}
								>
									{t("list.previous")}
								</Button>
								{Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
									const startPage = Math.max(1, pagination.current_page - 2);
									const page = startPage + i;
									if (page > pagination.last_page) return null;
									return (
										<Button
											key={page}
											variant={pagination.current_page === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(page)}
										>
											{page}
										</Button>
									);
								})}
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.current_page + 1)}
									disabled={pagination.current_page === pagination.last_page}
								>
									{t("list.next")}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("delete")} {t("title")}
						</AlertDialogTitle>
						<AlertDialogDescription>{t("list.confirmDelete", { name: automationToDelete?.name })}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAutomation}
							className="bg-red-600 hover:bg-red-700"
						>
							{t("delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default withAuthorization(AutomationList, "manage-automations");
