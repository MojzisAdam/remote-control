import { useTranslation } from "react-i18next";
const NoDataMessage: React.FC = () => {
	const { t } = useTranslation("history");
	return (
		<div className="min-h-60 h-full w-full flex justify-center items-center">
			<p className="text-muted-foreground text-center my-4">{t("noData")}</p>
		</div>
	);
};

export default NoDataMessage;
