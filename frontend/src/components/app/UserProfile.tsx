import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { isCzech, isEnglish } from "@/utils/langUtils";

export function UserProfile() {
	const { toast } = useToast();

	const { setTheme, theme } = useTheme();

	const { user, logout, updatePreferredLanguage } = useAuth();

	const { t, i18n } = useTranslation("global");

	const langSwitch = (lang: string) => {
		i18n.changeLanguage(lang);
		updatePreferredLanguage(lang);
	};

	const handleLogout = async () => {
		const result = await logout();
		if (result.success) {
			toast({
				title: t("topNavigation.logoutSuccess"),
				description: t("topNavigation.logoutSuccessDescription"),
			});
		} else {
			toast({
				title: t("topNavigation.logoutFailed"),
				description: t("topNavigation.logoutFailedDescription"),
			});
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className="mr-2"
			>
				<Button
					variant="secondary"
					size="icon"
					className="rounded-full bg-gray-200 dark:bg-zinc-800"
				>
					{user?.first_name[0]}
					{user?.last_name[0]}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="min-w-[200px] mr-8">
				<DropdownMenuLabel className="flex flex-col">
					{user?.first_name} {user?.last_name}
					<span className="text-xs font-light text-gray-600 dark:text-gray-400">{user?.email}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link to="/profile">
						<DropdownMenuItem className="cursor-pointer">
							<User className="mr-2 h-4 w-4" />
							<span>{t("topNavigation.profile")}</span>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<Languages className="mr-2 h-4 w-4" />
						<span>{t("topNavigation.language")}</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem
								onClick={() => langSwitch("cs")}
								className={isCzech(i18n.language) ? "font-bold text-blue-500" : ""}
							>
								Čeština
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => langSwitch("en")}
								className={isEnglish(i18n.language) ? "font-bold text-blue-500" : ""}
							>
								English
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2 h-4 w-4" />
						<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2 h-4 w-4" />
						<span>{t("topNavigation.theme")}</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem
								onClick={() => setTheme("light")}
								className={theme === "light" ? "font-bold text-blue-500" : ""}
							>
								{t("light")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setTheme("dark")}
								className={theme === "dark" ? "font-bold text-blue-500" : ""}
							>
								{t("dark")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setTheme("system")}
								className={theme === "system" ? "font-bold text-blue-500" : ""}
							>
								{t("automatic")}
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => handleLogout()}
					className="cursor-pointer"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{t("topNavigation.logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
