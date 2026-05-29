"use client";

import {
	clearStoredAuth,
	getStoredRefreshToken,
	setStoredAccessToken,
	setStoredRefreshToken,
	setStoredUser,
} from "@/lib/auth-storage";
import {
	getMeApi,
	loginApi,
	logoutApi,
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
					setStoredRefreshToken(result.data.refresh_token);
				}
			}

			return result;
		},
		onSuccess: async () => {
			const me = await getMeApi();

			const data = me.data;
			setStoredUser(data);

			return data;
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
					setStoredRefreshToken(result.data.refresh_token);
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
		mutationFn: () => logoutApi(getStoredRefreshToken()),
		onSettled: () => {
			clearStoredAuth();
			queryClient.clear();
			router.replace("/");
		},
	});
};
