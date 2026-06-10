"use client";

import {
	findAllAdminUsersApi,
	getAdminUserOverviewApi,
	lockAdminUserApi,
	unlockAdminUserApi,
	updateAdminUserSystemRoleApi,
} from "@/services/admin/user/user-admin.service";
import type { AdminFindAllUserQuery } from "@/services/admin/user/type";
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

	const users = useQuery({
		queryKey: [ADMIN_USERS_KEY.USER_LIST, query],
		queryFn: () => findAllAdminUsersApi(query),
		retry: false,
		refetchOnWindowFocus: false,
		enabled: canAccessAdmin,
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
		lockUser,
		unlockUser,
		updateSystemRole,
	};
};
