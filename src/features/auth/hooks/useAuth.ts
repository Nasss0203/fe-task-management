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
import { GetMeResponse, LoginDto, RegisterDto } from "@/services/auth/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type AuthSessionResponse = {
	data?: {
		access_token?: string;
		refresh_token?: string;
	};
};

const persistAuthSession = async (
	result: AuthSessionResponse,
): Promise<GetMeResponse | undefined> => {
	const accessToken = result.data?.access_token;

	if (!accessToken) {
		return undefined;
	}

	if (typeof window !== "undefined") {
		setStoredAccessToken(accessToken);

		if (result.data?.refresh_token) {
			await setSessionCookie(result.data.refresh_token);
		}
	}

	const me = await getMeApi();
	const userData = me.data;
	setStoredUser(userData);

	return userData;
};

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginDto) => {
			const result = await loginApi(data);
			const userData = await persistAuthSession(result);

			if (!userData) {
				throw new Error("No access token returned from login");
			}

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

			// Token is no longer returned or set on registration
			// User must verify email first
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

export const useVerifyEmail = () => {
	return useMutation({
		mutationFn: async (data: { token: string }) => {
			const { verifyEmailApi } = await import("@/services/auth/auth.service");
			const result = await verifyEmailApi(data);
			return persistAuthSession(result);
		},
	});
};

export const useResendVerification = () => {
	return useMutation({
		mutationFn: async (data: { email: string }) => {
			const { resendVerificationApi } = await import("@/services/auth/auth.service");
			return resendVerificationApi(data);
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (data: { email: string }) => {
			const { forgotPasswordApi } = await import("@/services/auth/auth.service");
			return forgotPasswordApi(data);
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async (data: { token: string; newPassword: string }) => {
			const { resetPasswordApi } = await import("@/services/auth/auth.service");
			return resetPasswordApi(data);
		},
	});
};

export const useVerifyActivationToken = (token: string) => {
	return useQuery({
		queryKey: ["verify-activation-token", token],
		queryFn: async () => {
			const { verifyActivationTokenApi } = await import("@/services/auth/auth.service");
			const response = await verifyActivationTokenApi(token);
			return response.data;
		},
		enabled: !!token,
		retry: false,
	});
};

export const useActivateAdmin = () => {
	return useMutation({
		mutationFn: async (data: { token: string; password: string }) => {
			const { activateAdminApi } = await import("@/services/auth/auth.service");
			const result = await activateAdminApi(data);
			return persistAuthSession(result);
		},
	});
};
