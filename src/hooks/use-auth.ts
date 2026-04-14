"use client";

import { getMeApi, loginApi, registerApi } from "@/services/auth/auth.service";
import { LoginDto, RegisterDto } from "@/services/auth/type";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginDto) => {
			const result = await loginApi(data);

			if (typeof window !== "undefined") {
				localStorage.setItem("access_token", result.data.access_token);

				if (result.data.refresh_token) {
					localStorage.setItem(
						"refresh_token",
						result.data.refresh_token,
					);
				}
			}

			return result;
		},
		onSuccess: async () => {
			const me = await getMeApi();

			const data = me.data;
			if (typeof window !== "undefined") {
				localStorage.setItem("user", JSON.stringify(data));
			}

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
				localStorage.setItem("access_token", result.data.access_token);

				if (result.data.refresh_token) {
					localStorage.setItem(
						"refresh_token",
						result.data.refresh_token,
					);
				}
			}

			return result;
		},
	});
};
