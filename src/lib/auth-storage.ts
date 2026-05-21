"use client";

export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_TOKEN_CHANGED_EVENT = "auth:token-changed";

export const getStoredAccessToken = () => {
	if (typeof window === "undefined") {
		return null;
	}

	return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredAccessToken = (token: string) => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.setItem(ACCESS_TOKEN_KEY, token);
	window.dispatchEvent(
		new CustomEvent<string | null>(AUTH_TOKEN_CHANGED_EVENT, {
			detail: token,
		}),
	);
};

export const clearStoredAccessToken = () => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.dispatchEvent(
		new CustomEvent<string | null>(AUTH_TOKEN_CHANGED_EVENT, {
			detail: null,
		}),
	);
};
