import React, { useState, useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type NoticeRecord = Record<string, string>;

interface Notice {
	id: string;
	enabled: boolean;
	severity: "info" | "warning" | "error";
	validFrom?: string;
	validUntil?: string;
	title: NoticeRecord;
	message: NoticeRecord;
}

const severityClasses: Record<Notice["severity"], string> = {
	info: "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700 [&>svg]:!text-blue-600 dark:[&>svg]:!text-blue-400",
	warning: "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 [&>svg]:!text-amber-600 dark:[&>svg]:!text-amber-400",
	error: "border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 dark:border-red-700 [&>svg]:!text-red-600 dark:[&>svg]:!text-red-400",
};

function resolveText(record: NoticeRecord, lang: string): string {
	return record[lang] ?? record["en"] ?? Object.values(record)[0] ?? "";
}

const DISMISSED_KEY = "dismissedNotices";

function getDismissed(): string[] {
	try {
		return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
	} catch {
		return [];
	}
}

function dismiss(id: string): void {
	const dismissed = getDismissed();
	if (!dismissed.includes(id)) {
		localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
	}
}

const NoticesBanner: React.FC = () => {
	const { i18n } = useTranslation();
	const [activeNotices, setActiveNotices] = useState<Notice[]>([]);

	useEffect(() => {
		const now = new Date();
		fetch("/notices.json")
			.then((r) => r.json())
			.then((data: unknown) => {
				const notices: Notice[] = Array.isArray(data) ? data : [];
				const dismissed = getDismissed();
				setActiveNotices(notices.filter((n) => n.enabled && !dismissed.includes(n.id) && (!n.validFrom || now >= new Date(n.validFrom)) && (!n.validUntil || now < new Date(n.validUntil))));
			})
			.catch(() => {});
	}, []);

	const handleDismiss = (id: string) => {
		dismiss(id);
		setActiveNotices((prev) => prev.filter((n) => n.id !== id));
	};

	if (activeNotices.length === 0) return null;

	return (
		<>
			{activeNotices.map((notice) => (
				<Alert
					key={notice.id}
					className={`relative mb-8 ${severityClasses[notice.severity ?? "warning"]}`}
				>
					<TriangleAlert className="h-4 w-4" />
					<AlertTitle className="font-semibold pr-8">{resolveText(notice.title, i18n.language)}</AlertTitle>
					<AlertDescription className="pr-6">
						{resolveText(notice.message, i18n.language)}
						<Button
							size="icon"
							variant="ghost"
							className="absolute top-2 right-2 h-4 w-4"
							onClick={() => handleDismiss(notice.id)}
							aria-label="Dismiss"
						>
							<X />
						</Button>
					</AlertDescription>
				</Alert>
			))}
		</>
	);
};

export default NoticesBanner;
