import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

const ThemeSwitcher = () => {
	const { setTheme, theme } = useTheme();

	const { t } = useTranslation("global");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="h-8 w-8">
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "font-bold text-blue-500" : ""}>
					{t("light")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "font-bold text-blue-500" : ""}>
					{t("dark")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "font-bold text-blue-500" : ""}>
					{t("automatic")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeSwitcher;
