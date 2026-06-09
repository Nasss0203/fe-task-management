"use client";

import type { AdminFindAllWorkspaceQuery } from "@/services/admin/workspace/type";
import {
	getAdminBillingPlansApi,
	grantAdminBillingSubscriptionApi,
	revokeAdminBillingSubscriptionApi,
} from "@/services/admin/billing/billing-admin.service";
import {
	findAllWorkspaceManagementApi,
	updateWorkspacePlanManagementApi,
} from "@/services/admin/workspace/workspace-management.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ADMIN_WORKSPACES_KEY = {
	WORKSPACE_LIST: "ADMIN_WORKSPACE_LIST",
	BILLING_PLANS: "ADMIN_WORKSPACE_BILLING_PLANS",
} as const;

export const useAdminWorkspaces = (query?: AdminFindAllWorkspaceQuery) => {
	const queryClient = useQueryClient();

	const workspaces = useQuery({
		queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST, query],
		queryFn: () => findAllWorkspaceManagementApi(query),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const updatePlan = useMutation({
		mutationFn: updateWorkspacePlanManagementApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST],
			});
		},
	});

	const billingPlans = useQuery({
		queryKey: [ADMIN_WORKSPACES_KEY.BILLING_PLANS],
		queryFn: getAdminBillingPlansApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const refreshWorkspaces = async () => {
		await queryClient.invalidateQueries({
			queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST],
		});
	};

	const grantSubscription = useMutation({
		mutationFn: grantAdminBillingSubscriptionApi,
		onSuccess: refreshWorkspaces,
	});

	const revokeSubscription = useMutation({
		mutationFn: revokeAdminBillingSubscriptionApi,
		onSuccess: refreshWorkspaces,
	});

	return {
		workspaces,
		updatePlan,
		billingPlans,
		grantSubscription,
		revokeSubscription,
	};
};
