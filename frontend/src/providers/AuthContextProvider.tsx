import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/user/model";
import { fetchUser } from "@/api/user/actions";
import { syncLang } from "@/lib/i18n/sync";
import { useToast } from "@/hooks/use-toast";
import { registerSessionExpiredCallback } from "@/lib/api/errorHandler";
import { ApiHandlerResult, handleApiRequest } from "@/lib/api/apiHandler";

type AuthContextType = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	loading: boolean;
	refreshLoading: boolean;
	inAuthVerification: boolean;
	refreshUser: () => Promise<ApiHandlerResult>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_THRESHOLD = 15 * 60 * 1000;

const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
	let timer: NodeJS.Timeout | null = null;

	const debouncedFunction = (...args: Parameters<F>) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => func(...args), delay);
	};

	debouncedFunction.cancel = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	return debouncedFunction;
};

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshLoading, setRefreshLoading] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { toast } = useToast();

	const lastActivityRef = useRef<number>(Date.now());
	const [inAuthVerification, setInAuthVerification] = useState(false);
	const hasAuthRef = useRef<boolean>(false);

	const loadUser = async (withLoader: boolean = true) => {
		if (withLoader) setLoading(true);

		const result = await handleApiRequest({
			apiCall: fetchUser,
			onSuccess: (fetchedUser) => {
				setUser(fetchedUser);
				syncLang(fetchedUser);
				hasAuthRef.current = true;
				lastActivityRef.current = Date.now();
			},
			successMessage: null,
			statusHandlers: {
				401: () => {
					setUser(null);
					hasAuthRef.current = false;
					return "Session expired";
				},
				[-1]: () => {
					return "Network error, maintaining current session";
				},
			},
		});

		if (withLoader) setLoading(false);
		return result;
	};

	const refreshUser = async () => {
		setRefreshLoading(true);

		setInAuthVerification(true);

		const result = await handleApiRequest({
			apiCall: fetchUser,
			onSuccess: (fetchedUser) => {
				setUser(fetchedUser);
				syncLang(fetchedUser);
				hasAuthRef.current = true;
				lastActivityRef.current = Date.now();
			},
			successMessage: null,
			statusHandlers: {
				401: () => {
					setUser(null);
					hasAuthRef.current = false;
					return "Session expired";
				},
				[-1]: () => {
					return "Network error, maintaining current session";
				},
			},
		});

		setRefreshLoading(false);
		setTimeout(() => setInAuthVerification(false), 300);
		return result;
	};

	useEffect(() => {
		loadUser(true);
	}, []);

	useEffect(() => {
		const updateLastActivity = () => {
			lastActivityRef.current = Date.now();
		};

		window.addEventListener("click", updateLastActivity);
		window.addEventListener("keypress", updateLastActivity);
		window.addEventListener("scroll", updateLastActivity);
		window.addEventListener("mousemove", updateLastActivity);

		return () => {
			window.removeEventListener("click", updateLastActivity);
			window.removeEventListener("keypress", updateLastActivity);
			window.removeEventListener("scroll", updateLastActivity);
			window.removeEventListener("mousemove", updateLastActivity);
		};
	}, []);

	const handleFocus = async () => {
		if (hasAuthRef.current && !loading && !refreshLoading) {
			const inactiveTime = Date.now() - lastActivityRef.current;
			if (inactiveTime > INACTIVITY_THRESHOLD || (!user && hasAuthRef.current)) {
				await refreshUser();
			}
		}
	};

	const debouncedHandleFocus = debounce(handleFocus, 300);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				debouncedHandleFocus();
			}
		};

		window.addEventListener("focus", debouncedHandleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("focus", debouncedHandleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			debouncedHandleFocus.cancel();
		};
	}, [user, loading, refreshLoading]);

	useEffect(() => {
		registerSessionExpiredCallback((message) => {
			if (user) {
				toast({
					title: "Session Expired",
					description: message,
				});
				setUser(null);
				hasAuthRef.current = false;
				const target = `/login?redirect=${encodeURIComponent(location.pathname)}`;
				navigate(target, { replace: true });
			}
		});
	}, [user, location, navigate, toast]);

	return <AuthContext.Provider value={{ user, setUser, loading, refreshLoading, inAuthVerification, refreshUser }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuthContext must be used within AuthProvider");
	return context;
};
