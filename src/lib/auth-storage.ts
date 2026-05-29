"use client";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_STORAGE_KEY = "user";
export const AUTH_TOKEN_CHANGED_EVENT = "auth:token-changed";
export const USER_STORAGE_CHANGED_EVENT = "auth:user-changed";

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

export const getStoredRefreshToken = () => {
	if (typeof window === "undefined") {
		return null;
	}

	return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredRefreshToken = (token: string) => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearStoredRefreshToken = () => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setStoredUser = (value: unknown) => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
	window.dispatchEvent(new Event(USER_STORAGE_CHANGED_EVENT));
};

export const clearStoredUser = () => {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.removeItem(USER_STORAGE_KEY);
	window.dispatchEvent(new Event(USER_STORAGE_CHANGED_EVENT));
};

export const clearStoredAuth = () => {
	clearStoredAccessToken();
	clearStoredRefreshToken();
	clearStoredUser();
};
