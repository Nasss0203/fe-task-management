"use client";

import {
	clearStoredAuth,
	setSessionCookie,
	setStoredAccessToken,
	setStoredUser,
} from "@/lib/auth-storage";
import {
	getMeApi,
	loginApi,
	registerApi,
} from "@/services/auth/auth.service";
import { LoginDto, RegisterDto } from "@/services/auth/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginDto) => {
			const result = await loginApi(data);

			if (typeof window !== "undefined") {
				setStoredAccessToken(result.data.access_token);

				if (result.data.refresh_token) {
					await setSessionCookie(result.data.refresh_token);
				}
			}

			const me = await getMeApi();
			const userData = me.data;
			setStoredUser(userData);

			return userData;
		},
		onError: (err) => {
			console.error("login failed", err);
		},
	});
};

export const useRegister = () => {
	return useMutation({
		mutationFn: async (data: RegisterDto) => {
			const result = await registerApi(data);

			if (typeof window !== "undefined") {
				setStoredAccessToken(result.data.access_token);

				if (result.data.refresh_token) {
					await setSessionCookie(result.data.refresh_token);
				}
			}

			return result;
		},
	});
};

export const useLogout = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			// Call local Next.js logout API route which invalidates backend token and clears cookie
			await fetch("/api/auth/logout", { method: "POST" });
		},
		onSettled: async () => {
			await clearStoredAuth();
			queryClient.clear();
			router.replace("/");
		},
	});
};
