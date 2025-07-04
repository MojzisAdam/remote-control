import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Smartphone, Wifi, HardDrive, Monitor, Bell, History, Settings } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

const Apps: React.FC = () => {
	const { t } = useTranslation("apps");

	usePageTitle(t("page-title"));

	const handleGoogleDriveDownload = () => {
		// Open Google Drive intent for Android
		const driveIntent =
			"intent://drive.google.com/drive/folders/10QE1ycPG_c2nvDFhpwwqQkLfADHlNog0?usp=sharing#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;package=com.google.android.apps.docs;end";

		const fallbackUrl = "https://drive.google.com/drive/folders/10QE1ycPG_c2nvDFhpwwqQkLfADHlNog0?usp=sharing";

		let hasChangedLocation = false;

		// Set up a timer-based fallback mechanism
		const fallbackTimer = setTimeout(() => {
			if (!hasChangedLocation) {
				window.open(fallbackUrl, "_blank");
			}
		}, 2000);

		// Listen for page visibility change (happens when intent is successful)
		const handleVisibilityChange = () => {
			if (document.hidden) {
				hasChangedLocation = true;
				clearTimeout(fallbackTimer);
				document.removeEventListener("visibilitychange", handleVisibilityChange);
			}
		};

		// Listen for blur event (also happens when intent is successful)
		const handleBlur = () => {
			hasChangedLocation = true;
			clearTimeout(fallbackTimer);
			window.removeEventListener("blur", handleBlur);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("blur", handleBlur);

		// Try to open the intent
		window.location.href = driveIntent;
	};

	const handleDirectDownload = () => {
		// Create download link for direct download
		const link = document.createElement("a");
		link.href = "/downloads/portal-kaiteki.apk";
		link.download = "portal-kaiteki.apk";
		link.click();
	};

	return (
		<div className="apps-page flex flex-col gap-6 max-w-4xl mx-auto px-0 sm:px-4 lg:px-6">
			{/* Header Section */}
			<div className="text-center space-y-3 sm:space-y-4">
				<div className="flex items-center justify-center gap-3 sm:gap-4">
					<div className="hidden sm:block p-2 sm:p-3 bg-primary/10 rounded-full border border-primary/20">
						<Smartphone className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
					</div>
					<h1 className="text-xl sm:text-2xl font-bold">{t("title")}</h1>
				</div>
				<p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">{t("description")}</p>
			</div>

			{/* Download Options Card */}
			<Card className="w-full shadow-lg">
				<CardHeader className="pb-3 sm:pb-4">
					<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
						<Download className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
						{t("download-options")}
					</CardTitle>
					<CardDescription className="text-xs sm:text-sm">{t("android-app")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 sm:space-y-6">
					{/* Primary Download Option - Google Drive */}
					<div className="relative border-2 border-primary/20 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-200">
						<div className="absolute -top-2.5 sm:-top-3 left-3 sm:left-4">
							<Badge className="bg-primary text-primary-foreground shadow-md">
								<span className="text-xs font-medium">{t("recommended")}</span>
							</Badge>
						</div>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
										<ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
									</div>
									<h3 className="font-semibold text-base sm:text-lg">{t("primary-option")}</h3>
								</div>
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t("google-drive-desc")}</p>
							</div>
							<div className="flex-shrink-0 w-full sm:w-auto">
								<Button
									onClick={handleGoogleDriveDownload}
									size="default"
									className="flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto sm:min-w-[140px]"
								>
									<ExternalLink className="h-4 w-4" />
									{t("download-button")}
								</Button>
							</div>
						</div>
					</div>

					{/* Secondary Download Option - Direct Download */}
					<div className="border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-card hover:bg-muted/30 transition-all duration-200">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="p-1.5 sm:p-2 bg-muted rounded-full">
										<Download className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
									</div>
									<h3 className="font-semibold text-base sm:text-lg">{t("secondary-option")}</h3>
								</div>
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t("direct-download-desc")}</p>
							</div>
							<div className="flex-shrink-0 w-full sm:w-auto">
								<Button
									variant="outline"
									onClick={handleDirectDownload}
									size="default"
									className="flex items-center justify-center gap-2 hover:bg-muted hover:border-muted-foreground/50 transition-all duration-200 w-full sm:w-auto sm:min-w-[140px]"
								>
									<Download className="h-4 w-4" />
									{t("download-button")}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* System Requirements */}
			<Card className="shadow-lg">
				<CardHeader className="pb-3 sm:pb-4">
					<CardTitle className="flex items-center gap-2 text-base sm:text-xl">
						<HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
						{t("requirements.title")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 sm:space-y-4">
						<div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-muted/30">
							<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full shadow-sm"></div>
							<span className="text-xs sm:text-sm font-medium">{t("requirements.android-version")}</span>
						</div>
						<div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-muted/30">
							<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full shadow-sm"></div>
							<span className="text-xs sm:text-sm font-medium">{t("requirements.storage")}</span>
						</div>
						<div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-muted/30">
							<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full shadow-sm"></div>
							<span className="text-xs sm:text-sm font-medium">{t("requirements.internet")}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Apps;
