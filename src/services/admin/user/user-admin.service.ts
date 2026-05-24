import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type {
	AdminFindAllUserQuery,
	AdminSystemRole,
	AdminUser,
	AdminUserOverviewResponseDto,
} from "./type";

export const getAdminUserOverviewApi = async (): Promise<
	ApiResponse<AdminUserOverviewResponseDto>
> => {
	const response = await instance.get<
		ApiResponse<AdminUserOverviewResponseDto>
	>("/admin/users/overview");

	return response.data;
};

export const findAllAdminUsersApi = async (
	query?: AdminFindAllUserQuery,
): Promise<ApiResponse<AdminUser[]>> => {
	const response = await instance.get<ApiResponse<AdminUser[]>>(
		"/admin/users",
		{
			params: query,
		},
	);

	return response.data;
};

export const lockAdminUserApi = async (
	userId: string,
): Promise<ApiResponse<null>> => {
	const response = await instance.patch<ApiResponse<null>>(
		`/admin/users/${userId}/lock`,
	);

	return response.data;
};

export const unlockAdminUserApi = async (
	userId: string,
): Promise<ApiResponse<null>> => {
	const response = await instance.patch<ApiResponse<null>>(
		`/admin/users/${userId}/unlock`,
	);

	return response.data;
};

export const updateAdminUserSystemRoleApi = async ({
	userId,
	systemRole,
}: {
	userId: string;
	systemRole: AdminSystemRole;
}): Promise<ApiResponse<null>> => {
	const response = await instance.patch<ApiResponse<null>>(
		`/admin/users/${userId}/system-role`,
		{
			systemRole,
		},
	);

	return response.data;
};
