import React from "react";
import { useTranslation } from "react-i18next";

const DeviceLoader: React.FC = () => {
	const { t } = useTranslation("remote-control");
	return (
		<div className="flex items-center justify-center pt-[15%]">
			<div className="animate-pulse flex flex-col items-center justify-center">
				<svg
					className="w-12 h-12 text-gray-400 dark:text-gray-300 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{t("deviceLoader.loadingTitle")}</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">{t("deviceLoader.loadingSubtitle")}</p>
			</div>
		</div>
	);
};

export default DeviceLoader;
