"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { templateApi, type TemplatePurchase } from "@/entities/template";

import {
	clearPurchaseIntent,
	findPurchaseIntentByPurchaseId,
	type PurchaseIntent,
} from "./purchase-intent";
import { refreshTemplateAccess } from "./use-buy-template";

const POLL_INTERVAL_MS = 3000;
/** ~60s of waiting for the webhook; the page then says so instead of spinning. */
export const MAX_STATUS_CHECKS = 20;

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CheckoutResult =
	| { kind: "loading" }
	| { kind: "invalid" }
	/** This browser has no record of the purchase, so it cannot ask about it. */
	| { kind: "unverifiable" }
	| { kind: "error"; intent: PurchaseIntent }
	| { kind: "timeout"; intent: PurchaseIntent }
	| { kind: "status"; intent: PurchaseIntent; purchase: TemplatePurchase };

/**
 * Status of a purchase after returning from Stripe. The Stripe redirect is
 * never proof of payment: only the backend purchase status counts, and it
 * turns PAID only after the webhook settled it.
 *
 * shortcut: there is no buyer GET for a purchase, so this re-sends the
 * original idempotent create (same key returns the same purchase, never a
 * new one); switch to a dedicated read endpoint once the backend has one.
 */
export function useCheckoutResult(
	purchaseId: string | null,
	userId: string | undefined,
	{ poll }: { poll: boolean },
): CheckoutResult {
	const queryClient = useQueryClient();
	const [intent, setIntent] = useState<PurchaseIntent | null | undefined>();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser; read once on mount
		setIntent(
			userId && purchaseId
				? findPurchaseIntentByPurchaseId(userId, purchaseId)
				: null,
		);
	}, [purchaseId, userId]);

	const queryKey = ["template-purchase-status", userId, purchaseId];
	const query = useQuery({
		queryKey,
		queryFn: () =>
			templateApi.createPurchase(intent!.templateId, intent!.idempotencyKey),
		enabled: Boolean(intent),
		gcTime: 0,
		retry: 1,
		refetchOnWindowFocus: false,
		refetchInterval: (current) =>
			poll &&
			current.state.data?.status === "PENDING" &&
			current.state.dataUpdateCount < MAX_STATUS_CHECKS
				? POLL_INTERVAL_MS
				: false,
	});

	const status = query.data?.status;

	useEffect(() => {
		if (!intent || !status || status === "PENDING") return;
		if (status === "PAID") {
			void refreshTemplateAccess(queryClient, intent.templateId, intent.userId);
		}
		// Settled either way; a later Buy starts a fresh intent.
		if (status !== "RECONCILIATION_REQUIRED") {
			clearPurchaseIntent(intent.userId, intent.templateId);
		}
	}, [intent, queryClient, status]);

	if (!purchaseId || !UUID_PATTERN.test(purchaseId)) return { kind: "invalid" };
	if (!userId || intent === undefined) return { kind: "loading" };
	if (intent === null) return { kind: "unverifiable" };
	if (query.isError) return { kind: "error", intent };
	if (!query.data) return { kind: "loading" };
	if (query.data.id !== purchaseId) return { kind: "invalid" };
	if (
		poll &&
		query.data.status === "PENDING" &&
		(queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0) >=
			MAX_STATUS_CHECKS
	) {
		return { kind: "timeout", intent };
	}
	return { kind: "status", intent, purchase: query.data };
}
