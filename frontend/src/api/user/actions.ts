import { User, CodeData } from "./model";
import axios from "@/utils/axios";

// Register a new user
export const registerUser = async (userData: Partial<User>): Promise<User> => {
	const response = await axios.post("/register", userData);
	return response.data.data;
};

// Login user
export const loginUser = async (credentials: { email: string; password: string; remember: boolean }): Promise<string> => {
	const response = await axios.post("/login", credentials);
	return response.data;
};

// Fetch authenticated user
export const fetchUser = async (): Promise<User> => {
	const response = await axios.get("/user");
	return response.data.data;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
	await axios.post("/logout");
};

export const forgotPassword = async ({ email }: { email: string }): Promise<string> => {
	const response = await axios.post("/forgot-password", { email });
	return response.data.data;
};

export const resetPassword = async ({ token, email, password, password_confirmation }: { token: string; email: string; password: string; password_confirmation: string }): Promise<string> => {
	const response = await axios.post("/reset-password", {
		token,
		email,
		password,
		password_confirmation,
	});
	return response.data.data;
};

export const resendEmailVerification = async (): Promise<string> => {
	const response = await axios.post("/email/verification-notification");
	return response.data.data;
};

export const verifyEmail = async ({ id, hash, query }: { id: string; hash: string; query: string }): Promise<string> => {
	const response = await axios.get(`/email/verify/${id}/${hash}?${query}`);
	return response.data.data;
};

export const changeInformations = async ({ first_name, last_name, email }: { first_name: string; last_name: string; email: string }): Promise<string> => {
	const response = await axios.put("/user/profile-information", {
		first_name,
		last_name,
		email,
	});
	return response.data.data;
};

export const changePassword = async ({ current_password, password, password_confirmation }: { current_password: string; password: string; password_confirmation: string }): Promise<string> => {
	const response = await axios.put("/user/password", {
		current_password,
		password,
		password_confirmation,
	});
	return response.data;
};

// Two-Factor Challenge
export const twoFactorChallenge = async (codeData: CodeData): Promise<string> => {
	const response = await axios.post("/two-factor-challenge", codeData);
	return response.data;
};

// Confirm Password
export const confirmPassword = async (password: string): Promise<string> => {
	const response = await axios.post("/user/confirm-password", { password });
	return response.data;
};

// Confirmed Password Status
export const getConfirmedPasswordStatus = async (): Promise<string> => {
	const response = await axios.get("/user/confirmed-password-status");
	return response.data;
};

// Confirm Two-Factor Authentication
export const confirmTwoFactorAuthentication = async (code: string): Promise<string> => {
	const response = await axios.post("/user/confirmed-two-factor-authentication", { code });
	return response.data;
};

// Enable Two-Factor Authentication
export const enableTwoFactorAuthentication = async (): Promise<string> => {
	const response = await axios.post("/user/two-factor-authentication");
	return response.data;
};

// Disable Two-Factor Authentication
export const disableTwoFactorAuthentication = async (): Promise<string> => {
	const response = await axios.delete("/user/two-factor-authentication");
	return response.data;
};

// Get Two-Factor QR Code
export const getTwoFactorQrCode = async (): Promise<string> => {
	const response = await axios.get("/user/two-factor-qr-code");
	return response.data;
};

// Get Two-Factor Recovery Codes
export const getTwoFactorRecoveryCodes = async (): Promise<string[]> => {
	const response = await axios.get("/user/two-factor-recovery-codes");
	return response.data;
};

// Regenerate Two-Factor Recovery Codes
export const regenerateTwoFactorRecoveryCodes = async (): Promise<string[]> => {
	const response = await axios.post("/user/two-factor-recovery-codes");
	return response.data;
};

// Get Two-Factor Secret Key
export const getTwoFactorSecretKey = async (): Promise<string> => {
	const response = await axios.get("/user/two-factor-secret-key");
	return response.data;
};

// Update users prefered languague
export const updatePreferredLanguage = async (newLanguage: string): Promise<string> => {
	const response = await axios.put('/user/language', { preferred_language: newLanguage })
	return response.data;
};
