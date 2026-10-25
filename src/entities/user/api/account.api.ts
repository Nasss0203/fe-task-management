import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type { Account } from "../model/user.types";

const ACCOUNT_API = "/users/me";

export const accountApi = {
	get: async (signal?: AbortSignal): Promise<Account> => {
		const response = await instance.get<ApiResponse<Account>>(ACCOUNT_API, {
			signal,
		});
		return response.data.data;
	},

	updateUsername: async (username: string): Promise<Account> => {
		const response = await instance.patch<ApiResponse<Account>>(ACCOUNT_API, {
			username,
		});
		return response.data.data;
	},

	uploadAvatar: async (file: File): Promise<Account> => {
		const formData = new FormData();
		formData.append("file", file);
		const response = await instance.put<ApiResponse<Account>>(
			`${ACCOUNT_API}/avatar`,
			formData,
		);
		return response.data.data;
	},

	removeAvatar: async (): Promise<Account> => {
		const response = await instance.delete<ApiResponse<Account>>(
			`${ACCOUNT_API}/avatar`,
		);
		return response.data.data;
	},

	changePassword: async (input: {
		currentPassword?: string;
		newPassword: string;
	}): Promise<void> => {
		await instance.post(`${ACCOUNT_API}/password`, input);
	},
};
