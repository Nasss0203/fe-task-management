import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { getBillingPlans } from "@/entities/billing/api/billing.api";
import { billingKeys } from "@/entities/billing/model/billing.queries";
import { workspaceApi } from "@/entities/workspace/api/workspace.api";
import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";

import { describePlanLimit, getPlanLimitError, type PlanLimitError } from "../lib/plan-limit";
import { usePlanLimitDialog } from "./use-plan-limit-dialog";

async function loadCanManageBilling(queryClient: QueryClient, workspaceId: string | undefined) {
	if (!workspaceId) return undefined;
	try {
		const access = await queryClient.ensureQueryData({
			queryKey: workspaceKeys.access(workspaceId),
			queryFn: ({ signal }) => workspaceApi.getAccess(workspaceId, signal),
		});
		return access.permissions.includes("workspace.update");
	} catch {
		return undefined;
	}
}

async function loadPlans(queryClient: QueryClient) {
	try {
		const plans = await queryClient.ensureQueryData({
			queryKey: billingKeys.plans(),
			queryFn: getBillingPlans,
		});
		return plans.items;
	} catch {
		return undefined;
	}
}

async function showPlanLimitDialog(
	queryClient: QueryClient,
	workspaceId: string | undefined,
	limitError: PlanLimitError,
) {
	const [plans, canManageBilling] = await Promise.all([
		loadPlans(queryClient),
		loadCanManageBilling(queryClient, workspaceId),
	]);
	usePlanLimitDialog.getState().show(describePlanLimit(limitError, plans, canManageBilling));
}

export function usePlanLimitNotifier(workspaceId: string | undefined) {
	const queryClient = useQueryClient();

	return useCallback(
		(error: unknown): boolean => {
			const limitError = getPlanLimitError(error);
			if (!limitError) return false;

			void showPlanLimitDialog(queryClient, workspaceId, limitError);
			return true;
		},
		[queryClient, workspaceId],
	);
}
