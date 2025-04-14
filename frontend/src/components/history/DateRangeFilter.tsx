import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarDays } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface DateRangeFilterProps {
	loading: boolean;
	selectedFrom: Date;
	selectedTo: Date;
	setSelectedFrom: (date: Date) => void;
	setSelectedTo: (date: Date) => void;
	fetchData: () => void;
	timeRange: "day" | "hour" | "week";
	handleTimeRangeSelect: (range: "day" | "hour" | "week") => void;
	className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ loading, selectedFrom, selectedTo, setSelectedFrom, setSelectedTo, fetchData, timeRange, handleTimeRangeSelect, className }) => {
	const { t } = useTranslation("history");

	return (
		<div className={clsx("flex flex-row justify-between items-center gap-4 mb-6", className)}>
			<DateRangePicker
				loading={loading}
				selectedFrom={selectedFrom}
				selectedTo={selectedTo}
				setSelectedFrom={setSelectedFrom}
				setSelectedTo={setSelectedTo}
				fetchData={fetchData}
			/>

			<div className="flex flex-wrap gap-2 mt-0 0">
				<Button
					disabled={loading}
					variant={timeRange === "hour" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("hour")}
					className="flex-1 md:flex-none"
					title={t("range.hour")}
				>
					<Clock className="h-4 w-4" />
				</Button>
				<Button
					disabled={loading}
					variant={timeRange === "day" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("day")}
					className="flex-1 md:flex-none"
					title={t("range.day")}
				>
					<Calendar className="h-4 w-4" />
				</Button>
				<Button
					disabled={loading}
					variant={timeRange === "week" ? "default" : "outline"}
					onClick={() => handleTimeRangeSelect("week")}
					className="flex-1 md:flex-none"
					title={t("range.week")}
				>
					<CalendarDays className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default DateRangeFilter;
