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
	PlanBillingInterval,
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

export type AdminBillingPlanPayload = {
	name: string;
	slug: string;
	description?: string | null;
	priceAmount: number;
	currency?: string;
	billingInterval: PlanBillingInterval;
	features?: Record<string, unknown> | null;
	limits?: Record<string, unknown> | null;
	isActive?: boolean;
	sortOrder?: number;
};

export type GrantAdminSubscriptionPayload = {
	workspaceId: string;
	planId: string;
	months?: number;
	note?: string;
};

export type GrantAdminSubscriptionResult = {
	workspaceId: string;
	subscriptionId: string;
	planId: string;
	ownerId: string;
	currentPeriodStart: string;
	currentPeriodEnd: string | null;
};

export type RevokeAdminSubscriptionPayload = {
	workspaceId: string;
	note?: string;
};

export type RevokeAdminSubscriptionResult = {
	workspaceId: string;
	revoked: true;
	subscriptionId: string | null;
};

export type CancelAdminSubscriptionPayload = {
	subscriptionId: string;
	note?: string;
	immediate?: boolean;
};

export type CancelAdminSubscriptionResult = {
	subscriptionId: string;
	cancelled: true;
	status: string;
	cancelAtPeriodEnd: boolean;
	cancelledAt: string;
	currentPeriodEnd: string | null;
	affectedWorkspaceIds: string[];
};

export type ResumeAdminSubscriptionPayload = {
	subscriptionId: string;
	note?: string;
};

export type ResumeAdminSubscriptionResult = {
	subscriptionId: string;
	resumed: true;
	status: string;
	cancelAtPeriodEnd: boolean;
	cancelledAt: string | null;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	affectedWorkspaceIds: string[];
};

const toSlug = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

const toFeatureRecord = (features: string[]) =>
	features.reduce<Record<string, boolean>>((record, feature) => {
		record[feature] = true;
		return record;
	}, {});

const toSafeNumber = (value: number, fallback = 0) =>
	Number.isFinite(value) ? value : fallback;

const getPlanPriceAmount = (plan: BillingPlan) => {
	if (plan.billingInterval === "YEAR") return toSafeNumber(plan.yearlyPrice);
	if (plan.billingInterval === "LIFETIME") {
		return toSafeNumber(plan.priceAmount ?? 0);
	}
	return toSafeNumber(plan.monthlyPrice);
};

export const toAdminBillingPlanPayload = (
	plan: BillingPlan,
): AdminBillingPlanPayload => ({
	name: plan.name,
	slug: toSlug(plan.slug || plan.code || plan.name),
	description: plan.description || null,
	priceAmount: getPlanPriceAmount(plan),
	currency: plan.currency ?? "VND",
	billingInterval: plan.billingInterval ?? "MONTH",
	features: toFeatureRecord(plan.features),
	limits: {
		upgradedWorkspaces: toSafeNumber(plan.workspaceLimit),
		members: toSafeNumber(plan.membersLimit),
		projects: toSafeNumber(plan.projectsLimit),
		storageMb: toSafeNumber(plan.storageLimitGb) * 1024,
	},
	isActive: plan.status === "ACTIVE",
	sortOrder: plan.sortOrder ?? 0,
});

export const getAdminBillingPlansApi = async (): Promise<BillingPlan[]> => {
	const response = await instance.get<ApiResponse<unknown[]> | unknown[]>(
		"/admin/billing/plans",
	);
	const data = unwrapData(response.data);

	return Array.isArray(data) ? data.map(normalizeAdminBillingPlan) : [];
};

export const createAdminBillingPlanApi = async (
	payload: AdminBillingPlanPayload,
): Promise<BillingPlan> => {
	const response = await instance.post<ApiResponse<unknown> | unknown>(
		"/admin/billing/plans",
		payload,
	);
	const data = unwrapData(response.data);

	return normalizeAdminBillingPlan(data);
};

export const updateAdminBillingPlanApi = async ({
	planId,
	payload,
}: {
	planId: string;
	payload: Partial<AdminBillingPlanPayload>;
}): Promise<BillingPlan> => {
	const response = await instance.patch<ApiResponse<unknown> | unknown>(
		`/admin/billing/plans/${planId}`,
		payload,
	);
	const data = unwrapData(response.data);

	return normalizeAdminBillingPlan(data);
};

export const updateAdminBillingPlanStatusApi = async ({
	planId,
	isActive,
}: {
	planId: string;
	isActive: boolean;
}): Promise<BillingPlan> => {
	const response = await instance.patch<ApiResponse<unknown> | unknown>(
		`/admin/billing/plans/${planId}/status`,
		{ isActive },
	);
	const data = unwrapData(response.data);

	return normalizeAdminBillingPlan(data);
};

export const grantAdminBillingSubscriptionApi = async (
	payload: GrantAdminSubscriptionPayload,
): Promise<GrantAdminSubscriptionResult> => {
	const response = await instance.post<
		ApiResponse<GrantAdminSubscriptionResult>
	>("/admin/billing/subscriptions/grant", payload);

	return response.data.data;
};

export const revokeAdminBillingSubscriptionApi = async (
	payload: RevokeAdminSubscriptionPayload,
): Promise<RevokeAdminSubscriptionResult> => {
	const response = await instance.post<
		ApiResponse<RevokeAdminSubscriptionResult>
	>("/admin/billing/subscriptions/revoke", payload);

	return response.data.data;
};

export const cancelAdminBillingSubscriptionApi = async ({
	subscriptionId,
	note,
	immediate = true,
}: CancelAdminSubscriptionPayload): Promise<CancelAdminSubscriptionResult> => {
	const response = await instance.patch<
		ApiResponse<CancelAdminSubscriptionResult>
	>(`/admin/billing/subscriptions/${subscriptionId}/cancel`, {
		note,
		immediate,
	});

	return response.data.data;
};

export const resumeAdminBillingSubscriptionApi = async ({
	subscriptionId,
	note,
}: ResumeAdminSubscriptionPayload): Promise<ResumeAdminSubscriptionResult> => {
	const response = await instance.patch<
		ApiResponse<ResumeAdminSubscriptionResult>
	>(`/admin/billing/subscriptions/${subscriptionId}/resume`, {
		note,
	});

	return response.data.data;
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
