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
