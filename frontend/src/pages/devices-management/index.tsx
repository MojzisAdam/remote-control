"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/device-management/data-table";
import { getColumns } from "@/components/device-management/columns";
import { useDevices } from "@/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Device, DeviceDescription } from "@/api/devices/model";
import { ViewDeviceUsersModal } from "@/components/device-management/ViewDeviceUsersModal";
import { EditDeviceDescriptionModal } from "@/components/device-management/EditDeviceDescriptionModal";
import { AddDeviceModal } from "@/components/device-management/AddDeviceModal";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import usePageTitle from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";

const DeviceManagement = () => {
	const { t } = useTranslation("deviceManagement");
	const { t: tPagination } = useTranslation("pagination");
	const { devices, loading, fetchDevicesWithFilters, summary, getDeviceSummary, updateDeviceList } = useDevices();

	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [loadingSummary, setLoadingSummary] = useState(true);

	const [totalPages, setTotalPages] = useState<number>(0);
	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalDevices, setTotalDevices] = useState<number>(0);

	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [viewUsersModalOpen, setViewUsersModalOpen] = useState<boolean>(false);
	const [editDescriptionModalOpen, setEditDescriptionModalOpen] = useState<boolean>(false);
	const [addDeviceModalOpen, setAddDeviceModalOpen] = useState<boolean>(false);

	const { toast } = useToast();

	usePageTitle(t("pageTitle"));

	const [query, setQuery] = useState<{
		search: string;
		email: string;
		status: "all" | "online" | "offline" | "error";
		page: number;
		pageSize: number;
	}>({
		search: "",
		email: "",
		status: "all",
		page: 1,
		pageSize: 10,
	});

	const [searchDeviceInput, setSearchDeviceInput] = useState("");
	const [searchEmailInput, setSearchEmailInput] = useState("");

	const debouncedSearchDevice = useDebounce(searchDeviceInput, 500);
	const debouncedSearchEmail = useDebounce(searchEmailInput, 500);

	useEffect(() => {
		setQuery((prev) => {
			if (prev.search === debouncedSearchDevice && prev.email === debouncedSearchEmail) {
				return prev;
			}
			return { ...prev, search: debouncedSearchDevice, email: debouncedSearchEmail, page: 1 };
		});
	}, [debouncedSearchDevice, debouncedSearchEmail]);

	const handleStatusFilterChange = (newStatus: "all" | "online" | "offline" | "error") => {
		setQuery((prev) => ({
			...prev,
			status: newStatus,
			page: 1,
		}));
	};

	const loadDevices = async () => {
		try {
			const response = await fetchDevicesWithFilters({
				search: query.search,
				email: query.email,
				status: query.status !== "all" ? query.status : undefined,
				page: query.page,
				pageSize: query.pageSize,
			});

			if (response.success) {
				setTotalPages(response.data.meta.last_page || 0);
				setFrom(response.data.meta.from || 0);
				setTo(response.data.meta.to || 0);
				setTotalDevices(response.data.meta.total || 0);
			}
		} catch (error) {
			console.error("Error fetching devices:", error);
		} finally {
			if (isInitialLoad) {
				setIsInitialLoad(false);
			}
		}
	};

	useEffect(() => {
		loadDevices();
	}, [query]);

	useEffect(() => {
		const fetchDeviceSummary = async () => {
			await getDeviceSummary();
			setLoadingSummary(false);
		};

		fetchDeviceSummary();
	}, []);

	const handlePreviousPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page - 1,
		}));
	};

	const handleNextPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page + 1,
		}));
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setQuery((prev) => ({
			...prev,
			pageSize: newPageSize,
			page: 1,
		}));
	};

	// Action handlers for the Actions column.
	const viewDeviceUsers = (device: Device) => {
		setSelectedDevice(device);
		setViewUsersModalOpen(true);
	};

	const editDeviceDescription = (device: Device) => {
		setSelectedDevice(device);
		setEditDescriptionModalOpen(true);
	};

	const addDeviceToList = (device: Device) => {
		setSelectedDevice(device);
		setAddDeviceModalOpen(true);
	};

	// Handle updating device description
	const onDescriptionUpdate = async (deviceId: string, descriptionData: Partial<DeviceDescription>) => {
		toast({
			title: t("toast.deviceUpdated"),
			description: t("toast.deviceDescriptionUpdated"),
		});
		const device = devices.find((d) => d.id === deviceId);
		if (device) {
			if (device.description) {
				const updatedDescription: DeviceDescription = {
					...device.description,
					...descriptionData,
					id: device.description.id,
				};
				const updatedDevice: Device = {
					...device,
					description: updatedDescription,
				};
				updateDeviceList(updatedDevice);
			}
		}
		setEditDescriptionModalOpen(false);
	};

	const columns = getColumns(t);

	// Update device columns to pass the action functions into the actions column.
	const updatedColumns = columns.map((col) =>
		col.id === "actions"
			? {
					...col,
					meta: { viewDeviceUsers, editDeviceDescription, addDeviceToList },
			  }
			: col
	);

	return (
		<>
			{loadingSummary ? (
				<Skeleton className="h-[88px] max-w-[295px] mb-4" />
			) : (
				<div className="mb-4 p-4 bg-gray-100 dark:bg-zinc-900 rounded-md shadow-sm w-fit">
					<h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t("overview.title")}</h2>
					<div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
						<div className="flex items-center">
							<span className="font-medium mr-1">{t("overview.total")}:</span>
							<span>{summary.total}</span>
						</div>
						<div className="flex items-center">
							<span className="font-medium mr-1 text-green-500">{t("overview.online")}:</span>
							<span>{summary.online}</span>
						</div>
						<div className="flex items-center">
							<span className="font-medium mr-1 text-gray-500 dark:text-gray-400">{t("overview.offline")}:</span>
							<span>{summary.offline}</span>
						</div>
						<div className="flex items-center">
							<span className="font-medium mr-1 text-red-500">{t("overview.error")}:</span>
							<span>{summary.in_error}</span>
						</div>
					</div>
				</div>
			)}

			<DataTable
				columns={updatedColumns}
				data={devices}
				sorting={[]}
				pageSize={query.pageSize}
				onSortingChange={() => {}}
				onPageSizeChange={handlePageSizeChange}
				loading={loading}
				isInitialLoad={isInitialLoad}
				deviceSearch={searchDeviceInput}
				onDeviceSearchChange={setSearchDeviceInput}
				emailSearch={searchEmailInput}
				onEmailSearchChange={setSearchEmailInput}
				statusFilter={query.status}
				onStatusFilterChange={handleStatusFilterChange}
			/>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					<p>{tPagination("showing", { from, to, total: totalDevices })}</p>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviousPage}
						disabled={query.page <= 1}
					>
						{tPagination("previous")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={query.page >= totalPages}
					>
						{tPagination("next")}
					</Button>
				</div>
			</div>
			{/* Modals */}
			{selectedDevice && (
				<>
					<ViewDeviceUsersModal
						open={viewUsersModalOpen}
						onOpenChange={setViewUsersModalOpen}
						deviceId={selectedDevice.id}
					/>
					<AddDeviceModal
						open={addDeviceModalOpen}
						onOpenChange={setAddDeviceModalOpen}
						device={selectedDevice}
					/>
					<EditDeviceDescriptionModal
						open={editDescriptionModalOpen}
						onOpenChange={setEditDescriptionModalOpen}
						device={selectedDevice}
						onSave={onDescriptionUpdate}
					/>
				</>
			)}
		</>
	);
};

export default DeviceManagement;
