"use client";

import axios from "axios";
import { useCallback } from "react";

type ApiErrorResponse = {
	code?: string;
};

type ErrorHandlers = {
	[code: string]: (() => void) | undefined;
	default?: () => void;
};

export const useHandleApiError = () => {
	const getErrorCode = useCallback((error: unknown) => {
		if (!axios.isAxiosError<ApiErrorResponse>(error)) {
			return undefined;
		}

		return error.response?.data?.code;
	}, []);

	const handleError = useCallback(
		(error: unknown, handlers: ErrorHandlers) => {
			const code = getErrorCode(error);

			if (code && handlers[code]) {
				handlers[code]?.();
				return code;
			}

			handlers.default?.();
			return code;
		},
		[getErrorCode],
	);

	return {
		getErrorCode,
		handleError,
	};
};

export const useApiErrorHandler = useHandleApiError;
