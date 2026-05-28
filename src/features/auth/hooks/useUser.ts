"use client";
import { GetMeResponse } from "@/services/auth/type";
import { useCallback, useState } from "react";

const USER_KEY = "user";

export const useUser = () => {
	const [user, setUserState] = useState<GetMeResponse | undefined>(() => {
		if (typeof window === "undefined") return undefined;
		try {
			const raw = localStorage.getItem(USER_KEY);
			return raw ? JSON.parse(raw) : undefined;
		} catch {
			return undefined;
		}
	});

	const setUser = useCallback((value: GetMeResponse | undefined) => {
		setUserState(value);
		if (value) {
			localStorage.setItem(USER_KEY, JSON.stringify(value));
		} else {
			localStorage.removeItem(USER_KEY);
		}
	}, []);

	return { user, setUser };
};
