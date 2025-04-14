import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LanguaguesSwitcher = () => {
	const { i18n } = useTranslation("global");

	const langSwitch = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
				>
					<Languages className="p-0.6 transition-all rotate" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => langSwitch("cs")}
					className={i18n.language === "cs" ? "font-bold text-blue-500" : ""}
				>
					Čeština
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => langSwitch("en")}
					className={i18n.language === "en" ? "font-bold text-blue-500" : ""}
				>
					English
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LanguaguesSwitcher;
