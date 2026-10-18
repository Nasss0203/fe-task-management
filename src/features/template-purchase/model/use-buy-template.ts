"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";

import {
	templateApi,
	templateKeys,
	type TemplatePurchase,
	type TemplatePurchaseStatus,
} from "@/entities/template";

import { navigateToCheckout } from "./navigate-to-checkout";
import {
	clearPurchaseIntent,
	getPurchaseIntent,
	savePurchaseIntent,
	startPurchaseIntent,
} from "./purchase-intent";

/** Purchases that can never reach checkout again: a retry needs a new key. */
const CLOSED_STATUSES: readonly TemplatePurchaseStatus[] = [
	"EXPIRED",
	"FAILED",
	"REFUNDED",
];

export type BuyTemplateResult =
	| { kind: "redirect"; checkoutUrl: string }
	| { kind: "owned" };

export class PurchaseUnderReviewError extends Error {
	constructor() {
		super("Your previous payment for this template is under review.");
	}
}

interface BuyTemplateInput {
	templateId: string;
	userId: string;
	returnPath: string;
}

async function createPurchaseForIntent({
	templateId,
	userId,
	returnPath,
}: BuyTemplateInput): Promise<TemplatePurchase> {
	const intent =
		getPurchaseIntent(userId, templateId) ??
		startPurchaseIntent(userId, templateId, returnPath);

	let purchase = await templateApi.createPurchase(
		templateId,
		intent.idempotencyKey,
	);

	if (CLOSED_STATUSES.includes(purchase.status)) {
		const fresh = startPurchaseIntent(userId, templateId, returnPath);
		purchase = await templateApi.createPurchase(templateId, fresh.idempotencyKey);
		savePurchaseIntent({ ...fresh, purchaseId: purchase.id });
	} else {
		savePurchaseIntent({ ...intent, returnPath, purchaseId: purchase.id });
	}

	return purchase;
}

/**
 * Buy flow: purchase (idempotent) -> Stripe Checkout session -> redirect.
 * The price comes from the backend snapshot; nothing here grants access.
 */
export function useBuyTemplate() {
	const queryClient = useQueryClient();
	// Blocks a second click in the same tick, before isPending re-renders.
	const inFlight = useRef(false);

	const mutation = useMutation({
		mutationFn: async (input: BuyTemplateInput): Promise<BuyTemplateResult> => {
			try {
				const purchase = await createPurchaseForIntent(input);

				if (purchase.status === "PAID") return { kind: "owned" };
				if (purchase.status === "RECONCILIATION_REQUIRED") {
					throw new PurchaseUnderReviewError();
				}

				const { checkoutUrl } = await templateApi.createPurchaseCheckout(
					purchase.id,
				);
				return { kind: "redirect", checkoutUrl };
			} catch (error) {
				// A purchase too close to expiry cannot open Stripe Checkout;
				// the next attempt starts a new purchase intent.
				if (
					axios.isAxiosError(error) &&
					error.response?.status === 409 &&
					String(error.response.data?.message ?? "").includes(
						"Insufficient time remaining",
					)
				) {
					clearPurchaseIntent(input.userId, input.templateId);
				}
				throw error;
			}
		},
		onSuccess: (result, input) => {
			if (result.kind === "redirect") {
				// Full navigation to Stripe; the page keeps its pending state.
				navigateToCheckout(result.checkoutUrl);
				return;
			}
			clearPurchaseIntent(input.userId, input.templateId);
			void refreshTemplateAccess(queryClient, input.templateId, input.userId);
		},
		onError: (error, input) => {
			if (
				axios.isAxiosError(error) &&
				error.response?.status === 409 &&
				String(error.response.data?.message ?? "").includes("already owns")
			) {
				clearPurchaseIntent(input.userId, input.templateId);
				void refreshTemplateAccess(queryClient, input.templateId, input.userId);
			}
		},
		onSettled: (result) => {
			// Stay locked while the browser leaves for Stripe.
			if (result?.kind !== "redirect") inFlight.current = false;
		},
	});

	const buy = (input: BuyTemplateInput) => {
		if (inFlight.current) return;
		inFlight.current = true;
		mutation.mutate(input);
	};

	return {
		buy,
		isPending: mutation.isPending || mutation.data?.kind === "redirect",
		error: mutation.error,
	};
}

export function refreshTemplateAccess(
	queryClient: ReturnType<typeof useQueryClient>,
	templateId: string,
	userId: string,
) {
	return Promise.all([
		queryClient.invalidateQueries({
			queryKey: templateKeys.usableVersions(templateId, userId),
		}),
		queryClient.invalidateQueries({
			queryKey: [...templateKeys.all, "claimed", userId],
		}),
	]);
}
