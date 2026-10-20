"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import {
	listAiConversations,
	listAiConversationGenerations,
	listAiConversationMessages,
} from "../api/ai-assistant.api";
import type { AiConversationsFilter } from "./ai-assistant.types";

export const aiHistoryKeys = {
	all: ["ai-history"] as const,
	conversations: (userId: string, filters: AiConversationsFilter) =>
		["ai-history", userId, "conversations", filters] as const,
	messages: (userId: string, conversationId: string) =>
		["ai-history", userId, "messages", conversationId] as const,
	generations: (userId: string, conversationId: string) =>
		["ai-history", userId, "generations", conversationId] as const,
};

export function useAiHistoryConversations(
	userId: string | undefined,
	filters: AiConversationsFilter | null,
) {
	return useInfiniteQuery({
		queryKey: aiHistoryKeys.conversations(userId ?? "", filters ?? {
			workspaceId: "",
			scope: "GLOBAL",
		}),
		queryFn: ({ pageParam, signal }) =>
			listAiConversations(filters!, pageParam ?? undefined, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(userId && filters?.workspaceId),
	});
}

export function useAiHistoryMessages(
	userId: string | undefined,
	conversationId: string | null,
) {
	return useInfiniteQuery({
		queryKey: aiHistoryKeys.messages(userId ?? "", conversationId ?? ""),
		queryFn: ({ pageParam, signal }) =>
			listAiConversationMessages(conversationId!, pageParam ?? undefined, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(userId && conversationId),
	});
}

export function useAiHistoryGenerations(
	userId: string | undefined,
	conversationId: string | null,
) {
	return useInfiniteQuery({
		queryKey: aiHistoryKeys.generations(userId ?? "", conversationId ?? ""),
		queryFn: ({ pageParam, signal }) =>
			listAiConversationGenerations(conversationId!, pageParam ?? undefined, signal),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(userId && conversationId),
	});
}
