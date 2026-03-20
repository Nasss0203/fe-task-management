import instance from "../axios";
import { AuthGetMeResponse, AuthResponse, LoginDto, RegisterDto } from "./type";

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
