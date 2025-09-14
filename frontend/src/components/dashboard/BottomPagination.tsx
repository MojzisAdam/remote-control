import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BottomPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	from: number;
	to: number;
	totalDevices: number;
}

const BottomPagination: React.FC<BottomPaginationProps> = ({ currentPage, totalPages, onPageChange, from, to, totalDevices }) => {
	const { t } = useTranslation("dashboard");

	// Don't render anything if there's only one page or no pages
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-end space-x-2 py-4 max-lg:justify-start mt-2">
			<div className="text-sm text-muted-foreground">
				<p>
					{t("search-sort-pagination.showing")} <span>{from}</span> {t("search-sort-pagination.to")} <span>{to}</span> {t("search-sort-pagination.of")} <span>{totalDevices}</span>
				</p>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4 pl-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					{t("search-sort-pagination.previous")}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					{t("search-sort-pagination.next")}
				</Button>
			</div>
		</div>
	);
};

export default BottomPagination;
