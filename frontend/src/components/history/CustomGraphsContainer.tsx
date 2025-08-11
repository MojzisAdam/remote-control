import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomGraphsList from "./CustomGraphsList";
import { useTranslation } from "react-i18next";
import { Device } from "@/api/devices/model";

interface CustomGraphsContainerProps {
	device: Device;
}

const CustomGraphsContainer: React.FC<CustomGraphsContainerProps> = ({ device }) => {
	const { t } = useTranslation("history");

	return (
		<Card>
			<CardHeader className="max-sm:px-4">
				<CardTitle>{t("customGraphs.title")}</CardTitle>
			</CardHeader>
			<CardContent className="max-sm:px-4">
				<CustomGraphsList device={device} />
			</CardContent>
		</Card>
	);
};

export default CustomGraphsContainer;
