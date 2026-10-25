"use client";

import { useEffect, useMemo } from "react";
import { CancelledError, hashKey, useQueryClient, type InfiniteQueryObserverResult, type FetchNextPageOptions, type RefetchOptions, type QueryClient, type QueryKey, type QueryObserverResult } from "@tanstack/react-query";
import { isAiAuthorizationDenial } from "./ai-assistant.authorization";

// Non-persisted response provenance, scoped by the existing opaque query key.
// Only a successful, non-aborted API response receives a proof. Cache writes,
// timestamps and Query status transitions cannot manufacture one.
let requestSequence = 0;
const verificationStarts = new WeakMap<object, number>();
const responses = new WeakMap<object, { key: string; started: number; signal: AbortSignal; client: QueryClient; query: { queryHash: string } }>();

export const aiTokenQueryOptions = (shareToken?: string) => shareToken
	? { staleTime: 0, refetchOnMount: "always" as const, structuralSharing: false as const } : {};

export function beginAiTokenResponse(queryKey: QueryKey, shareToken: string | undefined, signal: AbortSignal, client: QueryClient, firstPage = true) {
	const started = shareToken ? ++requestSequence : 0;
	const query = shareToken ? client.getQueryCache().find({ queryKey, exact: true }) : undefined;
	// Starting first-page verification invalidates earlier proofs even if a
	// later cache write resets Query status/error after this request fails.
	if (query && firstPage && !signal.aborted) verificationStarts.set(query, started);
	return <T extends object>(data: T): T => {
		if (!shareToken) return data;
		if (signal.aborted || !query) throw new CancelledError({ revert: true });
		// Keep response identity through Query's cache commit, including byte-identical
		// responses. InfiniteQuery retains this identity on each individual page.
		const response = { ...data };
		responses.set(response, { key: hashKey(queryKey), started, signal, client, query });
		return response;
	};
}

export function useAiTokenQueryEntry(queryKey: QueryKey, enabled: boolean) {
	const client = useQueryClient();
	const key = hashKey(queryKey);
	return useMemo(() => ({ key, enabled, after: requestSequence, client }), [key, enabled, client]);
}
type Entry = ReturnType<typeof useAiTokenQueryEntry>;

function hasCurrentResponse(data: unknown, entry: Entry): boolean {
	if (!entry.enabled || !data || typeof data !== "object") return false;
	if ("pages" in data) {
		return Array.isArray(data.pages) && data.pages.length > 0 && data.pages.every((page: unknown) => hasCurrentResponse(page, entry));
	}
	const proof = responses.get(data);
	return Boolean(proof && proof.key === entry.key && proof.client === entry.client &&
		entry.client.getQueryCache().get(proof.query.queryHash) === proof.query &&
		proof.started > entry.after && proof.started >= (verificationStarts.get(proof.query) ?? 0) && !proof.signal.aborted);
}

function visibleResult<T extends QueryObserverResult<unknown, unknown>>(query: T, entry: Entry, shareToken?: string): T & { isAccessVerified: boolean } {
	const infinite = query as T & Partial<InfiniteQueryObserverResult<unknown, unknown>>;
	const verified = !shareToken || hasCurrentResponse(query.data, entry) &&
		!isAiAuthorizationDenial(query.error) &&
		(query.fetchStatus === "idle" || infinite.isFetchingNextPage === true) &&
		(!query.isError || infinite.isFetchNextPageError === true);
	if (verified) return { ...query, isAccessVerified: true };
	// Project a coherent data-less pending/error result. The underlying Query
	// retains its recoverable cache and real fetchStatus (including paused).
	return { ...query, data: undefined, isAccessVerified: false, isSuccess: false,
		status: query.isError ? "error" : "pending", isPending: !query.isError,
		isLoading: !query.isError && query.isFetching, isRefetching: false,
		isLoadingError: query.isError, isRefetchError: false,
		...("hasNextPage" in query ? { hasNextPage: false } : {}),
	} as unknown as T & { isAccessVerified: boolean };
}

export function useAiTokenQueryResult<T extends QueryObserverResult<unknown, unknown>>(query: T, entry: Entry, shareToken?: string, canFetch = entry.enabled): T & { isAccessVerified: boolean } {
	const currentResponse = hasCurrentResponse(query.data, entry);
	const { refetch, isSuccess, fetchStatus } = query;
	useEffect(() => {
		// A reused observer can join an older deduplicated GET. If that request
		// commits after entry, its old proof still cannot unlock this observer.
		// Start a current GET once it settles; errors keep the explicit retry path.
		if (shareToken && canFetch && !currentResponse && isSuccess && fetchStatus === "idle") void refetch();
	}, [shareToken, canFetch, currentResponse, isSuccess, fetchStatus, refetch]);
	const visible = visibleResult(query, entry, shareToken);
	if (!shareToken) return visible;
	const infinite = query as T & Partial<InfiniteQueryObserverResult<unknown, unknown>>;
	return { ...visible,
		refetch: async (options?: RefetchOptions) => visibleResult(await refetch(options), entry, shareToken),
		...(infinite.fetchNextPage ? {
			// No next-page response may authorize old pages on re-entry.
			fetchNextPage: async (options?: FetchNextPageOptions) => visibleResult(await (visible.isAccessVerified
				? infinite.fetchNextPage!(options) : refetch(options)), entry, shareToken),
		} : {}),
	} as unknown as T & { isAccessVerified: boolean };
}
