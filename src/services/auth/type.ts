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

export interface AuthGetMeResponse {
	data: {
		id: string;
		email: string;
		username: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
		// avatarUrl?: string;
	};
}

export interface GetMeResponse {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	avatarUrl?: string;
}
