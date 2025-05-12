import { useState, useEffect } from "react";
import { checkForcePasswordChange } from "@/api/user/actions";

export const useForcePasswordChange = () => {
	const [forcePasswordChange, setForcePasswordChange] = useState<boolean | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const checkPasswordChangeStatus = async () => {
		setLoading(true);
		try {
			const response = await checkForcePasswordChange();
			setForcePasswordChange(response.force_password_change);
			setError(null);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkPasswordChangeStatus();
	}, []);

	return {
		forcePasswordChange,
		loading,
		error,
		checkPasswordChangeStatus,
	};
};
