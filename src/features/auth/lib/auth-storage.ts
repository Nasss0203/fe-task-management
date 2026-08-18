"use client";

export const USER_STORAGE_KEY = "user";
export const AUTH_TOKEN_CHANGED_EVENT = "auth:token-changed";
export const USER_STORAGE_CHANGED_EVENT = "auth:user-changed";

// In-memory storage for access token to prevent XSS
let inMemoryAccessToken: string | null = null;

export const getStoredAccessToken = () => {
	return inMemoryAccessToken;
};

export const setStoredAccessToken = (token: string) => {
	inMemoryAccessToken = token;
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent<string | null>(AUTH_TOKEN_CHANGED_EVENT, {
				detail: token,
			}),
		);
	}
};

export const clearStoredAccessToken = () => {
	inMemoryAccessToken = null;
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent<string | null>(AUTH_TOKEN_CHANGED_EVENT, {
				detail: null,
			}),
		);
	}
};

// API Helpers for HttpOnly Cookies
export const setSessionCookie = async (refreshToken: string) => {
	try {
		await fetch("/api/auth/session", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: refreshToken }),
		});
	} catch (error) {
		console.error("Failed to set session cookie", error);
	}
};

export const clearSessionCookie = async () => {
	try {
		await fetch("/api/auth/session", {
			method: "DELETE",
		});
	} catch (error) {
		console.error("Failed to clear session cookie", error);
	}
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

export const clearStoredAuth = async () => {
	clearStoredAccessToken();
	clearStoredUser();
	await clearSessionCookie();
};
