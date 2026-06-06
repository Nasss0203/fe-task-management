"use client";

import {
	getAdminBillingPaymentsApi,
	getAdminBillingPlansApi,
	getAdminBillingSubscriptionsApi,
} from "@/services/admin/billing/billing-admin.service";
import { useQuery } from "@tanstack/react-query";

export const ADMIN_BILLING_KEY = {
	PLANS: "ADMIN_BILLING_PLANS",
	SUBSCRIPTIONS: "ADMIN_BILLING_SUBSCRIPTIONS",
	PAYMENTS: "ADMIN_BILLING_PAYMENTS",
} as const;

export const useAdminBilling = () => {
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

	return {
		plans,
		subscriptions,
		payments,
	};
};
