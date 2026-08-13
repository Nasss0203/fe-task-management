"use client";

import {
	findAllAdminUsersApi,
	createSystemAdminApi,
	getAdminUserOverviewApi,
	lockAdminUserApi,
	unlockAdminUserApi,
} from "@/services/admin/user/user-admin.service";
import type {
	AdminFindAllUserQuery,
	AdminUserPaginationResponse,
	AdminUserStatus,
} from "@/services/admin/user/type";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/features/auth/hooks/useUser";
import { isSystemAdmin } from "@/lib/auth/system-role";

export const ADMIN_USERS_KEY = {
	USER_OVERVIEW: "ADMIN_USER_OVERVIEW",
	USER_LIST: "ADMIN_USER_LIST",
} as const;

export const useAdminUsers = (query?: AdminFindAllUserQuery) => {
	const queryClient = useQueryClient();
	const { user } = useUser();
	const canAccessAdmin = isSystemAdmin(user);

	const userOverview = useQuery({
		queryKey: [ADMIN_USERS_KEY.USER_OVERVIEW],
		queryFn: getAdminUserOverviewApi,
		retry: false,
		refetchOnWindowFocus: false,
		enabled: canAccessAdmin,
	});

	const users = useQuery<ApiResponse<AdminUserPaginationResponse>>({
		queryKey: [ADMIN_USERS_KEY.USER_LIST, query],
		queryFn: () => findAllAdminUsersApi(query),
		retry: false,
		refetchOnWindowFocus: false,
		enabled: canAccessAdmin,
	});

	const setUserStatusInCache = (
		userId: string,
		status: AdminUserStatus,
	) => {
		queryClient.setQueriesData<ApiResponse<AdminUserPaginationResponse>>(
			{ queryKey: [ADMIN_USERS_KEY.USER_LIST] },
			(current) => {
				if (!current?.data?.data) return current;

				let changed = false;
				const data = current.data.data.map((item) => {
					if (item.id !== userId || item.status === status) return item;

					changed = true;
					return {
						...item,
						status,
					};
				});

				return changed
					? {
							...current,
							data: {
								...current.data,
								data,
							},
						}
					: current;
			},
		);
	};

	const refreshUsers = async () => {
		await Promise.all([
			queryClient.refetchQueries({
				queryKey: [ADMIN_USERS_KEY.USER_OVERVIEW],
				type: "active",
			}),
			queryClient.refetchQueries({
				queryKey: [ADMIN_USERS_KEY.USER_LIST],
				type: "active",
			}),
			queryClient.refetchQueries({
				queryKey: ["ADMIN_WORKSPACE_LIST"],
				type: "active",
			}),
		]);
	};

	const lockUser = useMutation({
		mutationFn: lockAdminUserApi,
		onSuccess: async (_, userId) => {
			setUserStatusInCache(userId, "LOCKED");
			await refreshUsers();
		},
	});

	const createSystemAdmin = useMutation({
		mutationFn: createSystemAdminApi,
		onSuccess: refreshUsers,
	});

	const unlockUser = useMutation({
		mutationFn: unlockAdminUserApi,
		onSuccess: async (_, userId) => {
			setUserStatusInCache(userId, "ACTIVE");
			await refreshUsers();
		},
	});

	return {
		userOverview,
		users,
		lockUser,
		createSystemAdmin,
		unlockUser,
	};
};
