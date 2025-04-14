import { AxiosError } from "axios";
/* eslint-disable @typescript-eslint/no-explicit-any */

interface ErrorResponse {
	message?: string;
}

const getErrorMessage = (error: AxiosError): string => {
	const responseData = error.response?.data as ErrorResponse;
	const statusCode = error.response?.status;
	const serverMessage = responseData?.message;

	const getApiStatusMessage = (statusCode?: number, serverMessage?: string): string => {
		if (serverMessage) {
			return serverMessage;
		}

		const messages: Record<number, string> = {
			// 200: "Request processed successfully.",
			// 201: "The resource has been created successfully.",
			// 204: "The request was successful, but there is no content to return.",
			400: "The request was invalid or cannot be processed.",
			401: "You must be authenticated to access this resource.",
			403: "You do not have permission to access this resource.",
			404: "The resource you are looking for could not be found.",
			422: "The provided data is invalid. Please check your input.",
			429: "You are sending requests too quickly. Please slow down.",
			500: "An unexpected error occurred. Please try again later.",
			503: "The service is currently unavailable. Please try again later.",
		};

		return statusCode ? messages[statusCode] || "An unexpected error occurred. Please try again." : "An unknown error occurred.";
	};

	return statusCode ? getApiStatusMessage(statusCode, serverMessage) : serverMessage || "An unknown error occurred.";
};

type ApiHandlerParams = {
	apiCall: () => Promise<any>;
	onSuccess?: (response: any) => void;
	successMessage: string | null;
	statusHandlers?: Record<number, (error: AxiosError) => void>;
};

export type ApiHandlerResult = {
	success: boolean;
	status: string | null;
	data: any | null;
	errors: Record<string, string[]> | null;
	statusCode: number | null;
};

export const handleApiRequest = async ({ apiCall, onSuccess, successMessage, statusHandlers = {} }: ApiHandlerParams): Promise<ApiHandlerResult> => {
	const result: ApiHandlerResult = {
		success: false,
		status: null,
		data: null,
		errors: null,
		statusCode: null,
	};

	try {
		const response = await apiCall();
		if (onSuccess) {
			onSuccess(response);
		}
		result.success = true;
		result.status = successMessage;
		result.data = response;
		result.statusCode = 200;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.code === "ERR_CANCELED" || error.code === "ECONNABORTED" || (error.message && error.message.includes("aborted")) || !error.response) {
				result.statusCode = -1;
				result.status = "Request was canceled";
				return result;
			}

			const statusCode = error.response?.status ?? null;
			result.statusCode = statusCode;

			let customResult: string | null = null;
			let customMessageSet: boolean = false;
			if (statusCode && statusHandlers[statusCode]) {
				customResult = statusHandlers[statusCode](error) ?? null;
				customMessageSet = true;
			}

			if (customMessageSet) {
				result.status = customResult;
			} else {
				result.status = error.response?.data?.message || getErrorMessage(error);
			}

			result.errors = error.response?.data?.errors || {};
		} else {
			result.status = "Unexpected error occurred. Server may be unreachable, please refresh the page and try again later.";
		}
	}

	return result;
};
