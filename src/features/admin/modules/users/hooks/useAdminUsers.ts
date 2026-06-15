"use client";

import {
	findAllAdminUsersApi,
	getAdminUserOverviewApi,
	lockAdminUserApi,
	unlockAdminUserApi,
	updateAdminUserSystemRoleApi,
} from "@/services/admin/user/user-admin.service";
import {
	getAdminBillingPlansApi,
	grantAdminBillingSubscriptionApi,
	revokeAdminBillingSubscriptionApi,
} from "@/services/admin/billing/billing-admin.service";
import type {
	AdminFindAllUserQuery,
	AdminUserPaginationResponse,
} from "@/services/admin/user/type";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/features/auth/hooks/useUser";
import { isSystemAdmin } from "@/lib/auth/system-role";

export const ADMIN_USERS_KEY = {
	USER_OVERVIEW: "ADMIN_USER_OVERVIEW",
	USER_LIST: "ADMIN_USER_LIST",
	BILLING_PLANS: "ADMIN_USER_BILLING_PLANS",
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

	const billingPlans = useQuery({
		queryKey: [ADMIN_USERS_KEY.BILLING_PLANS],
		queryFn: getAdminBillingPlansApi,
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
			queryClient.invalidateQueries({
				queryKey: ["ADMIN_WORKSPACE_LIST"],
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

	const grantSubscription = useMutation({
		mutationFn: grantAdminBillingSubscriptionApi,
		onSuccess: invalidateUsers,
	});

	const revokeSubscription = useMutation({
		mutationFn: revokeAdminBillingSubscriptionApi,
		onSuccess: invalidateUsers,
	});

	return {
		userOverview,
		users,
		billingPlans,
		lockUser,
		unlockUser,
		updateSystemRole,
		grantSubscription,
		revokeSubscription,
	};
};
