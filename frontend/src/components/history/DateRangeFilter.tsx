import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface DateRangeFilterProps {
	loading: boolean;
	selectedFrom: Date;
	selectedTo: Date;
	setSelectedFrom: (date: Date) => void;
	setSelectedTo: (date: Date) => void;
	fetchData: (from?: Date, to?: Date) => void;
	timeRange: "day" | "hour" | "week";
	handleTimeRangeSelect: (range: "day" | "hour" | "week") => void;
	className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ loading, selectedFrom, selectedTo, setSelectedFrom, setSelectedTo, fetchData, timeRange, handleTimeRangeSelect, className }) => {
	const { t } = useTranslation("history");

	const handleShiftBackward = () => {
		const dayInMs = 24 * 60 * 60 * 1000;
		const newFromDate = new Date(selectedFrom.getTime() - dayInMs);
		const newToDate = new Date(selectedTo.getTime() - dayInMs);

		setSelectedFrom(newFromDate);
		setSelectedTo(newToDate);

		fetchData(newFromDate, newToDate);
	};

	const handleShiftForward = () => {
		const dayInMs = 24 * 60 * 60 * 1000;
		const newFromDate = new Date(selectedFrom.getTime() + dayInMs);
		const newToDate = new Date(selectedTo.getTime() + dayInMs);

		setSelectedFrom(newFromDate);
		setSelectedTo(newToDate);

		fetchData(newFromDate, newToDate);
	};

	return (
		<div className={clsx("flex flex-row justify-between items-center gap-4 mb-6 max-[500px]:flex-col", className)}>
			<div className="flex gap-6 max-[500px]:w-full max-[500px]:justify-between">
				<DateRangePicker
					loading={loading}
					selectedFrom={selectedFrom}
					selectedTo={selectedTo}
					setSelectedFrom={setSelectedFrom}
					setSelectedTo={setSelectedTo}
					fetchData={fetchData}
				/>

				<div className="flex gap-3">
					<Button
						disabled={loading}
						variant="outline"
						size="icon"
						onClick={handleShiftBackward}
						title={t("range.previous")}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<Button
						disabled={loading}
						variant="outline"
						size="icon"
						onClick={handleShiftForward}
						title={t("range.next")}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 mt-0 0 max-[500px]:w-full justify-end">
				<Button
					disabled={loading}
					variant={timeRange === "hour" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("hour")}
					className="flex-1 max-[500px]:flex-none"
					title={t("range.hour")}
				>
					<Clock className="h-4 w-4" />
				</Button>
				<Button
					disabled={loading}
					variant={timeRange === "day" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("day")}
					className="flex-1 max-[500px]:flex-none"
					title={t("range.day")}
				>
					<Calendar className="h-4 w-4" />
				</Button>
				<Button
					disabled={loading}
					variant={timeRange === "week" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("week")}
					className="flex-1 max-[500px]:flex-none"
					title={t("range.week")}
				>
					<CalendarDays className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default DateRangeFilter;
