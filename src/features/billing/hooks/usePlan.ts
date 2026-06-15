import { billingService } from "@/services/billing/billing.service";
import type { CreatePaymentPayload } from "@/services/billing/type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PLAN_KEY } from "../types/type";

export const usePlan = () => {
	const { currentSubscription } = billingService;
	const planInfo = useQuery({
		queryKey: [PLAN_KEY.PLAN_INFOR],
		queryFn: () => currentSubscription(),
	});

	return {
		planInfo,
	};
};

export const useBillingPlans = () => {
	const { findAllPlan } = billingService;
	const planList = useQuery({
		queryKey: [PLAN_KEY.PLAN_LIST],
		queryFn: () => findAllPlan(),
	});

	return {
		planList,
	};
};

export const useCreateBillingPayment = () => {
	const { createPayment } = billingService;
	const createBillingPayment = useMutation({
		mutationKey: [PLAN_KEY.CREATE_PAYMENT],
		mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
	});

	return {
		createBillingPayment,
	};
};

export const useVerifyVnpayReturn = () => {
	const { verifyVnpayReturn } = billingService;
	const verifyPaymentReturn = useMutation({
		mutationKey: [PLAN_KEY.VERIFY_VNPAY_RETURN],
		mutationFn: (queryString: string) => verifyVnpayReturn(queryString),
	});

	return {
		verifyPaymentReturn,
	};
};

export const useVerifyStripeCheckout = () => {
	const { verifyStripeCheckout } = billingService;
	const verifyPaymentReturn = useMutation({
		mutationKey: [PLAN_KEY.VERIFY_VNPAY_RETURN, "STRIPE"],
		mutationFn: (sessionId: string) => verifyStripeCheckout(sessionId),
	});

	return {
		verifyPaymentReturn,
	};
};
