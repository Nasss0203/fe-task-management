import type { User } from "@/entities/user";

export type { GetMeResponse, User } from "@/entities/user";
export { SystemRole } from "@/entities/user";

export interface LoginDto {
	email: string;
	password: string;
}

export interface RegisterDto {
	username: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	data: {
		access_token: string;
		refresh_token?: string;
	};
}

export interface VerifyEmailResponse {
	data?: {
		access_token?: string;
		refresh_token?: string;
		success?: boolean;
	};
	success?: boolean;
}

export interface LogoutResponse {
	data?: {
		success: boolean;
	};
	success?: boolean;
}

export interface AuthGetMeResponse {
	data: User;
}
