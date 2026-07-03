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
