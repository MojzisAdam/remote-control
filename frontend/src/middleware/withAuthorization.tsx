import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const AuthorizingIndicator = () => {
	const { t } = useTranslation("global");

	return (
		<div className="flex justify-center flex-col content-center items-center gap-6 mt-24">
			<LoadingSpinner />
			<div className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-4">{t("auth.authorizing")}</div>
		</div>
	);
};

const UnauthorizedIndicator = () => {
	const { t } = useTranslation("global");

	return (
		<div className="flex items-center justify-center mt-12">
			<div className="max-w-md w-full p-6 px-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
				<div className="flex justify-center mb-4">
					<div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
						<svg
							className="w-6 h-6 text-red-500 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
				</div>
				<h2 className="text-lg font-medium text-center text-gray-900 dark:text-gray-100 mb-2">{t("auth.notAuthorized")}</h2>
				<p className="text-center text-gray-600 dark:text-gray-400">{t("auth.noPermission")}</p>
			</div>
		</div>
	);
};

function withAuthorization<P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>, requiredPermission: string): React.FC<P> {
	const WrappedComponent: React.FC<P> = (props: P) => {
		const { user, hasPermission, loading } = useAuth();
		const [checking, setChecking] = useState(true);
		const [hasAccess, setHasAccess] = useState(false);

		useEffect(() => {
			if (!loading) {
				setHasAccess(!!user && hasPermission(requiredPermission));
				setChecking(false);
			}
		}, [user, hasPermission, loading, requiredPermission]);

		if (loading || checking) {
			return <AuthorizingIndicator />;
		}

		if (!hasAccess) {
			return <UnauthorizedIndicator />;
		}

		return <Component {...props} />;
	};

	WrappedComponent.displayName = `withAuthorization(${Component.displayName || Component.name || "Component"})`;

	return WrappedComponent;
}

export default withAuthorization;
