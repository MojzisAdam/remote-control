import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DeviceType } from "@/api/devices/model";
import { getColumns } from "@/components/device-types-management/columns";
import { DataTable } from "@/components/device-types-management/data-table";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDeviceTypes } from "@/hooks/useDeviceTypes";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import withAuthorization from "@/middleware/withAuthorization";
import usePageTitle from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import routes from "@/constants/routes";

const DeviceTypesManagement = () => {
	const { t, i18n } = useTranslation("deviceTypes");
	const navigate = useNavigate();

	const getStringValue = (value: any): string => {
		return String(value || "");
	};

	const { loading, fetchDeviceTypes } = useDeviceTypes();

	const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	usePageTitle(t("deviceTypes.title"));

	const [query, setQuery] = useState<{
		search: string;
		sorting: SortingState;
		pageSize: number;
	}>({
		search: "",
		sorting: [],
		pageSize: 10,
	});

	const [searchInput, setSearchInput] = useState<string>("");
	const debouncedSearch = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => {
			if (prev.search === debouncedSearch) {
				return prev;
			}
			return { ...prev, search: debouncedSearch };
		});
	}, [debouncedSearch]);

	const loadDeviceTypes = async () => {
		try {
			const response = await fetchDeviceTypes(query.search);
			if (response.success) {
				setDeviceTypes(response.data || []);
			}
		} catch (error) {
			console.log("Error fetching device types:", error);
		} finally {
			if (isInitialLoad) {
				setIsInitialLoad(false);
			}
		}
	};

	useEffect(() => {
		loadDeviceTypes();
	}, [query.search]);

	const handleSortingChange = (newSorting: SortingState) => {
		setQuery((prev) => ({
			...prev,
			sorting: newSorting,
		}));
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setQuery((prev) => ({
			...prev,
			pageSize: newPageSize,
		}));
	};

	const navigateToDeviceType = (deviceType: DeviceType) => {
		navigate(routes.deviceTypeDetail(deviceType.id));
	};

	const createDeviceType = () => {
		// Navigate to create page
		navigate(routes.deviceTypeCreate);
	};

	const columns = getColumns(t);
	const updatedColumns = columns.map((column) => {
		if (column.id === "actions") {
			return {
				...column,
				meta: {
					navigateToDeviceType,
				},
			};
		}
		return column;
	});

	// For device types, we don't need pagination since they're typically few in number
	// So we'll display all results without pagination controls
	const filteredDeviceTypes = deviceTypes.filter((deviceType) => {
		if (!query.search) return true;
		const searchLower = query.search.toLowerCase();
		const localizedName = getStringValue(deviceType.name).toLowerCase();
		const localizedDescription = getStringValue(deviceType.description).toLowerCase();
		return deviceType.id.toLowerCase().includes(searchLower) || localizedName.includes(searchLower) || localizedDescription.includes(searchLower);
	});

	return (
		<>
			<div className="mb-4">
				<Button onClick={() => createDeviceType()}>
					<Plus className="mr-2 h-4 w-4" />
					{t("deviceTypes.actions.create")}
				</Button>
			</div>
			<DataTable
				columns={updatedColumns}
				data={filteredDeviceTypes}
				sorting={query.sorting}
				pageSize={query.pageSize}
				onSortingChange={handleSortingChange}
				onSearchChange={setSearchInput}
				onPageSizeChange={handlePageSizeChange}
				loading={loading}
				isInitialLoad={isInitialLoad}
			/>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					<p>{t("deviceTypes.showing", { count: filteredDeviceTypes.length })}</p>
				</div>
			</div>
		</>
	);
};

export default withAuthorization(DeviceTypesManagement, "manage-device-types");
