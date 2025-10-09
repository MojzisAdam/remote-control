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
import usePageTitle from "@/hooks/usePageTitle";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useDeviceContext } from "@/provider/DeviceProvider";
import { cs, enUS } from "date-fns/locale";
import { format } from "date-fns";
import { isDaitsuDevice } from "@/utils/deviceTypeUtils";
import { isCzech, isEnglish } from "@/utils/syncLang";

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

const DeviceParameterLog = () => {
	const { id: deviceId } = useParams<{ id: string }>();

	const { logs, loading, fetchLogs } = useDeviceParameterLogs();
	const { toast } = useToast();

	const { i18n, t } = useTranslation(["parameterLog", "pagination"]);
	const selectedLocale = i18n.language === "en" ? enUS : cs;

	const { setLastVisited } = useUserManagement();
	const { currentDevice, isLoading: initialLoading, notFound, loadDevice } = useDeviceContext();

	// State for dynamically loaded parameters data
	const [parametersData, setParametersData] = useState<Record<string, any>>({});
	const [parametersLoading, setParametersLoading] = useState(true);
	const [parametersReady, setParametersReady] = useState(false);

	// Dynamically load parameter data based on device type and language
	useEffect(() => {
		const loadParametersData = async () => {
			if (!currentDevice) {
				setParametersReady(false);
				return;
			}

			setParametersLoading(true);
			setParametersReady(false);
			try {
				let parameterModule;

				if (isDaitsuDevice(currentDevice)) {
					if (isCzech(i18n.language)) {
						parameterModule = await import("@/jsons/parameters_daitsu_cz.json");
					} else {
						parameterModule = await import("@/jsons/parameters_daitsu.json");
					}
				} else {
					if (isCzech(i18n.language)) {
						parameterModule = await import("@/jsons/parameters_cz.json");
					} else {
						parameterModule = await import("@/jsons/parameters.json");
					}
				}

				setParametersData(parameterModule.default);
				setParametersReady(true);
			} catch (error) {
				console.error("Failed to load parameters data:", error);
				setParametersData({});
				setParametersReady(true);
			} finally {
				setParametersLoading(false);
			}
		};

		loadParametersData();
	}, [currentDevice, i18n.language]);

	const [totalPages, setTotalPages] = useState<number>(0);
	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalRecords, setTotalRecords] = useState<number>(0);
	const [logsLoaded, setLogsLoaded] = useState(false);

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

	// Only load logs when parameters are ready AND device is loaded
	useEffect(() => {
		if (!initialLoading && parametersReady && deviceId && !loading) {
			loadLogs();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parametersReady, initialLoading, deviceId]);

	// Handle query changes (search, pagination) - only if already initialized
	useEffect(() => {
		if (parametersReady && !initialLoading && logsLoaded && deviceId) {
			loadLogs();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

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
				setLogsLoaded(true);
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

		if (paramKey.includes("_bit_") || paramKey.includes("_range_")) {
			const baseKey = paramKey.includes("_bit_") ? paramKey.split("_bit_")[0] : paramKey.split("_range_")[0];
			const baseParam = parametersData[baseKey as keyof typeof parametersData] as unknown as BitfieldParameter;

			console.log("Processing bitfield param:", paramKey, "baseKey:", baseKey, "baseParam:", baseParam, "value:", value);

			if (baseParam && baseParam.type === "bitfield") {
				if (paramKey.includes("_bit_")) {
					// This is a bit parameter - display the text option
					const bitNumber = paramKey.split("_bit_")[1];
					const bitConfig = baseParam.bits?.[bitNumber];

					console.log("Bit config:", bitNumber, bitConfig);

					if (bitConfig && bitConfig.options) {
						const optionText = bitConfig.options[value];
						console.log("Option text for value", value, ":", optionText);
						return <span>{optionText || value}</span>;
					}
				} else if (paramKey.includes("_range_")) {
					// This is a range parameter - display value with unit
					const rangeName = paramKey.split("_range_")[1];
					const rangeConfig = baseParam.ranges?.[rangeName];

					console.log("Range config:", rangeName, rangeConfig);

					if (rangeConfig) {
						return (
							<span>
								{value}
								{rangeConfig.unit ? ` ${rangeConfig.unit}` : ""}
							</span>
						);
					}
				}
			}
			return value;
		}

		// For regular parameters, look up the parameter info
		const paramInfo = parametersData[paramKey as keyof typeof parametersData] as unknown as Parameter;

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
			case "bitfield":
				// For direct bitfield values, show hex representation
				return <span>0x{Number(value).toString(16).toUpperCase().padStart(2, "0")}</span>;
			default:
				return value;
		}
	};

	const getParameterDescription = (paramKey: string): string => {
		if (paramKey.includes("_bit_") || paramKey.includes("_range_")) {
			const baseKey = paramKey.includes("_bit_") ? paramKey.split("_bit_")[0] : paramKey.split("_range_")[0];
			const baseParam = parametersData[baseKey as keyof typeof parametersData] as unknown as BitfieldParameter;

			if (baseParam && baseParam.type === "bitfield") {
				if (paramKey.includes("_bit_")) {
					// This is a bit parameter
					const bitNumber = paramKey.split("_bit_")[1];
					const bitConfig = baseParam.bits?.[bitNumber];
					if (bitConfig) {
						return bitConfig.description;
					}
				} else if (paramKey.includes("_range_")) {
					// This is a range parameter
					const rangeName = paramKey.split("_range_")[1];
					const rangeConfig = baseParam.ranges?.[rangeName];
					if (rangeConfig) {
						return rangeConfig.description;
					}
				}
			}
		}

		const paramInfo = parametersData[paramKey as keyof typeof parametersData] as unknown as Parameter;
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
					{(loading && logsLoaded) || parametersLoading ? <Loader2 className="animate-spin h-4 w-4 max-md:absolute max-md:bottom-6" /> : null}
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
							{initialLoading || !parametersReady || !logsLoaded ? (
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
