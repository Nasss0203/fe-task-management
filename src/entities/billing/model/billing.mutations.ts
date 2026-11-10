import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	cancelWorkspaceSubscription,
	resumeWorkspaceSubscription,
} from "../api/billing.api";
import { billingKeys } from "./billing.queries";

import type { WorkspaceSubscription } from "./billing.types";

function useSubscriptionMutation(
	workspaceId: string,
	mutationFn: (workspaceId: string) => Promise<WorkspaceSubscription>,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => mutationFn(workspaceId),
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: billingKeys.workspaceSubscription(workspaceId),
				}),
				queryClient.invalidateQueries({
					queryKey: billingKeys.workspaceEntitlements(workspaceId),
				}),
			]),
	});
}

export function useCancelSubscription(workspaceId: string) {
	return useSubscriptionMutation(workspaceId, cancelWorkspaceSubscription);
}

export function useResumeSubscription(workspaceId: string) {
	return useSubscriptionMutation(workspaceId, resumeWorkspaceSubscription);
}
