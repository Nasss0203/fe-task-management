"use client";
import {
	clearStoredUser,
	setStoredUser,
	USER_STORAGE_CHANGED_EVENT,
	USER_STORAGE_KEY,
} from "@/lib/auth-storage";
import { GetMeResponse } from "@/services/auth/type";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const getUserSnapshot = () => {
	if (typeof window === "undefined") return null;

	return localStorage.getItem(USER_STORAGE_KEY);
};

const subscribeToUserStorage = (callback: () => void) => {
	window.addEventListener(USER_STORAGE_CHANGED_EVENT, callback);
	window.addEventListener("storage", callback);

	return () => {
		window.removeEventListener(USER_STORAGE_CHANGED_EVENT, callback);
		window.removeEventListener("storage", callback);
	};
};

export const useUser = () => {
	const rawUser = useSyncExternalStore(
		subscribeToUserStorage,
		getUserSnapshot,
		() => null,
	);
	const user = useMemo(() => {
		if (!rawUser) return undefined;

		try {
			return JSON.parse(rawUser) as GetMeResponse;
		} catch {
			return undefined;
		}
	}, [rawUser]);

	const setUser = useCallback((value: GetMeResponse | undefined) => {
		if (value) {
			setStoredUser(value);
		} else {
			clearStoredUser();
		}
	}, []);

	return { user, setUser };
};
