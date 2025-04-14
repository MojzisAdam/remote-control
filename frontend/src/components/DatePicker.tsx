"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
	value?: string | null;
	onChange: (date: string | null) => void;
	className?: string | null;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
	const { i18n, t } = useTranslation("components");
	const selectedLocale = i18n.language === "en" ? enUS : cs;

	const dateObj = value ? parseISO(value) : undefined;
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && open) {
				event.stopPropagation();
				setOpen(false);
			}
		};

		if (open) {
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.removeEventListener("keydown", handleKeyDown);
		}

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild>
				<Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !value && "text-muted-foreground", className)} onClick={() => setOpen((prev) => !prev)}>
					<CalendarIcon />
					{value ? format(dateObj!, "PPP", { locale: selectedLocale }) : <span>{t("DatePicker.placeholder")}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start" side="bottom">
				<Calendar
					mode="single"
					selected={dateObj}
					onSelect={(selectedDate) => {
						if (selectedDate) {
							const normalizedDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
							onChange(normalizedDate.toISOString());
						} else {
							onChange(null);
						}
						setOpen(false);
					}}
					locale={selectedLocale}
				/>
			</PopoverContent>
		</Popover>
	);
}
