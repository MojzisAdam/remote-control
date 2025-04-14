import Axios from "axios";
import Cookies from "js-cookie";
import { handleNetworkError, handleCsrfFailure, handleSessionExpired } from "./errorHandler";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_RAW_BASE = import.meta.env.VITE_API_URL_BASE || "http://localhost:8000";

// Base configuration
const baseConfig = {
	baseURL: API_BASE,
	withCredentials: true,
	withXSRFToken: true,
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",
	headers: {
		"X-Requested-With": "XMLHttpRequest",
		Accept: "application/json",
		"Accept-Language": "cs",
	},
	timeout: 10000,
};

// Create axios instances
const axios = Axios.create(baseConfig);
const axiosNoInterceptor = Axios.create({
	...baseConfig,
	baseURL: API_RAW_BASE,
});

// CSRF token handling
let pendingTokenRefresh = null;
let csrfFetchAttempts = 0;
const MAX_CSRF_ATTEMPTS = 3;
let csrfFailureTimestamp = null;
const CSRF_RETRY_COOLDOWN = 30000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const calculateRetryDelay = (retryCount) => {
	return Math.min(500 * Math.pow(2, retryCount) + Math.random() * 200 - 100, 5000);
};

export const fetchCsrfToken = async () => {
	if (!navigator.onLine) {
		console.warn("Offline: Skipping CSRF fetch");
		return false;
	}

	if (pendingTokenRefresh) {
		return pendingTokenRefresh;
	}
	try {
		pendingTokenRefresh = (async () => {
			const csrfToken = Cookies.get("XSRF-TOKEN");

			if (csrfToken) {
				csrfFetchAttempts = 0;
				csrfFailureTimestamp = null;
				return true;
			}

			if (csrfFailureTimestamp && Date.now() - csrfFailureTimestamp < CSRF_RETRY_COOLDOWN) {
				console.warn("CSRF fetch in cooldown period after multiple failures");
				return false;
			}

			csrfFetchAttempts++;

			try {
				await axiosNoInterceptor.get("/sanctum/csrf-cookie");

				await delay(100);

				const newToken = Cookies.get("XSRF-TOKEN");
				if (newToken) {
					csrfFetchAttempts = 0;
					csrfFailureTimestamp = null;
					return true;
				}
			} catch (err) {
				console.warn("CSRF token fetch failed:", err.message);
			}

			if (csrfFetchAttempts >= MAX_CSRF_ATTEMPTS) {
				csrfFailureTimestamp = Date.now();
				handleCsrfFailure("Unable to secure communication with the server");
			}

			return false;
		})();
		return await pendingTokenRefresh;
	} finally {
		pendingTokenRefresh = null;
	}
};

// Request interceptor
axios.interceptors.request.use(
	async (config) => {
		try {
			if (!navigator.onLine) {
				handleNetworkError("You are currently offline. Please check your connection.");
				return Promise.reject(new Error("Offline - cannot send request"));
			}

			const csrfSuccess = await fetchCsrfToken();
			if (!csrfSuccess) {
				console.error("CSRF token fetch failed, aborting request");
				return Promise.reject(new Error("CSRF token fetch failed, aborting request"));
			}

			if (!config.headers["Content-Type"]) {
				config.headers["Content-Type"] = "application/json";
			}

			config.metadata = { startTime: new Date() };
			return config;
		} catch (error) {
			console.error("Request interceptor error:", error);
			return Promise.reject(error);
		}
	},
	(error) => {
		console.error("Request preparation failed:", error);
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(response) => {
		const requestTime = response.config.metadata ? new Date() - response.config.metadata.startTime : 0;
		response.metadata = { requestTime };

		return response;
	},
	async (error) => {
		if (!error.response) {
			const isNetworkError =
				error.message?.includes("Network Error") ||
				error.message?.includes("ENOTFOUND") ||
				error.message?.includes("ERR_NAME_NOT_RESOLVED") ||
				error.message?.includes("NS_ERROR_UNKNOWN_HOST");

			if (isNetworkError) {
				console.warn("Network error (DNS or CORS?) - will attempt CSRF refresh");

				if (!navigator.onLine) {
					handleNetworkError("You are currently offline. Please check your connection.");
					return Promise.reject(new Error("Network error - you are offline"));
				}

				const timerId = setTimeout(() => {
					handleNetworkError("Connection issue detected. Please check your network or try refreshing the page.");
				}, 2000);

				try {
					Cookies.remove("XSRF-TOKEN");
					const csrfSuccess = await fetchCsrfToken();
					if (csrfSuccess) {
						clearTimeout(timerId);
						const retryCount = error.config._retryCount || 0;
						if (retryCount < 2) {
							error.config._retryCount = retryCount + 1;
							const retryDelay = calculateRetryDelay(retryCount);
							console.log(`Retrying request in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);
							await delay(retryDelay);
							return axios.request(error.config);
						}
					}
				} catch (refreshError) {
					console.error("Session refresh failed:", refreshError);
				}

				return Promise.reject(new Error("Network error - please check your connection or refresh the page"));
			}
			return Promise.reject(error);
		}

		const { status, config } = error.response;

		const retryCount = config._retryCount || 0;
		if (retryCount >= 2) {
			return Promise.reject(error);
		}

		// Handle specific status codes
		switch (status) {
			case 419: // CSRF token mismatch
				console.warn("CSRF Token expired. Refreshing...");
				await fetchCsrfToken();
				config._retryCount = retryCount + 1;

				const retryDelay = calculateRetryDelay(retryCount);
				console.log(`Retrying request after CSRF refresh in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);
				await delay(retryDelay);

				return axios.request(config);

			case 401: // Unauthorized
				console.warn("Authentication required");
				handleSessionExpired("Session expired. Please log in again.");
				break;

			case 403: // Forbidden
				console.warn("Permission denied");
				break;

			case 429: // Too Many Requests
				console.warn("Rate limit exceeded");
				if (retryCount < 2) {
					config._retryCount = retryCount + 1;
					const retryAfter = error.response.headers["retry-after"] || Math.pow(2, retryCount + 1) * 1000;
					console.log(`Rate limited. Retrying in ${retryAfter}ms (attempt ${retryCount + 1}/3)`);
					await delay(parseInt(retryAfter, 10));
					return axios.request(config);
				}
				break;

			case 500:
			case 502:
			case 503:
			case 504:
				console.error(`Server error: ${status}`);
				if (retryCount < 2) {
					config._retryCount = retryCount + 1;
					const serverRetryDelay = calculateRetryDelay(retryCount);
					console.log(`Server error. Retrying in ${serverRetryDelay}ms (attempt ${retryCount + 1}/3)`);
					await delay(serverRetryDelay);
					return axios.request(config);
				}
				break;
		}

		return Promise.reject(error);
	}
);

axiosNoInterceptor.interceptors.response.use(
	(response) => response,
	(error) => {
		return Promise.reject(error);
	}
);

// Language handling
export const setLanguageHeader = (lang) => {
	if (lang && typeof lang === "string") {
		axios.defaults.headers["Accept-Language"] = lang;
	}
};

const initListeners = () => {
	const handleOnlineStatusChange = () => {
		if (navigator.onLine) {
			fetchCsrfToken();
		}
	};

	window.addEventListener("focus", () => {
		if (navigator.onLine) fetchCsrfToken();
	});
	window.addEventListener("online", handleOnlineStatusChange);
	window.addEventListener("offline", handleOnlineStatusChange);
};

initListeners();

export default axios;
