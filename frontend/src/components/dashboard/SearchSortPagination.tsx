import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Device } from "@/api/devices/model";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";

interface SearchSortPaginationProps {
	devices: Device[];
	setFilteredDevices: (devices: Device[]) => void;
	onPaginationChange?: (info: { currentPage: number; totalPages: number; setCurrentPage: (page: number) => void; from: number; to: number; totalDevices: number }) => void;
}

const STATUSES = ["All", "Online", "Error", "Offline"];

const SearchSortPagination: React.FC<SearchSortPaginationProps> = ({ devices, setFilteredDevices, onPaginationChange }) => {
	const { t } = useTranslation("dashboard");

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalDevices, setTotalDevices] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(0);

	const filteredDevices = useMemo(() => {
		return devices.filter((device) => {
			const matchesSearch =
				searchQuery === "" ||
				device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(device.own_name && device.own_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
				Object.values(device.description || {}).some((desc) => String(desc).toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesStatus = statusFilter === "All" || device.status === statusFilter.toLowerCase();

			return matchesSearch && matchesStatus;
		});
	}, [devices, searchQuery, statusFilter]);

	// Reset page only when search or status filter changes, not when devices array updates
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, statusFilter]);

	// Notify parent about pagination changes
	useEffect(() => {
		if (onPaginationChange) {
			onPaginationChange({
				currentPage,
				totalPages,
				setCurrentPage,
				from,
				to,
				totalDevices,
			});
		}
	}, [currentPage, totalPages, onPaginationChange, from, to, totalDevices]);

	const paginatedDevices = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredDevices.slice(start, start + itemsPerPage);
	}, [filteredDevices, currentPage, itemsPerPage]);

	useEffect(() => {
		if (filteredDevices.length === 0) {
			setFrom(0);
			setTo(0);
			setTotalDevices(0);
			setTotalPages(0);
		} else {
			setTotalDevices(filteredDevices.length);
			const newTotalPages = Math.ceil(filteredDevices.length / itemsPerPage);
			setTotalPages(newTotalPages);

			// Ensure current page doesn't exceed total pages
			if (currentPage > newTotalPages && newTotalPages > 0) {
				setCurrentPage(newTotalPages);
				return; // Exit early, will re-run with updated currentPage
			}

			const startIndex = (currentPage - 1) * itemsPerPage + 1;
			const endIndex = Math.min(currentPage * itemsPerPage, filteredDevices.length);
			setFrom(startIndex);
			setTo(endIndex);
		}
		setFilteredDevices(paginatedDevices);
	}, [filteredDevices, currentPage, itemsPerPage, paginatedDevices, setFilteredDevices]);

	return (
		<div className="flex flex-row gap-4 items-center justify-between  max-lg:gap-0 max-lg:items-start max-lg:flex-col">
			<div className="flex gap-4">
				<Input
					type="text"
					placeholder={t("search-sort-pagination.search")}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-96"
				/>
				{/* Desktop selects */}
				<div className="hidden min-[1400px]:flex gap-4">
					<Select
						onValueChange={setStatusFilter}
						defaultValue={statusFilter}
					>
						<SelectTrigger className="max-w-[180px]">
							<SelectValue placeholder={t(`search-sort-pagination.statuses.${statusFilter.toLowerCase()}`)} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{STATUSES.map((status) => (
									<SelectItem
										key={status}
										value={status}
									>
										{t(`search-sort-pagination.statuses.${status.toLowerCase()}`)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(e) => setItemsPerPage(Number(e))}
						defaultValue={String(itemsPerPage)}
					>
						<SelectTrigger className="w-[200px] min-w-[150px]">
							<SelectValue placeholder={itemsPerPage} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{[10, 25, 50].map((num) => (
									<SelectItem
										key={num}
										value={String(num)}
									>
										{String(num) + t("search-sort-pagination.per-page")}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{/* Mobile popover trigger */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="min-[1400px]:hidden"
						>
							<ListFilter />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-4 w-auto min-w-52 space-y-4">
						<Select
							onValueChange={setStatusFilter}
							defaultValue={statusFilter}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t(`search-sort-pagination.statuses.${statusFilter.toLowerCase()}`)} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{STATUSES.map((status) => (
										<SelectItem
											key={status}
											value={status}
										>
											{t(`search-sort-pagination.statuses.${status.toLowerCase()}`)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(e) => setItemsPerPage(Number(e))}
							defaultValue={String(itemsPerPage)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={itemsPerPage} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{[10, 25, 50].map((num) => (
										<SelectItem
											key={num}
											value={String(num)}
										>
											{String(num) + t("search-sort-pagination.per-page")}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</PopoverContent>
				</Popover>
			</div>

			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					<p>
						{t("search-sort-pagination.showing")} <span>{from}</span> {t("search-sort-pagination.to")} <span>{to}</span> {t("search-sort-pagination.of")} <span>{totalDevices}</span>
					</p>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4 pl-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage(currentPage - 1)}
						disabled={currentPage <= 1}
					>
						{t("search-sort-pagination.previous")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
					>
						{t("search-sort-pagination.next")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SearchSortPagination;
