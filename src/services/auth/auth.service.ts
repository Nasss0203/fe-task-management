import instance from "../axios";
import {
	AuthGetMeResponse,
	AuthResponse,
	LoginDto,
	LogoutResponse,
	RegisterDto,
} from "./type";

export const loginApi = async (data: LoginDto): Promise<AuthResponse> => {
	const response = await instance.post<AuthResponse>("/auth/login", data);
	return response.data;
};

export const registerApi = async (data: RegisterDto): Promise<AuthResponse> => {
	const response = await instance.post<AuthResponse>("/auth/register", data);
	return response.data;
};

export const getMeApi = async (): Promise<AuthGetMeResponse> => {
	const response = await instance.get<AuthGetMeResponse>("/auth/me");
	return response.data;
};

export const refreshTokenApi = async (
	refreshToken?: string | null,
): Promise<AuthResponse> => {
	const response = await instance.post<AuthResponse>("/auth/refresh", {
		refresh_token: refreshToken,
	});
	return response.data;
};

export const logoutApi = async (
	refreshToken?: string | null,
): Promise<LogoutResponse> => {
	const response = await instance.post<LogoutResponse>("/auth/logout", {
		refresh_token: refreshToken,
	});
	return response.data;
};

export const verifyEmailApi = async (data: { token: string }) => {
	const response = await instance.post("/auth/verify-email", data);
	return response.data;
};

export const resendVerificationApi = async (data: { email: string }) => {
	const response = await instance.post("/auth/resend-verification", data);
	return response.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
	const response = await instance.post("/auth/forgot-password", data);
	return response.data;
};

export const resetPasswordApi = async (data: { token: string; newPassword: string }) => {
	const response = await instance.post("/auth/reset-password", data);
	return response.data;
};

