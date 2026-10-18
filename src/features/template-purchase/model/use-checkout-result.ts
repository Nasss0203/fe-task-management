"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

import {
	templateApi,
	templateKeys,
	type TemplatePurchase,
} from "@/entities/template";

import {
	clearPurchaseIntent,
	findPurchaseIntentByPurchaseId,
} from "./purchase-intent";
import { refreshTemplateAccess } from "./use-buy-template";

const POLL_INTERVAL_MS = 3000;
/** ~60s of waiting for the webhook; the page then offers a manual check. */
export const MAX_STATUS_CHECKS = 20;

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CheckoutResult =
	| { kind: "loading" }
	/** Malformed id, or a purchase that does not exist or is not this user's. */
	| { kind: "invalid" }
	| { kind: "error"; returnPath: string; retry: () => void }
	| { kind: "timeout"; returnPath: string; retry: () => void }
	| { kind: "status"; returnPath: string; purchase: TemplatePurchase };

/**
 * Status of a purchase after returning from Stripe, read from the backend
 * (GET, no side effects). The Stripe redirect is never proof of payment:
 * the purchase turns PAID only after the webhook settled it.
 */
export function useCheckoutResult(
	purchaseId: string | null,
	userId: string | undefined,
	{ poll }: { poll: boolean },
): CheckoutResult {
	const queryClient = useQueryClient();
	const isValidId = Boolean(purchaseId && UUID_PATTERN.test(purchaseId));
	// Checks already spent before the last manual "check again".
	const [checksBeforeRetry, setChecksBeforeRetry] = useState(0);
	// The tab that started the purchase remembers which detail page to return to.
	const [storedReturnPath, setStoredReturnPath] = useState<string | null>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser; read once on mount
		setStoredReturnPath(
			userId && purchaseId
				? (findPurchaseIntentByPurchaseId(userId, purchaseId)?.returnPath ??
						null)
				: null,
		);
	}, [purchaseId, userId]);

	const query = useQuery({
		queryKey: templateKeys.purchase(purchaseId ?? "", userId),
		queryFn: ({ signal }) => templateApi.getPurchase(purchaseId!, signal),
		enabled: isValidId && Boolean(userId),
		retry: (failureCount, error) =>
			!(axios.isAxiosError(error) && error.response?.status === 404) &&
			failureCount < 1,
		refetchOnWindowFocus: false,
		refetchInterval: (current) =>
			poll &&
			current.state.data?.status === "PENDING" &&
			current.state.dataUpdateCount - checksBeforeRetry <
				MAX_STATUS_CHECKS
				? POLL_INTERVAL_MS
				: false,
	});

	const purchase = query.data;
	const status = purchase?.status;
	const templateId = purchase?.templateId;

	useEffect(() => {
		if (!userId || !templateId || !status || status === "PENDING") return;
		if (status === "PAID") {
			void refreshTemplateAccess(queryClient, templateId, userId);
		}
		// Settled either way; a later Buy starts a fresh intent.
		if (status !== "RECONCILIATION_REQUIRED") {
			clearPurchaseIntent(userId, templateId);
		}
	}, [queryClient, status, templateId, userId]);

	if (!isValidId) return { kind: "invalid" };
	if (!userId) return { kind: "loading" };

	const returnPath =
		storedReturnPath ??
		(purchase ? `/templates/${purchase.templateId}` : "/templates");
	// Reading dataUpdatedAt subscribes to every fetch, so identical PENDING
	// responses still re-render and the timeout can show.
	const checks = query.dataUpdatedAt
		? (queryClient.getQueryState(templateKeys.purchase(purchaseId!, userId))
				?.dataUpdateCount ?? 0)
		: 0;
	const retry = () => {
		// GET only; restarts the polling window.
		setChecksBeforeRetry(checks);
		void query.refetch();
	};

	if (query.isError) {
		return axios.isAxiosError(query.error) &&
			query.error.response?.status === 404
			? { kind: "invalid" }
			: { kind: "error", returnPath, retry };
	}
	if (!purchase) return { kind: "loading" };
	if (purchase.id !== purchaseId) return { kind: "invalid" };
	if (
		poll &&
		purchase.status === "PENDING" &&
		checks - checksBeforeRetry >= MAX_STATUS_CHECKS
	) {
		return { kind: "timeout", returnPath, retry };
	}
	return { kind: "status", returnPath, purchase };
}
