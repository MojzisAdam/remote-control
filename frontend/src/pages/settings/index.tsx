import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AppSettings, getSettings, updateSettings, resetSettings } from "@/utils/settingsStorage";
import { Save, RotateCcw, Layout, Palette, Moon, Sun, Languages, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useAccentColor } from "@/hooks/useAccentColor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import usePageTitle from "@/hooks/usePageTitle";
import { isCzech, isEnglish } from "@/utils/syncLang";

const Settings: React.FC = () => {
	const [settings, setSettings] = useState<AppSettings>(getSettings());
	const [hasChanges, setHasChanges] = useState(false);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const { toast } = useToast();
	const { t, i18n } = useTranslation("settings");
	const { setTheme, theme } = useTheme();
	const { accentColor, setAccentColor } = useAccentColor();

	usePageTitle("Settings");

	useEffect(() => {
		setSettings(getSettings());
	}, []);

	const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		setHasChanges(true);
	};

	const saveSettings = () => {
		updateSettings(settings);
		setHasChanges(false);
		toast({
			title: t("toast.savedTitle"),
			description: t("toast.savedDescription"),
		});
	};

	const handleReset = () => {
		const defaultSettings = resetSettings();
		setSettings(defaultSettings);
		setHasChanges(false);
		setResetDialogOpen(false);
		toast({
			title: t("toast.resetTitle"),
			description: t("toast.resetDescription"),
		});
	};

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	return (
		<div className="max-w-4xl">
			<div className="mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("title")}</h1>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>

			<Tabs
				defaultValue="dashboard"
				className="w-full"
			>
				<TabsList className="w-full flex flex-wrap mb-6 sm:mb-8">
					<TabsTrigger
						value="dashboard"
						className="flex-1 flex items-center justify-center"
					>
						<Layout className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">{t("tabs.dashboard")}</span>
						<span className="sm:hidden">{t("tabs.dbShort")}</span>
					</TabsTrigger>
					<TabsTrigger
						value="appearance"
						className="flex-1 flex items-center justify-center"
					>
						<Palette className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">{t("tabs.appearance")}</span>
						<span className="sm:hidden">{t("tabs.themeShort")}</span>
					</TabsTrigger>
					<TabsTrigger
						value="language"
						className="flex-1 flex items-center justify-center"
					>
						<Globe className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">{t("tabs.language")}</span>
						<span className="sm:hidden">{t("tabs.langShort")}</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="dashboard">
					<Card>
						<CardHeader className="px-4 sm:px-6">
							<CardTitle>{t("dashboard.title")}</CardTitle>
							<CardDescription>{t("dashboard.description")}</CardDescription>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 space-y-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="show-favorites"
										className="text-sm"
									>
										{t("dashboard.showFavorites")}
									</Label>
									<Switch
										id="show-favorites"
										checked={settings.showFavoriteDevices}
										onCheckedChange={(checked) => handleChange("showFavoriteDevices", checked)}
									/>
								</div>
								<p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.showFavoritesHint")}</p>
							</div>

							<Separator />

							<div className="space-y-2">
								<Label
									htmlFor="default-view"
									className="text-sm"
								>
									{t("dashboard.defaultView")}
								</Label>
								<Select
									value={settings.defaultDashboardView}
									onValueChange={(value) => handleChange("defaultDashboardView", value as "grid" | "list")}
								>
									<SelectTrigger
										id="default-view"
										className="w-full"
									>
										<SelectValue placeholder="Select view type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="grid">{t("views.grid")}</SelectItem>
										<SelectItem value="list">{t("views.list")}</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.defaultViewHint")}</p>
							</div>

							<Separator />

							<div className="space-y-2">
								<Button
									variant="destructive"
									onClick={() => setResetDialogOpen(true)}
									className="w-full sm:w-auto"
								>
									<RotateCcw className="mr-2 h-4 w-4" />
									{t("dashboard.reset")}
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="appearance">
					<Card>
						<CardHeader className="px-4 sm:px-6">
							<CardTitle>{t("appearance.title")}</CardTitle>
							<CardDescription>{t("appearance.description")}</CardDescription>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 space-y-6">
							<div className="space-y-4">
								<Label className="text-sm">{t("appearance.theme")}</Label>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<Button
										variant={theme === "light" ? "default" : "outline"}
										className="flex flex-row sm:flex-col items-center justify-center sm:justify-center gap-2 p-3 sm:p-4 h-auto w-full"
										onClick={() => setTheme("light")}
									>
										<Sun className="h-5 w-5" />
										<span>{t("themes.light")}</span>
									</Button>

									<Button
										variant={theme === "dark" ? "default" : "outline"}
										className="flex flex-row sm:flex-col items-center justify-center sm:justify-center gap-2 p-3 sm:p-4 h-auto w-full"
										onClick={() => setTheme("dark")}
									>
										<Moon className="h-5 w-5" />
										<span>{t("themes.dark")}</span>
									</Button>

									<Button
										variant={theme === "system" ? "default" : "outline"}
										className="flex flex-row sm:flex-col items-center justify-center sm:justify-center gap-2 p-3 sm:p-4 h-auto w-full"
										onClick={() => setTheme("system")}
									>
										<div className="relative h-5 w-5">
											<Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
											<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
										</div>
										<span>{t("themes.automatic")}</span>
									</Button>
								</div>
							</div>

							<Separator />

							<div className="space-y-4">
								<Label className="text-sm">{t("appearance.accentColor")}</Label>
								<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
									<Button
										variant={accentColor === "default" ? "default" : "outline"}
										className="flex flex-col items-center justify-center gap-2 p-3 h-auto w-full"
										onClick={() => setAccentColor("default")}
									>
										<div className={`w-4 h-4 rounded-full ${accentColor === "default" ? "bg-secondary border-primary" : "bg-gray-400"}`}></div>
										<span>{t("accents.default")}</span>
									</Button>

									<Button
										variant={accentColor === "blue" ? "default" : "outline"}
										className="flex flex-col items-center justify-center gap-2 p-3 h-auto w-full"
										onClick={() => setAccentColor("blue")}
									>
										<div className={`w-4 h-4 rounded-full ${accentColor === "blue" ? "bg-white border-blue-500" : "bg-blue-500"}`}></div>
										<span>{t("accents.blue")}</span>
									</Button>

									<Button
										variant={accentColor === "green" ? "default" : "outline"}
										className="flex flex-col items-center justify-center gap-2 p-3 h-auto w-full"
										onClick={() => setAccentColor("green")}
									>
										<div className={`w-4 h-4 rounded-full ${accentColor === "green" ? "bg-white border-green-500" : "bg-green-500"}`}></div>
										<span>{t("accents.green")}</span>
									</Button>

									<Button
										variant={accentColor === "purple" ? "default" : "outline"}
										className="flex flex-col items-center justify-center gap-2 p-3 h-auto w-full"
										onClick={() => setAccentColor("purple")}
									>
										<div className={`w-4 h-4 rounded-full ${accentColor === "purple" ? "bg-white border-purple-500" : "bg-purple-500"}`}></div>
										<span>{t("accents.purple")}</span>
									</Button>

									<Button
										variant={accentColor === "red" ? "default" : "outline"}
										className="flex flex-col items-center justify-center gap-2 p-3 h-auto w-full"
										onClick={() => setAccentColor("red")}
									>
										<div className={`w-4 h-4 rounded-full ${accentColor === "red" ? "bg-white border-2 border-red-500" : "bg-red-500"}`}></div>
										<span>{t("accents.red")}</span>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="language">
					<Card>
						<CardHeader className="px-4 sm:px-6">
							<CardTitle>{t("language.title")}</CardTitle>
							<CardDescription>{t("language.description")}</CardDescription>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 space-y-6">
							<div className="space-y-4">
								<Label className="text-sm">Language</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Button
										variant={isEnglish(i18n.language) ? "default" : "outline"}
										className="flex items-center justify-start gap-2 p-3 h-auto w-full"
										onClick={() => handleLanguageChange("en")}
									>
										<Languages className="h-5 w-5" />
										<span>English</span>
									</Button>

									<Button
										variant={isCzech(i18n.language) ? "default" : "outline"}
										className="flex items-center justify-start gap-2 p-3 h-auto w-full"
										onClick={() => handleLanguageChange("cs")}
									>
										<Languages className="h-5 w-5" />
										<span>Čeština</span>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{hasChanges && (
				<div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
					<Button
						onClick={saveSettings}
						className="shadow-lg px-3 sm:px-4 py-2 h-auto"
					>
						<Save className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">{t("saveChanges.full")}</span>
						<span className="sm:hidden">{t("saveChanges.short")}</span>
					</Button>
				</div>
			)}

			<AlertDialog
				open={resetDialogOpen}
				onOpenChange={setResetDialogOpen}
			>
				<AlertDialogContent className="max-w-[90%] sm:max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>{t("resetDialog.title")}</AlertDialogTitle>
						<AlertDialogDescription className="text-sm">{t("resetDialog.description")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
						<AlertDialogCancel className="w-full sm:w-auto mt-0">{t("resetDialog.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReset}
							className="w-full sm:w-auto"
						>
							{t("resetDialog.confirm")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default Settings;
