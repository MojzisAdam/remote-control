/**
 * Error handler for network, CSRF, and session issues
 */
let networkErrorCallback = null;
let csrfFailureCallback = null;
let sessionExpiredCallback = null;

/**
 * Register a callback for network errors.
 * @param {(message: string) => void} callback
 */
export const registerNetworkErrorCallback = (callback) => {
	networkErrorCallback = callback;
};

/**
 * Register a callback for CSRF failures.
 * @param {(message: string) => void} callback
 */
export const registerCsrfFailureCallback = (callback) => {
	csrfFailureCallback = callback;
};

/**
 * Register a callback for session expiration.
 * @param {(message: string) => void} callback
 */
export const registerSessionExpiredCallback = (callback) => {
	sessionExpiredCallback = callback;
};

/**
 * Trigger the network error callback.
 * @param {string} message
 */
export const handleNetworkError = (message) => {
	if (networkErrorCallback) {
		networkErrorCallback(message);
	}
};

/**
 * Trigger the CSRF failure callback.
 * @param {string} message
 */
export const handleCsrfFailure = (message) => {
	if (csrfFailureCallback) {
		csrfFailureCallback(message);
	}
};

/**
 * Trigger the session expired callback.
 * @param {string} message
 */
export const handleSessionExpired = (message) => {
	if (sessionExpiredCallback) {
		sessionExpiredCallback(message);
	}
};

// Expose a global reference for components to access if needed
if (typeof window !== "undefined") {
	window.errorAlertContext = window.errorAlertContext || {};
}
