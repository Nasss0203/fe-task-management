"use client";

import {
	cancelAdminBillingSubscriptionApi,
	createAdminBillingPlanApi,
	getAdminBillingPaymentsApi,
	getAdminBillingPlansApi,
	getAdminBillingSubscriptionsApi,
	resumeAdminBillingSubscriptionApi,
	updateAdminBillingPlanApi,
	updateAdminBillingPlanStatusApi,
} from "@/services/admin/billing/billing-admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ADMIN_BILLING_KEY = {
	PLANS: "ADMIN_BILLING_PLANS",
	SUBSCRIPTIONS: "ADMIN_BILLING_SUBSCRIPTIONS",
	PAYMENTS: "ADMIN_BILLING_PAYMENTS",
} as const;

export const useAdminBilling = () => {
	const queryClient = useQueryClient();

	const plans = useQuery({
		queryKey: [ADMIN_BILLING_KEY.PLANS],
		queryFn: getAdminBillingPlansApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const payments = useQuery({
		queryKey: [ADMIN_BILLING_KEY.PAYMENTS],
		queryFn: getAdminBillingPaymentsApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const subscriptions = useQuery({
		queryKey: [ADMIN_BILLING_KEY.SUBSCRIPTIONS, payments.data],
		queryFn: () => getAdminBillingSubscriptionsApi(payments.data ?? []),
		retry: false,
		refetchOnWindowFocus: false,
		enabled: !payments.isLoading,
	});

	const invalidatePlans = async () => {
		await queryClient.invalidateQueries({
			queryKey: [ADMIN_BILLING_KEY.PLANS],
		});
	};

	const invalidateSubscriptions = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: [ADMIN_BILLING_KEY.PAYMENTS],
			}),
			queryClient.invalidateQueries({
				queryKey: [ADMIN_BILLING_KEY.SUBSCRIPTIONS],
			}),
		]);
	};

	const createPlan = useMutation({
		mutationFn: createAdminBillingPlanApi,
		onSuccess: invalidatePlans,
	});

	const updatePlan = useMutation({
		mutationFn: updateAdminBillingPlanApi,
		onSuccess: invalidatePlans,
	});

	const updatePlanStatus = useMutation({
		mutationFn: updateAdminBillingPlanStatusApi,
		onSuccess: invalidatePlans,
	});

	const cancelSubscription = useMutation({
		mutationFn: cancelAdminBillingSubscriptionApi,
		onSuccess: invalidateSubscriptions,
	});

	const resumeSubscription = useMutation({
		mutationFn: resumeAdminBillingSubscriptionApi,
		onSuccess: invalidateSubscriptions,
	});

	return {
		plans,
		subscriptions,
		payments,
		createPlan,
		updatePlan,
		updatePlanStatus,
		cancelSubscription,
		resumeSubscription,
	};
};
