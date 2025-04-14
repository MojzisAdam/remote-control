import React, { useState, useEffect, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { ScrollText, Loader2 } from "lucide-react";
import { useDeviceParameterLogs } from "@/hooks/useDeviceParameterLogs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import DeviceNotFound from "@/components/deviceNotFound";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeading from "@/components/PageHeading";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import parametersDataEN from "@/jsons/parameters.json";
import parametersDataCZ from "@/jsons/parameters_cz.json";
import usePageTitle from "@/hooks/usePageTitle";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { cs, enUS } from "date-fns/locale";
import { format } from "date-fns";

interface ParameterOption {
	[key: string]: string;
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

type Parameter = IntParameter | FloatParameter | OptionsParameter | SwitchParameter;

const DeviceParameterLog = () => {
	const { id: deviceId } = useParams<{ id: string }>();

	const { logs, loading, fetchLogs } = useDeviceParameterLogs();
	const { toast } = useToast();

	const { i18n, t } = useTranslation(["parameterLog", "pagination"]);
	const selectedLocale = i18n.language === "en" ? enUS : cs;
	const parametersData = i18n.language === "cs" ? parametersDataCZ : parametersDataEN;

	const { setLastVisited } = useUserManagement();
	const { currentDevice, isLoading: initialLoading, notFound, loadDevice } = useDeviceContext();

	const [totalPages, setTotalPages] = useState<number>(0);
	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalRecords, setTotalRecords] = useState<number>(0);

	usePageTitle(t("parameterLog:pageTitle", { deviceId }));

	const [query, setQuery] = useState<{
		search: string;
		page: number;
		pageSize: string;
	}>({
		search: "",
		page: 1,
		pageSize: "10",
	});

	const [searchInput, setSearchInput] = useState("");
	const debouncedSearchTerm = useDebounce(searchInput, 500);

	const pageSizes = ["10", "25", "100"];

	useEffect(() => {
		setQuery((prev) => {
			if (prev.search === debouncedSearchTerm) {
				return prev;
			}
			return { ...prev, search: debouncedSearchTerm, page: 1 };
		});
	}, [debouncedSearchTerm]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return format(date, "dd/MM/yyyy HH:mm:ss", { locale: selectedLocale });
	};

	useEffect(() => {
		const fetchData = async () => {
			if (typeof deviceId === "string") {
				await loadDevice(deviceId);
				if (deviceId) {
					setLastVisited(deviceId);
				}
			}
		};
		fetchData();
	}, [deviceId]);

	useEffect(() => {
		if (!initialLoading && deviceId) {
			loadLogs();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	const loadLogs = async () => {
		if (typeof deviceId === "string") {
			const result = await fetchLogs(deviceId, {
				search: query.search,
				page: query.page,
				pageSize: Number(query.pageSize),
				sorting: "changed_at:desc",
			});
			if (result.success && result.data.meta) {
				setTotalPages(result.data.meta.last_page || 0);
				setFrom(result.data.meta.from || 0);
				setTo(result.data.meta.to || 0);
				setTotalRecords(result.data.meta.total || 0);
			} else {
				toast({ title: t("parameterLog:errorTitle"), description: t("parameterLog:errorDescription"), variant: "destructive" });
			}
		}
	};

	const handlePageSizeChange = (newPageSize: string) => {
		setQuery((prev) => ({
			...prev,
			pageSize: newPageSize,
			page: 1,
		}));
	};

	const handleNextPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page < totalPages ? prev.page + 1 : prev.page,
		}));
	};

	const handlePreviousPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page > 1 ? prev.page - 1 : prev.page,
		}));
	};

	const formatValue = (paramKey: string, value: string | undefined | null): ReactNode => {
		if (!value) return <span className="text-muted-foreground italic">{t("parameterLog:notSet")}</span>;

		const paramInfo = parametersData[paramKey as keyof typeof parametersData] as Parameter;

		if (!paramInfo) return value;

		switch (paramInfo.type) {
			case "int":
				return (
					<span>
						{value}
						{paramInfo.unit ? ` ${paramInfo.unit}` : ""}
					</span>
				);
			case "float":
				let numValue = Number(value);
				if (paramInfo.multiplied !== undefined) {
					numValue = numValue / paramInfo.multiplied;
				}
				return (
					<span>
						{numValue}
						{paramInfo.unit ? ` ${paramInfo.unit}` : ""}
					</span>
				);
			case "options":
			case "switch":
				return <span>{paramInfo.options?.[value] || value}</span>;
			default:
				return value;
		}
	};

	const getParameterDescription = (paramKey: string): string => {
		const paramInfo = parametersData[paramKey as keyof typeof parametersData] as Parameter;
		return paramInfo?.description || t("parameterLog:unknownParam");
	};

	if (notFound) {
		return <DeviceNotFound />;
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col">
				<PageHeading
					icon={ScrollText}
					heading={t("parameterLog:heading")}
					device={currentDevice}
					initialLoading={initialLoading}
				/>
				<p className="mt-4 text-sm text-muted-foreground">{t("parameterLog:disclaimer")}</p>
			</div>

			<div className="flex flex-col gap-4 mt-2">
				{/* Search and filters */}
				<div className="flex items-center gap-4 max-md:flex-col max-md:items-start">
					<div className="flex items-center gap-2">
						<Select
							value={query.pageSize}
							onValueChange={handlePageSizeChange}
						>
							<SelectTrigger className="w-28">
								<SelectValue placeholder="10" />
							</SelectTrigger>
							<SelectContent>
								{pageSizes.map((size) => (
									<SelectItem
										key={size}
										value={size}
									>
										{size} {t("pagination:rows")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<form className="flex w-full max-w-sm items-center space-x-2">
						<Input
							type="text"
							placeholder={t("parameterLog:searchPlaceholder")}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
					</form>
					{loading && !initialLoading ? <Loader2 className="animate-spin h-4 w-4 max-md:absolute max-md:bottom-6" /> : null}
				</div>

				{/* Logs table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.parameter")}</TableHead>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.description")}</TableHead>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.changedBy")}</TableHead>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.oldValue")}</TableHead>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.newValue")}</TableHead>
								<TableHead className="px-6 whitespace-nowrap">{t("parameterLog:table.changedAt")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{initialLoading ? (
								Array(parseInt(query.pageSize))
									.fill(0)
									.map((_, i) => (
										<TableRow key={i}>
											<TableCell colSpan={6}>
												<Skeleton className="h-6 w-full my-1 mx-1" />
											</TableCell>
										</TableRow>
									))
							) : logs.length > 0 ? (
								logs.map((log) => (
									<TableRow key={log.id}>
										<TableCell className="font-medium px-6 whitespace-nowrap py-4">{log.parameter}</TableCell>
										<TableCell className="px-6 whitespace-nowrap py-4">{getParameterDescription(log.parameter)}</TableCell>
										<TableCell className="px-6 whitespace-nowrap py-4">{log.email ? log.email : <Badge variant="outline">{t("parameterLog:system")}</Badge>}</TableCell>
										<TableCell className="px-6 whitespace-nowrap py-4">{formatValue(log.parameter, log.old_value)}</TableCell>
										<TableCell className="px-6 whitespace-nowrap py-4">{formatValue(log.parameter, log.new_value)}</TableCell>
										<TableCell className="px-6 whitespace-nowrap py-4">{formatDate(log.changed_at)}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center h-24"
									>
										{t("pagination:noResults")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Controls */}
				<div className="flex items-center justify-between space-x-2">
					<div className="flex-1 text-sm text-muted-foreground">
						<p>{t("pagination:showing", { from, to, total: totalRecords })}</p>
					</div>
					<div className="flex items-center justify-end space-x-2 py-4">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={query.page <= 1}
						>
							{t("pagination:previous")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={query.page >= totalPages}
						>
							{t("pagination:next")}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DeviceParameterLog;
