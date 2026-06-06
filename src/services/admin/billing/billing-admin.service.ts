import type { ApiResponse } from "@/services/admin/dashboard/type";
import instance from "@/services/axios";
import {
	normalizeAdminBillingPayment,
	normalizeAdminBillingPlan,
	normalizeAdminBillingSubscription,
	type AdminBillingPayment,
} from "./type";

import type {
	BillingPlan,
	WorkspaceSubscription,
} from "@/components/admin/shared/billing-admin.types";

const unwrapData = <T>(response: ApiResponse<T> | T): T => {
	if (
		typeof response === "object" &&
		response !== null &&
		"data" in response
	) {
		return (response as ApiResponse<T>).data;
	}

	return response as T;
};

export const getAdminBillingPlansApi = async (): Promise<BillingPlan[]> => {
	const response = await instance.get<ApiResponse<unknown[]> | unknown[]>(
		"/admin/billing/plans",
	);
	const data = unwrapData(response.data);

	return Array.isArray(data) ? data.map(normalizeAdminBillingPlan) : [];
};

export const getAdminBillingPaymentsApi = async (): Promise<
	AdminBillingPayment[]
> => {
	const response = await instance.get<ApiResponse<unknown[]> | unknown[]>(
		"/admin/billing/payments",
	);
	const data = unwrapData(response.data);

	return Array.isArray(data) ? data.map(normalizeAdminBillingPayment) : [];
};

export const getAdminBillingSubscriptionsApi = async (
	payments: AdminBillingPayment[] = [],
): Promise<WorkspaceSubscription[]> => {
	const response = await instance.get<ApiResponse<unknown[]> | unknown[]>(
		"/admin/billing/subscriptions",
	);
	const data = unwrapData(response.data);

	return Array.isArray(data)
		? data.map((item) => normalizeAdminBillingSubscription(item, payments))
		: [];
};
