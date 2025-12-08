import { useAuthContext } from "@/providers/AuthContextProvider";
import {
	registerUser,
	loginUser,
	logoutUser,
	fetchUser,
	forgotPassword as apiForgotPassword,
	resetPassword as apiResetPassword,
	resendEmailVerification as apiResendEmailVerification,
	verifyEmail as apiVerifyEmail,
	changeInformations as apiChangeInformations,
	changePassword as apiChangePassword,
	twoFactorChallenge as apiTwoFactorChallenge,
	confirmPassword as apiConfirmPassword,
	getConfirmedPasswordStatus as apiGetConfirmedPasswordStatus,
	confirmTwoFactorAuthentication as apiConfirmTwoFactorAuthentication,
	enableTwoFactorAuthentication as apiEnableTwoFactorAuthentication,
	disableTwoFactorAuthentication as apiDisableTwoFactorAuthentication,
	getTwoFactorQrCode as apiGetTwoFactorQrCode,
	getTwoFactorRecoveryCodes as apiGetTwoFactorRecoveryCodes,
	regenerateTwoFactorRecoveryCodes as apiRegenerateTwoFactorRecoveryCodes,
	getTwoFactorSecretKey as apiGetTwoFactorSecretKey,
	updatePreferredLanguage as apiUpdatePreferredLanguage,
} from "@/api/user/actions";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { RegisterFormData } from "@/pages/register";
import { ApiHandlerResult, handleApiRequest } from "@/lib/api/apiHandler";
import { CodeData } from "@/api/user/model";
import { useTranslation } from "react-i18next";

