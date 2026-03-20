import instance from "../axios";
import { AuthResponse, LoginDto, RegisterDto } from "./type";

export const login = async (data: LoginDto): Promise<AuthResponse> => {
	const response = await instance.post<AuthResponse>("/auth/login", data);

	if (typeof window !== "undefined") {
		localStorage.setItem("access_token", response.data.accessToken);

		if (response.data.refreshToken) {
			localStorage.setItem("refresh_token", response.data.refreshToken);
		}
	}

	return response.data;
};

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
	const response = await instance.post<AuthResponse>("/auth/register", data);

	if (typeof window !== "undefined") {
		localStorage.setItem("access_token", response.data.accessToken);

		if (response.data.refreshToken) {
			localStorage.setItem("refresh_token", response.data.refreshToken);
		}
	}

	return response.data;
};
