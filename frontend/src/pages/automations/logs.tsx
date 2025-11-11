import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, CheckCircle, XCircle, AlertTriangle, Clock, Search, RefreshCw, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import withAuthorization from "@/middleware/withAuthorization";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationLog, AutomationLogsResponse } from "@/api/automation/model";
import routes from "@/constants/routes";
import { format } from "date-fns";
import usePageTitle from "@/hooks/usePageTitle";

interface AutomationLogsParams extends Record<string, string | undefined> {
	automationId?: string;
}

const AutomationLogs: React.FC = () => {
	const { t } = useTranslation("automations");

	usePageTitle(t("page-title-logs"));

	// Extract automationId from URL parameters
	const { automationId: automationIdParam } = useParams<AutomationLogsParams>();
	const automationId = automationIdParam ? parseInt(automationIdParam, 10) : undefined;

	const { currentAutomation, fetchAutomation, fetchAutomationLogs, fetchAutomationLogsStats, loading } = useAutomations();

	const [logs, setLogs] = useState<AutomationLog[]>([]);
	const [logsLoading, setLogsLoading] = useState(false);
	const [automationNotFound, setAutomationNotFound] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "skipped" | "partial" | "warning">("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalRecords, setTotalRecords] = useState(0);
	const [pageSize, setPageSize] = useState("25");
	const [from, setFrom] = useState(0);
	const [to, setTo] = useState(0);
	const [totalStats, setTotalStats] = useState({
		total: 0,
		successful: 0,
		failed: 0,
		skipped: 0,
		partial: 0,
		warning: 0,
	});
	const [filteredStats, setFilteredStats] = useState({
		total: 0,
		successful: 0,
		failed: 0,
		skipped: 0,
		partial: 0,
		warning: 0,
	});

	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	// Load automation and initial logs
	useEffect(() => {
		if (automationId) {
			loadAutomationAndLogs();
		}
	}, [automationId]);

	// Handle search and filter changes
	useEffect(() => {
		if (automationId && currentAutomation) {
			setCurrentPage(1);
			loadLogs();
			loadLogsStats();
		}
	}, [debouncedSearchQuery, statusFilter, pageSize]);

	// Handle page changes
	useEffect(() => {
		if (automationId && currentAutomation) {
			loadLogs();
		}
	}, [currentPage]);

	const loadAutomationAndLogs = async () => {
		if (!automationId) return;

		try {
			setAutomationNotFound(false);

			// Load automation details
			const automationResult = await fetchAutomation(automationId);

			if (!automationResult.success) {
				setAutomationNotFound(true);
				return;
			}

			// Load logs and stats
			await loadLogs();
			await loadLogsStats();
		} catch (error) {
			console.error("Error loading automation:", error);
			setAutomationNotFound(true);
		}
	};

	const loadLogs = async () => {
		if (!automationId) return;

		setLogsLoading(true);

		try {
			const params = {
				page: currentPage,
				per_page: parseInt(pageSize),
				...(statusFilter !== "all" && { status: statusFilter }),
				...(debouncedSearchQuery && { search: debouncedSearchQuery }),
			};

			const result = await fetchAutomationLogs(automationId, params);

			if (result.success && result.data) {
				const response = result.data as AutomationLogsResponse;
				setLogs(response.data || []);
				if (response.meta) {
					setTotalPages(response.meta.last_page || 1);
					setTotalRecords(response.meta.total || 0);
					setFrom(response.meta.from || 0);
					setTo(response.meta.to || 0);
				}
			} else {
				toast({
					title: t("error"),
					description: t("logs.loadingError"),
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error loading logs:", error);
			toast({
				title: t("error"),
				description: t("logs.unexpectedError"),
				variant: "destructive",
			});
		} finally {
			setLogsLoading(false);
		}
	};

	const loadLogsStats = async () => {
		if (!automationId) return;

		try {
			const params = {
				...(statusFilter !== "all" && { status: statusFilter }),
				...(debouncedSearchQuery && { search: debouncedSearchQuery }),
			};

			const result = await fetchAutomationLogsStats(automationId, params);

			if (result.success && result.data) {
				const response = result.data as {
					total_stats: typeof totalStats;
					filtered_stats: typeof filteredStats;
				};
				setTotalStats(response.total_stats);
				setFilteredStats(response.filtered_stats);
			} else {
				toast({
					title: t("error"),
					description: t("logs.loadingStats"),
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error loading logs stats:", error);
			toast({
				title: t("error"),
				description: t("logs.unexpectedError"),
				variant: "destructive",
			});
		}
	};

	const handleRefresh = () => {
		loadLogs();
		loadLogsStats();
	};

	const handlePageSizeChange = (newSize: string) => {
		setPageSize(newSize);
		setCurrentPage(1);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
		} catch {
			return dateString;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success":
				return (
					<Badge
						variant="default"
						className="bg-green-500 hover:bg-green-600"
					>
						<CheckCircle className="w-3 h-3 mr-1" />
						{t("status.success")}
					</Badge>
				);
			case "failed":
				return (
					<Badge variant="destructive">
						<XCircle className="w-3 h-3 mr-1" />
						{t("status.failed")}
					</Badge>
				);
			case "skipped":
				return (
					<Badge variant="secondary">
						<Clock className="w-3 h-3 mr-1" />
						{t("status.skipped")}
					</Badge>
				);
			case "partial":
				return (
					<Badge
						variant="outline"
						className="border-yellow-500 text-yellow-700 bg-yellow-50"
					>
						<AlertTriangle className="w-3 h-3 mr-1" />
						{t("status.partial")}
					</Badge>
				);
			case "warning":
				return (
					<Badge
						variant="outline"
						className="border-orange-500 text-orange-700 bg-orange-50"
					>
						<AlertTriangle className="w-3 h-3 mr-1" />
						{t("status.warning")}
					</Badge>
				);
			default:
				return (
					<Badge variant="secondary">
						<AlertTriangle className="w-3 h-3 mr-1" />
						{t("status.unknown")}
					</Badge>
				);
		}
	};

	// Calculate success rate based on total stats (all logs, not filtered)
	const successRate = totalStats.total > 0 ? Math.round((totalStats.successful / totalStats.total) * 100) : 0;

	// Show loading skeleton while fetching automation
	if (loading && !currentAutomation) {
		return (
			<div className="mx-auto space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<div>
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-96" />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{Array(4)
						.fill(0)
						.map((_, i) => (
							<Card key={i}>
								<CardContent className="p-4">
									<Skeleton className="h-16 w-full" />
								</CardContent>
							</Card>
						))}
				</div>
			</div>
		);
	}

	// Show not found if automation doesn't exist
	if (automationNotFound || !currentAutomation) {
		return (
			<div className="mx-auto">
				<div className="text-center py-12">
					<AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-2">{t("logs.automationNotFound")}</h2>
					<p className="text-muted-foreground mb-6">{t("logs.automationNotFoundDescription")}</p>
					<Button asChild>
						<Link to={routes.automations}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							{t("logs.backToAutomations")}
						</Link>
					</Button>
				</div>
			</div>
		);
	}
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col space-y-4">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<Calendar className="w-6 h-6 text-primary" />
							<div>
								<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">{t("logs.title")}</h1>
							</div>
						</div>
						<div className="flex gap-2 items-center flex-row">
							<Badge variant={currentAutomation.enabled ? "default" : "secondary"}>{currentAutomation.enabled ? t("active") : t("disabled")}</Badge>
							{currentAutomation.is_draft && <Badge variant="outline">{t("draft")}</Badge>}
						</div>
						<p className="text-lg text-muted-foreground mt-2">{currentAutomation.name}</p>
						{currentAutomation.description && <p className="text-muted-foreground mt-2 text-sm">{currentAutomation.description}</p>}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							asChild
						>
							<Link to={routes.automations}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("logs.list")}
							</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							asChild
						>
							<Link to={routes.automationBuilderEdit(currentAutomation.id)}>
								<Edit className="w-4 h-4 mr-2" />
								{t("logs.edit")}
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.totalAll")}</p>
								<p className="text-2xl font-bold">{totalStats.total}</p>
							</div>
							<Clock className="w-6 h-6 text-blue-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.successful")}</p>
								<p className="text-2xl font-bold text-green-600">
									{filteredStats.successful}
									{filteredStats.total !== totalStats.total && <span className="text-sm text-muted-foreground ml-1">/ {totalStats.successful}</span>}
								</p>
							</div>
							<CheckCircle className="w-6 h-6 text-green-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.failed")}</p>
								<p className="text-2xl font-bold text-red-600">
									{filteredStats.failed}
									{filteredStats.total !== totalStats.total && <span className="text-sm text-muted-foreground ml-1">/ {totalStats.failed}</span>}
								</p>
							</div>
							<XCircle className="w-6 h-6 text-red-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.skipped")}</p>
								<p className="text-2xl font-bold text-gray-600">
									{filteredStats.skipped}
									{filteredStats.total !== totalStats.total && <span className="text-sm text-muted-foreground ml-1">/ {totalStats.skipped}</span>}
								</p>
							</div>
							<Clock className="w-6 h-6 text-gray-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.partial")}</p>
								<p className="text-2xl font-bold text-yellow-600">
									{filteredStats.partial}
									{filteredStats.total !== totalStats.total && <span className="text-sm text-muted-foreground ml-1">/ {totalStats.partial}</span>}
								</p>
							</div>
							<AlertTriangle className="w-6 h-6 text-yellow-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("logs.successRate")}</p>
								<p className="text-2xl font-bold">{successRate}%</p>
							</div>
							<div className="w-6 h-6 flex items-center justify-center">
								<div className="text-xl">{successRate >= 90 ? "🎯" : successRate >= 70 ? "⚡" : "⚠️"}</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col xl:flex-row gap-4 xl:items-center">
						<div className="flex items-center gap-2">
							<Select
								value={pageSize}
								onValueChange={handlePageSizeChange}
							>
								<SelectTrigger className="w-28">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10 {t("list.rows")}</SelectItem>
									<SelectItem value="25">25 {t("list.rows")}</SelectItem>
									<SelectItem value="50">50 {t("list.rows")}</SelectItem>
									<SelectItem value="100">100 {t("list.rows")}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder={t("logs.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<div className="flex gap-2 flex-wrap">
							<Button
								variant={statusFilter === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("all")}
							>
								{t("logs.filterAll")}
							</Button>
							<Button
								variant={statusFilter === "success" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("success")}
							>
								{t("logs.filterSuccess")}
							</Button>
							<Button
								variant={statusFilter === "failed" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("failed")}
							>
								{t("logs.filterFailed")}
							</Button>
							<Button
								variant={statusFilter === "skipped" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("skipped")}
							>
								{t("logs.filterSkipped")}
							</Button>
							<Button
								variant={statusFilter === "partial" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("partial")}
							>
								{t("logs.filterPartial")}
							</Button>
							<Button
								variant={statusFilter === "warning" ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter("warning")}
							>
								{t("logs.filterWarning")}
							</Button>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={logsLoading}
							className="gap-2"
						>
							<RefreshCw className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`} />
							{t("logs.refresh")}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Logs Table */}
			<Card>
				<CardHeader>
					<CardTitle>{t("logs.executionHistory")}</CardTitle>
					<CardDescription>{t("logs.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[120px]">{t("logs.status")}</TableHead>
									<TableHead>{t("logs.executedAt")}</TableHead>
									<TableHead>{t("logs.duration")}</TableHead>
									<TableHead>{t("logs.details")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logsLoading ? (
									Array(parseInt(pageSize))
										.fill(0)
										.map((_, i) => (
											<TableRow key={i}>
												<TableCell colSpan={4}>
													<Skeleton className="h-6 w-full my-1" />
												</TableCell>
											</TableRow>
										))
								) : logs.length > 0 ? (
									logs.map((log) => (
										<TableRow key={log.id}>
											<TableCell>{getStatusBadge(log.status)}</TableCell>
											<TableCell>{formatDate(log.executed_at)}</TableCell>
											<TableCell>{log.execution_time || <span className="text-muted-foreground">-</span>}</TableCell>
											<TableCell>
												{log.details ? (
													<ScrollArea className="max-h-20 w-full">
														<div className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">{log.details}</div>
													</ScrollArea>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center py-8"
										>
											<div className="flex flex-col items-center gap-2">
												<Calendar className="w-8 h-8 text-muted-foreground" />
												<p className="text-muted-foreground">{searchQuery || statusFilter !== "all" ? t("logs.noMatches") : t("logs.noLogs")}</p>
												{!searchQuery && statusFilter === "all" && <p className="text-sm text-muted-foreground">{t("logs.noLogsDescription")}</p>}
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalRecords > 0 && (
						<>
							<Separator className="my-4" />
							<div className="flex items-center justify-between max-sm:flex-col max-sm:gap-4">
								<div className="text-sm text-muted-foreground">
									{t("logs.showing")} {from} {t("logs.to")} {to} {t("logs.of")} {totalRecords} {t("logs.results")}
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handlePreviousPage}
										disabled={currentPage <= 1 || logsLoading}
									>
										{t("logs.previous")}
									</Button>
									<span className="text-sm text-muted-foreground">
										{t("logs.page")} {currentPage} {t("logs.of")} {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={handleNextPage}
										disabled={currentPage >= totalPages || logsLoading}
									>
										{t("logs.next")}
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default withAuthorization(AutomationLogs, "manage-automations");
