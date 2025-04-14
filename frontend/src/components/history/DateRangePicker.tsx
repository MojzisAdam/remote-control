import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DateTimePicker24h } from "@/components/ui/date-time-picker-24h";
import { CloudDownload, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface Props {
	loading: boolean;
	selectedFrom: Date;
	selectedTo: Date;
	setSelectedFrom: (date: Date) => void;
	setSelectedTo: (date: Date) => void;
	fetchData: () => void;
}

const DateRangePicker: React.FC<Props> = ({ loading, selectedFrom, selectedTo, setSelectedFrom, setSelectedTo, fetchData }) => {
	const { t } = useTranslation("history");
	const [open, setOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const handleApply = () => {
		setOpen(false);
		fetchData();
	};

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 990);
		};

		checkIfMobile();

		window.addEventListener("resize", checkIfMobile);

		return () => {
			window.removeEventListener("resize", checkIfMobile);
		};
	}, []);

	if (isMobile) {
		return (
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						title="Select Date Range"
					>
						<Calendar className="h-5 w-5" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">{t("from")}:</p>
							<DateTimePicker24h
								value={selectedFrom}
								onChange={setSelectedFrom}
							/>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium">{t("to")}:</p>
							<DateTimePicker24h
								value={selectedTo}
								onChange={setSelectedTo}
							/>
						</div>
						<Button
							onClick={handleApply}
							disabled={loading}
							className="w-full"
						>
							<CloudDownload className="h-4 w-4" />
							{t("apply")}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		);
	}

	// Desktop view
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="w-full sm:w-auto">
				<DateTimePicker24h
					value={selectedFrom}
					onChange={setSelectedFrom}
				/>
			</div>
			<div className="w-full sm:w-auto">
				<DateTimePicker24h
					value={selectedTo}
					onChange={setSelectedTo}
				/>
			</div>
			<Button
				onClick={fetchData}
				disabled={loading}
				className="mt-2 sm:mt-0"
			>
				<CloudDownload className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default DateRangePicker;
