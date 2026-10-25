"use client";

import { CancelledError, skipToken, useInfiniteQuery, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import {
	getAiConversation,
	listAiConversations,
	listAiConversationGenerations,
	listAiConversationMessages,
} from "../api/ai-assistant.api";
import type { AiConversation, AiConversationsFilter, AiGeneration, AiHistoryMessage } from "./ai-assistant.types";
import { isAiAuthorizationDenial } from "./ai-assistant.authorization";

import { aiTokenQueryOptions, beginAiTokenResponse, useAiTokenQueryEntry, useAiTokenQueryResult } from "./ai-token-query-verification";

import { getAiAccessIdentity } from "./ai-assistant.access";

const retryHistory = (failureCount: number, error: unknown) => !isAiAuthorizationDenial(error) && failureCount < 3;

export const aiHistoryKeys = {
	all: ["ai-history"] as const,
	conversation: (userId: string, conversationId: string, accessId?: string) =>
		["ai-history", userId, "conversation", conversationId, ...(accessId ? [accessId] : [])] as const,
	conversations: (userId: string, filters: AiConversationsFilter, accessId?: string) =>
		["ai-history", userId, "conversations", filters, ...(accessId ? [accessId] : [])] as const,
	messages: (userId: string, conversationId: string, accessId?: string) =>
		["ai-history", userId, "messages", conversationId, ...(accessId ? [accessId] : [])] as const,
	generations: (userId: string, conversationId: string, accessId?: string) =>
		["ai-history", userId, "generations", conversationId, ...(accessId ? [accessId] : [])] as const,
};

/** A selected id is a lookup input, never proof of ownership. */
export function aiConversationDetailOptions(userId: string, conversationId: string, onError?: (error: unknown) => void, shareToken?: string) {
	return {
		...aiTokenQueryOptions(shareToken),
		queryKey: aiHistoryKeys.conversation(userId, conversationId, getAiAccessIdentity(shareToken)),
		queryFn: async ({ signal, client }: { signal: AbortSignal; client: QueryClient }) => {
			const accept = beginAiTokenResponse(aiHistoryKeys.conversation(userId, conversationId, getAiAccessIdentity(shareToken)), shareToken, signal, client);
			try { return accept(await getAiConversation(conversationId, signal, ...(shareToken ? [shareToken] as const : [] as const))); }
			catch (error) { if (!shareToken || !signal.aborted) onError?.(error); throw error; }
		},
		retry: false as const,
	};
}

export function useAiConversation(userId: string | undefined, conversationId: string | null, readable = true, onError?: (error: unknown) => void, shareToken?: string) {
	const enabled = Boolean(userId && conversationId && readable);
	const entry = useAiTokenQueryEntry(aiHistoryKeys.conversation(userId ?? "", conversationId ?? "", getAiAccessIdentity(shareToken)), enabled);
	const query = useQuery({
		...aiConversationDetailOptions(userId ?? "", conversationId ?? "", onError, shareToken),
		enabled,
	});
	return useAiTokenQueryResult(query, entry, shareToken);
}

/** List denial is not evidence that any individual Conversation was revoked.
 * Keep only a content-free epoch/denial marker for this exact user/filter key.
 * It outlives list GC/remount and cannot be cleared by cached-success replay.
 */
export function useAiHistoryConversations(
	userId: string | undefined,
	filters: AiConversationsFilter | null,
	isReadable?: (conversation: AiConversation) => boolean,
	shareToken?: string,
) {
	const client = useQueryClient();
	const queryKey = aiHistoryKeys.conversations(userId ?? "", filters ?? { workspaceId: "", scope: "GLOBAL" }, getAiAccessIdentity(shareToken));
	const accessKey = ["ai-conversation-list-access", ...queryKey.slice(1)] as const;
	const enabled = Boolean(userId && filters?.workspaceId);
	const entry = useAiTokenQueryEntry(queryKey, enabled);
	type ListAccess = { epoch: number; denied: boolean };
	const accessQuery = useQuery<ListAccess>({
		queryKey: accessKey,
		queryFn: skipToken,
		initialData: { epoch: 0, denied: false },
		enabled: false,
		gcTime: Infinity,
	});
	const readAccess = (): ListAccess => client.getQueryData<ListAccess>(accessKey) ?? accessQuery.data ?? { epoch: 0, denied: false };
	const emptyList = () => client.setQueryData(queryKey, { pages: [], pageParams: [] });
	const query = useInfiniteQuery({
		...aiTokenQueryOptions(shareToken),
		queryKey,
		queryFn: async ({ pageParam, signal, queryKey: requestKey }) => {
			const access = readAccess();
			const accept = beginAiTokenResponse(requestKey, shareToken, signal, client, pageParam == null);
			try {
				// Identity belongs to the request, never to a later render/navigation.
				const page = await listAiConversations(requestKey[3], pageParam ?? undefined, signal, ...(shareToken ? [shareToken] as const : [] as const));
				if (signal.aborted || readAccess().epoch !== access.epoch) throw new CancelledError({ revert: true });
				const readablePage = isReadable ? { ...page, items: page.items.filter(isReadable) } : page;
				if (access.denied) client.setQueryData<ListAccess>(accessKey, { epoch: access.epoch, denied: false });
				return accept(readablePage);
			} catch (error) {
				if (isAiAuthorizationDenial(error)) {
					// A cancelled transport can reject after its replacement has recovered.
					if (signal.aborted || readAccess().epoch !== access.epoch) throw new CancelledError({ revert: true });
					client.setQueryData<ListAccess>(accessKey, { epoch: readAccess().epoch + 1, denied: true });
					// Query cancellation settles the retryer even if transport ignores AbortSignal.
					void client.cancelQueries({ queryKey: requestKey, exact: true });
					emptyList();
				}
				throw error;
			}
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: () => enabled && !readAccess().denied,
		retry: retryHistory,
	});
	const verified = useAiTokenQueryResult(query, entry, shareToken, enabled && !readAccess().denied);
	const denied = accessQuery.data?.denied || readAccess().denied || isAiAuthorizationDenial(query.error);
	const refetch: typeof query.refetch = (options) => {
		if (readAccess().denied) {
			// Recovery starts at page one, with no old pages/cursors as evidence.
			void client.cancelQueries({ queryKey, exact: true });
			emptyList();
		}
		return verified.refetch(options);
	};
	return {
		...verified,
		...(denied ? { data: undefined, isError: true, isSuccess: false, isPending: false, status: "error" as const, hasNextPage: false } : {}),
		isAccessDenied: denied,
		refetch,
		fetchNextPage: denied ? refetch : verified.fetchNextPage,
	};
}

export function useAiHistoryMessages(
	userId: string | undefined,
	conversationId: string | null,
	readable = true,
	isReadable?: (message: AiHistoryMessage) => boolean,
	onError?: (error: unknown) => void,
	shareToken?: string,
) {
	const enabled = Boolean(userId && conversationId && readable);
	const queryKey = aiHistoryKeys.messages(userId ?? "", conversationId ?? "", getAiAccessIdentity(shareToken));
	const entry = useAiTokenQueryEntry(queryKey, enabled);
	const query = useInfiniteQuery({
		...aiTokenQueryOptions(shareToken),
		queryKey,
		queryFn: async ({ pageParam, signal }) => {
			const accept = beginAiTokenResponse(queryKey, shareToken, signal, entry.client, pageParam == null);
			try {
				const page = await listAiConversationMessages(conversationId!, pageParam ?? undefined, signal, ...(shareToken ? [shareToken] as const : [] as const));
				return accept(isReadable ? { ...page, items: page.items.filter(isReadable) } : page);
			} catch (error) { if (!shareToken || !signal.aborted) onError?.(error); throw error; }
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled,
		retry: retryHistory,
	});
	return useAiTokenQueryResult(query, entry, shareToken);
}

export function useAiHistoryGenerations(
	userId: string | undefined,
	conversationId: string | null,
	readable = true,
	isReadable?: (generation: AiGeneration) => boolean,
	onError?: (error: unknown) => void,
	shareToken?: string,
) {
	const enabled = Boolean(userId && conversationId && readable);
	const queryKey = aiHistoryKeys.generations(userId ?? "", conversationId ?? "", getAiAccessIdentity(shareToken));
	const entry = useAiTokenQueryEntry(queryKey, enabled);
	const query = useInfiniteQuery({
		...aiTokenQueryOptions(shareToken),
		queryKey,
		queryFn: async ({ pageParam, signal }) => {
			const accept = beginAiTokenResponse(queryKey, shareToken, signal, entry.client, pageParam == null);
			try {
				const page = await listAiConversationGenerations(conversationId!, pageParam ?? undefined, signal, ...(shareToken ? [shareToken] as const : [] as const));
				return accept(isReadable ? { ...page, items: page.items.filter(isReadable) } : page);
			} catch (error) { if (!shareToken || !signal.aborted) onError?.(error); throw error; }
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled,
		retry: retryHistory,
	});
	return useAiTokenQueryResult(query, entry, shareToken);
}
