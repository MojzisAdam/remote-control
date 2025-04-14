import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomGraphsList from "./CustomGraphsList";
import { useTranslation } from "react-i18next";

interface CustomGraphsContainerProps {
	deviceId: string;
}

const CustomGraphsContainer: React.FC<CustomGraphsContainerProps> = ({ deviceId }) => {
	const { t } = useTranslation("history");

	return (
		<Card>
			<CardHeader className="max-sm:px-4">
				<CardTitle>{t("customGraphs.title")}</CardTitle>
			</CardHeader>
			<CardContent className="max-sm:px-4">
				<CustomGraphsList deviceId={deviceId} />
			</CardContent>
		</Card>
	);
};

export default CustomGraphsContainer;
