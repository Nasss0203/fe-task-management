import axios from "axios";

type ApiErrorResponse = {
	code?: string;
	message?: unknown;
};

type ErrorCodeMessages = Record<string, string | undefined>;

export const getApiErrorCode = (error: unknown) => {
	if (!axios.isAxiosError<ApiErrorResponse>(error)) {
		return undefined;
	}

	return error.response?.data?.code;
};

export const getFriendlyApiErrorMessage = (
	error: unknown,
	fallback: string,
	codeMessages: ErrorCodeMessages = {},
) => {
	const code = getApiErrorCode(error);

	if (code && codeMessages[code]) {
		return codeMessages[code];
	}

	return fallback;
};

/**
 * The backend's own message (a string or a list of validation messages), for
 * flows where the exact reason helps, e.g. creator forms. Use
 * getFriendlyApiErrorMessage when only code-mapped copy should be shown.
 */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
	if (!axios.isAxiosError<{ message?: string | string[] }>(error)) {
		return fallback;
	}
	const message = [error.response?.data?.message]
		.flat()
		.filter(Boolean)
		.join(", ");
	return message || fallback;
};
