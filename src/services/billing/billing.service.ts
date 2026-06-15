import { ApiResponse } from "../admin/dashboard/type";
import instance from "../axios";
import {
	BillingPlanReponse,
	CreatePayment,
	CreatePaymentPayload,
	PaymentReturnResult,
	UserPlanInfo,
} from "./type";

export const billingService = {
	currentSubscription: async (): Promise<ApiResponse<UserPlanInfo>> => {
		const { data } = await instance.get<ApiResponse<UserPlanInfo>>(
			"/billing/current-subscription",
		);
		return data;
	},

	findAllPlan: async (): Promise<ApiResponse<BillingPlanReponse[]>> => {
		const { data } =
			await instance.get<ApiResponse<BillingPlanReponse[]>>(
				"/billing/plans",
			);
		return data;
	},

	createPayment: async ({
		planId,
		provider,
		targetWorkspaceId,
	}: CreatePaymentPayload): Promise<ApiResponse<CreatePayment>> => {
		const { data } = await instance.post<ApiResponse<CreatePayment>>(
			"/billing/payments",
			{
				planId,
				provider,
				targetWorkspaceId,
			},
		);

		return data;
	},

	verifyVnpayReturn: async (
		queryString: string,
	): Promise<ApiResponse<PaymentReturnResult>> => {
		const query = queryString.startsWith("?")
			? queryString
			: `?${queryString}`;
		const { data } = await instance.get<ApiResponse<PaymentReturnResult>>(
			`/billing/test-vnpay/return${query}`,
		);

		return data;
	},

	verifyStripeCheckout: async (
		sessionId: string,
	): Promise<ApiResponse<PaymentReturnResult>> => {
		const { data } = await instance.get<ApiResponse<PaymentReturnResult>>(
			`/billing/stripe/checkout-session/${encodeURIComponent(sessionId)}`,
			{
				timeout: 15000,
			},
		);

		return data;
	},
};
