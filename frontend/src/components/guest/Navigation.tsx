import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import LanguaguesSwitcher from "@/components/common/LanguaguesSwitcher";

const PageSettingsNavigation: React.FC = () => {
	return (
		<div className="bg-zinc-950 px-2">
			<div className="flex items-center p-1.5 flex-wrap justify-end container m-auto">
				<div className="flex w-auto gap-2">
					<LanguaguesSwitcher />
					<ThemeSwitcher />
				</div>
			</div>
		</div>
	);
};

export default PageSettingsNavigation;
