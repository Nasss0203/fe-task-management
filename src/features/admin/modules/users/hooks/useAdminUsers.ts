"use client";

import { getUserGrowthApi } from "@/services/admin/dashboard/user-growth";
import {
	findAllAdminUsersApi,
	getAdminUserOverviewApi,
	lockAdminUserApi,
	unlockAdminUserApi,
	updateAdminUserSystemRoleApi,
} from "@/services/admin/user/user-admin.service";
import type { UserGrowthPeriod } from "@/services/admin/dashboard/type";
import type {
	AdminFindAllUserQuery,
	AdminUserPaginationResponse,
} from "@/services/admin/user/type";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ADMIN_USERS_KEY = {
	USER_OVERVIEW: "ADMIN_USER_OVERVIEW",
	USER_LIST: "ADMIN_USER_LIST",
	USER_GROWTH: "ADMIN_USER_GROWTH",
} as const;

export const useAdminUsers = (
	query?: AdminFindAllUserQuery,
	userGrowthPeriod: UserGrowthPeriod = "7d",
) => {
	const queryClient = useQueryClient();

	const userOverview = useQuery({
		queryKey: [ADMIN_USERS_KEY.USER_OVERVIEW],
		queryFn: getAdminUserOverviewApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const users = useQuery<ApiResponse<AdminUserPaginationResponse>>({
		queryKey: [ADMIN_USERS_KEY.USER_LIST, query],
		queryFn: () => findAllAdminUsersApi(query),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const userGrowth = useQuery({
		queryKey: [ADMIN_USERS_KEY.USER_GROWTH, userGrowthPeriod],
		queryFn: () => getUserGrowthApi(userGrowthPeriod),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const invalidateUsers = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: [ADMIN_USERS_KEY.USER_OVERVIEW],
			}),
			queryClient.invalidateQueries({
				queryKey: [ADMIN_USERS_KEY.USER_LIST],
			}),
		]);
	};

	const lockUser = useMutation({
		mutationFn: lockAdminUserApi,
		onSuccess: invalidateUsers,
	});

	const unlockUser = useMutation({
		mutationFn: unlockAdminUserApi,
		onSuccess: invalidateUsers,
	});

	const updateSystemRole = useMutation({
		mutationFn: updateAdminUserSystemRoleApi,
		onSuccess: invalidateUsers,
	});

	return {
		userOverview,
		users,
		userGrowth,
		lockUser,
		unlockUser,
		updateSystemRole,
	};
};
