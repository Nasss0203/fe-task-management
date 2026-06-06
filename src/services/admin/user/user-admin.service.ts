import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type {
	AdminFindAllUserQuery,
	AdminSystemRole,
	AdminUser,
	AdminUserPaginationResponse,
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
): Promise<ApiResponse<AdminUserPaginationResponse>> => {
	const response = await instance.get<
		ApiResponse<AdminUser[] | AdminUserPaginationResponse>
	>(
		"/admin/users",
		{
			params: query,
		},
	);

	if (Array.isArray(response.data.data)) {
		return {
			...response.data,
			data: {
				data: response.data.data,
				total: response.data.data.length,
				page: query?.page ?? 1,
				pageSize: query?.pageSize ?? response.data.data.length,
				totalPages: 1,
			},
		};
	}

	return response.data as ApiResponse<AdminUserPaginationResponse>;
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
