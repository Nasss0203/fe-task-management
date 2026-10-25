import { useQuery } from "@tanstack/react-query";

import {
	getBillingPlans,
	getWorkspacePaymentOrders,
	getWorkspaceSubscription,
} from "../api/billing.api";

export const billingKeys = {
	all: ["billing"] as const,
	plans: () => [...billingKeys.all, "plans"] as const,
	workspaceSubscription: (workspaceId: string) =>
		[...billingKeys.all, "workspace-subscription", workspaceId] as const,
	workspacePaymentOrders: (workspaceId: string) =>
		[...billingKeys.all, "workspace-payment-orders", workspaceId] as const,
};

export function useWorkspacePaymentOrders(workspaceId: string, enabled = true) {
	return useQuery({
		queryKey: billingKeys.workspacePaymentOrders(workspaceId),
		queryFn: ({ signal }) => getWorkspacePaymentOrders(workspaceId, signal),
		enabled: enabled && Boolean(workspaceId),
	});
}

export function useBillingPlans() {
	return useQuery({
		queryKey: billingKeys.plans(),
		queryFn: getBillingPlans,
		staleTime: 60_000,
	});
}

export function useWorkspaceSubscription(workspaceId: string) {
	return useQuery({
		queryKey: billingKeys.workspaceSubscription(workspaceId),
		queryFn: ({ signal }) => getWorkspaceSubscription(workspaceId, signal),
		enabled: Boolean(workspaceId),
	});
}
