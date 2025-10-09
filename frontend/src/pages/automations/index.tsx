import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

import { Plus, Search, MoreHorizontal, Edit, Trash2, Play, Pause, Eye, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { useAutomations } from "@/hooks/useAutomations";
import { Automation } from "@/api/automation/model";
import routes from "@/constants/routes";

const AutomationList: React.FC = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
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
			toast({
				title: "Success",
				description: `Automation ${automation.enabled ? "disabled" : "enabled"} successfully`,
			});
		}
	};

	// Handle automation deletion
	const handleDeleteAutomation = async () => {
		if (!automationToDelete) return;

		const result = await deleteExistingAutomation(automationToDelete.id);
		if (result.success) {
			toast({
				title: "Success",
				description: "Automation deleted successfully",
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
			return <Badge variant="outline">Draft</Badge>;
		}

		if (!automation.enabled) {
			return <Badge variant="secondary">Disabled</Badge>;
		}

		// Check if the last execution failed (only the most recent log)
		const lastLog = automation.recent_logs?.[0];
		if (lastLog && lastLog.status === "failed") {
			return <Badge variant="destructive">Error</Badge>;
		}

		return (
			<Badge
				variant="default"
				className="bg-green-500 hover:bg-green-600"
			>
				Active
			</Badge>
		);
	};

	const formatLastRun = (automation: Automation) => {
		if (!automation.stats || automation.stats.last_execution === undefined || automation.stats.last_execution === null) {
			return "Never run";
		}

		const date = new Date(automation.stats.last_execution);
		return date.toLocaleString();
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Automations</h1>
					<p className="text-muted-foreground">Manage your automation workflows and triggers</p>
				</div>
				<Button
					onClick={handleCreateNew}
					className="gap-2"
				>
					<Plus className="w-4 h-4" />
					Create Automation
				</Button>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total</p>
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
								<p className="text-sm text-muted-foreground">Active</p>
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
								<p className="text-sm text-muted-foreground">Disabled</p>
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
								<p className="text-sm text-muted-foreground">With Errors</p>
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
								placeholder="Search automations..."
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
								All
							</Button>
							<Button
								variant={filterEnabled === true ? "default" : "outline"}
								size="sm"
								onClick={() => setFilterEnabled(true)}
							>
								Active
							</Button>
							<Button
								variant={filterEnabled === false ? "default" : "outline"}
								size="sm"
								onClick={() => setFilterEnabled(false)}
							>
								Disabled
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
							<p className="mt-4 text-muted-foreground">Loading automations...</p>
						</CardContent>
					</Card>
				) : automations.length === 0 ? (
					<Card>
						<CardContent className="p-8 text-center">
							<Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium mb-2">No automations found</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery || filterEnabled !== null ? "No automations match your current filters" : "Get started by creating your first automation"}
							</p>
							{!searchQuery && filterEnabled === null && (
								<Button
									onClick={handleCreateNew}
									className="gap-2"
								>
									<Plus className="w-4 h-4" />
									Create Automation
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
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-lg font-medium">{automation.name}</h3>
											{getStatusBadge(automation)}
										</div>

										{automation.description && <p className="text-muted-foreground mb-3">{automation.description}</p>}

										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Activity className="w-4 h-4" />
												<span>
													{automation.triggers?.length || 0} triggers, {automation.conditions?.length || 0} conditions, {automation.actions?.length || 0} actions
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>Last run: {formatLastRun(automation)}</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-8">
										<div className="flex items-center gap-2">
											<Switch
												checked={automation.enabled}
												onCheckedChange={() => handleToggleAutomation(automation)}
												disabled={toggleLoading[automation.id] || automation.is_draft}
											/>
											{toggleLoading[automation.id] && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>}
										</div>

										<Button
											onClick={() => handleEditAutomation(automation.id)}
											variant={"outline"}
											size="sm"
										>
											<Edit className="w-4 h-4 mr-2" />
											Edit
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="secondary"
													size="sm"
												>
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleViewLogs(automation.id)}>
													<Eye className="w-4 h-4 mr-2" />
													View Logs
												</DropdownMenuItem>
												<Separator />
												<DropdownMenuItem
													onClick={() => confirmDeleteAutomation(automation)}
													className="text-red-600"
												>
													<Trash2 className="w-4 h-4 mr-2" />
													Delete
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
								Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.current_page - 1)}
									disabled={pagination.current_page === 1}
								>
									Previous
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
									Next
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
						<AlertDialogTitle>Delete Automation</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{automationToDelete?.name}"? This action cannot be undone and will permanently remove the automation and all its execution logs.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAutomation}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AutomationList;
