import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/loadingPage";
import NotFoundPage from "@/pages/NotFoundPage";

function withAuthorization<P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>, requiredPermission: string): React.FC<P> {
	const WrappedComponent: React.FC<P> = (props: P) => {
		const { user, hasPermission, loading } = useAuth();
		const [checking, setChecking] = useState(true);
		const [hasAccess, setHasAccess] = useState(false);

		useEffect(() => {
			if (!loading) {
				if (!user) {
					setHasAccess(false);
				} else if (!hasPermission(requiredPermission)) {
					setHasAccess(false);
				} else {
					setHasAccess(true);
				}
				setChecking(false);
			}
		}, [user, hasPermission, loading, requiredPermission]);

		if (loading || checking) {
			return <LoadingPage />;
		}

		if (!hasAccess) {
			return <NotFoundPage />;
		}

		return <Component {...props} />;
	};

	WrappedComponent.displayName = `withAuthorization(${Component.displayName || Component.name || "Component"})`;

	return WrappedComponent;
}

export default withAuthorization;
