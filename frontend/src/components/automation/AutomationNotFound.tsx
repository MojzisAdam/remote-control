import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import routes from "@/constants/routes";

const AutomationNotFound: React.FC = () => {
	const { t } = useTranslation("automations");
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleGoToAutomations = () => {
		navigate(routes.automations);
	};

	const handleGoHome = () => {
		navigate(routes.dashboard);
	};

	return (
		<div className="flex items-center justify-center bg-background mt-[100px] mb-10">
			<Card className="w-full max-w-md mx-4">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<AlertTriangle className="h-16 w-16 text-muted-foreground" />
					</div>
					<CardTitle className="text-xl">{t("notFound.title")}</CardTitle>
					<CardDescription>{t("notFound.description")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button
						onClick={handleGoToAutomations}
						className="w-full"
						variant="default"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t("notFound.backToAutomations")}
					</Button>
					<Button
						onClick={handleGoBack}
						className="w-full"
						variant="outline"
					>
						{t("notFound.goBack")}
					</Button>
					<Button
						onClick={handleGoHome}
						className="w-full"
						variant="ghost"
					>
						<Home className="w-4 h-4 mr-2" />
						{t("notFound.goToDashboard")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default AutomationNotFound;
