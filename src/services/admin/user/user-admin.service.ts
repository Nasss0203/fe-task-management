import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type {
	AdminFindAllUserQuery,
	AdminUser,
	AdminUserPaginationResponse,
	AdminUserOverviewResponseDto,
	CreateSystemAdminDto,
	CreateSystemAdminResponse,
} from "./type";

export const createSystemAdminApi = async (
	payload: CreateSystemAdminDto,
): Promise<ApiResponse<CreateSystemAdminResponse>> => {
	const response = await instance.post<ApiResponse<CreateSystemAdminResponse>>(
		"/admin/system-admins",
		payload,
	);

	return response.data;
};

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
	const { page, pageSize, ...serverQuery } = query ?? {};
	const response = await instance.get<
		ApiResponse<AdminUser[] | AdminUserPaginationResponse>
	>(
		"/admin/users",
		{
			params: serverQuery,
		},
	);

	if (Array.isArray(response.data.data)) {
		const total = response.data.data.length;
		const normalizedPageSize = pageSize ?? total;

		return {
			...response.data,
			data: {
				data: response.data.data,
				total,
				page: page ?? 1,
				pageSize: normalizedPageSize,
				totalPages:
					normalizedPageSize > 0
						? Math.ceil(total / normalizedPageSize)
						: 0,
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