export const useAuth = () => {
	const { t } = useTranslation("user");

	const { user, setUser } = useAuthContext();
	const location = useLocation();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);

	const register = async (userData: RegisterFormData): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => registerUser(userData),
			onSuccess: async () => loadUser(),
			successMessage: t("auth-hook.register-success"),
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const loadUser = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchUser,
			onSuccess: (data) => {
				setUser(data);
			},
			successMessage: null,
		});
		setLoading(false);
		return result;
	};

	const getFreshUser = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: fetchUser,
			successMessage: null,
		});
		setLoading(false);
		return result;
	};

	const login = async (credentials: { email: string; password: string; remember: boolean }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => loginUser(credentials),
			// onSuccess: async () => setUser(await fetchUser()),
			successMessage: t("auth-hook.login-success"),
			statusHandlers: {
				429: (error) => {
					const retryAfter = error.response?.headers["retry-after"];
					return retryAfter ? t("auth-hook.login-too-many-attempts", { seconds: retryAfter }) : t("auth-hook.login-too-many-attempts-generic");
				},
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const logout = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: logoutUser,
			onSuccess: () => {
				setUser(null);
				const currentPath = location.pathname + location.search;
				const redirectValue = currentPath !== "/login" ? currentPath : "/";
				navigate(`/login?redirect=${encodeURIComponent(redirectValue)}`, { replace: true });
			},
			successMessage: null,
		});
		setLoading(false);
		return result;
	};

	const forgotPassword = async (email: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiForgotPassword({ email }),
			successMessage: t("auth-hook.forgot-password-success"),
		});
		setLoading(false);
		return result;
	};

	const resetPassword = async ({ token, email, password, password_confirmation }: { token: string; email: string; password: string; password_confirmation: string }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () =>
				apiResetPassword({
					token,
					email,
					password,
					password_confirmation,
				}),
			successMessage: t("auth-hook.password-reset-success"),
		});
		setLoading(false);
		return result;
	};

	const changeInformations = async ({ first_name, last_name, email }: { first_name: string; last_name: string; email: string }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () =>
				apiChangeInformations({
					first_name,
					last_name,
					email,
				}),
			onSuccess: async () => setUser(await fetchUser()),
			successMessage: t("auth-hook.profile-success"),
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	const changePassword = async ({ current_password, password, password_confirmation }: { current_password: string; password: string; password_confirmation: string }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () =>
				apiChangePassword({
					current_password,
					password,
					password_confirmation,
				}),
			successMessage: t("auth-hook.change-password-success"),
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	// Verify email
	const verifyEmail = async ({ id, hash, query }: { id: string; hash: string; query: string }): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiVerifyEmail({ id, hash, query }),
			successMessage: t("auth-hook.email-verification-success"),
		});
		setLoading(false);
		return result;
	};

	// Resend email verification
	const resendEmailVerification = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: apiResendEmailVerification,
			successMessage: t("auth-hook.email-verification-resend-success"),
		});
		setLoading(false);
		return result;
	};

	// Function to get roles
	const getRoles = () => {
		return user?.roles || [];
	};

	// Function to get permissions
	const getPermissions = () => {
		return user?.permissions || [];
	};

	// Function to check if user has a specific role
	const hasRole = (role: string): boolean => {
		return user?.roles?.includes(role) || false;
	};

	// Function to check if user has a specific permission
	const hasPermission = (permission: string): boolean => {
		return user?.permissions?.includes(permission) || false;
	};

	// Two-Factor Challenge
	const twoFactorChallenge = async (codeData: CodeData): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiTwoFactorChallenge(codeData),
			successMessage: t("auth-hook.two-factor-challenge-success"),
			statusHandlers: {
				422: () => {
					return null;
				},
			},
		});
		setLoading(false);
		return result;
	};

	// Confirm Password
	const confirmPassword = async (password: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiConfirmPassword(password),
			successMessage: t("auth-hook.confirm-password-success"),
		});
		setLoading(false);
		return result;
	};

	// Confirmed Password Status
	const getConfirmedPasswordStatus = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiGetConfirmedPasswordStatus(),
			successMessage: t("auth-hook.confirm-password-status-success"),
		});
		setLoading(false);
		return result;
	};

	// Confirm Two-Factor Authentication
	const confirmTwoFactorAuthentication = async (code: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiConfirmTwoFactorAuthentication(code),
			successMessage: t("auth-hook.two-factor-confirm-success"),
			onSuccess: async () => setUser(await fetchUser()),
		});
		setLoading(false);
		return result;
	};

	// Enable Two-Factor Authentication
	const enableTwoFactorAuthentication = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiEnableTwoFactorAuthentication(),
			successMessage: t("auth-hook.two-factor-enable-success"),
		});
		setLoading(false);
		return result;
	};

	// Disable Two-Factor Authentication
	const disableTwoFactorAuthentication = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiDisableTwoFactorAuthentication(),
			onSuccess: async () => setUser(await fetchUser()),
			successMessage: t("auth-hook.two-factor-disable-success"),
		});
		setLoading(false);
		return result;
	};

	// Get Two-Factor QR Code
	const getTwoFactorQrCode = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiGetTwoFactorQrCode(),
			successMessage: t("auth-hook.two-factor-qr-success"),
		});
		setLoading(false);
		return result;
	};

	// Get Two-Factor Recovery Codes
	const getTwoFactorRecoveryCodes = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiGetTwoFactorRecoveryCodes(),
			successMessage: t("auth-hook.two-factor-recovery-success"),
		});
		setLoading(false);
		return result;
	};

	// Regenerate Two-Factor Recovery Codes
	const regenerateTwoFactorRecoveryCodes = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiRegenerateTwoFactorRecoveryCodes(),
			successMessage: t("auth-hook.two-factor-recovery-regenerate-success"),
		});
		setLoading(false);
		return result;
	};

	// Get Two-Factor Secret Key
	const getTwoFactorSecretKey = async (): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiGetTwoFactorSecretKey(),
			successMessage: t("auth-hook.two-factor-secret-success"),
		});
		setLoading(false);
		return result;
	};

	const updatePreferredLanguage = async (newLanguage: string): Promise<ApiHandlerResult> => {
		setLoading(true);
		const result = await handleApiRequest({
			apiCall: () => apiUpdatePreferredLanguage(newLanguage),
			successMessage: t("auth-hook.language-success"),
		});
		setLoading(false);
		return result;
	};

	return {
		user,
		loading,
		register,
		login,
		loadUser,
		getFreshUser,
		logout,
		forgotPassword,
		resetPassword,
		resendEmailVerification,
		getRoles,
		getPermissions,
		hasRole,
		hasPermission,
		verifyEmail,
		changeInformations,
		changePassword,
		twoFactorChallenge,
		confirmPassword,
		getConfirmedPasswordStatus,
		confirmTwoFactorAuthentication,
		enableTwoFactorAuthentication,
		disableTwoFactorAuthentication,
		getTwoFactorQrCode,
		getTwoFactorRecoveryCodes,
		regenerateTwoFactorRecoveryCodes,
		getTwoFactorSecretKey,
		updatePreferredLanguage,
	};
};
