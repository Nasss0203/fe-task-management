import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import type { AiConversation, AiGeneration, AiHistoryMessage, AiHistoryPage } from "@/entities/ai-assistant/model/ai-assistant.types";
import { isAiAuthorizationDenial } from "./ai-chat-error";
import type { AiAccessDenial } from "./types";
import { getAiChatScope, getAiGenerationPageId, useAiChatStore } from "./use-ai-chat-store";

/** Synchronous visibility barrier first; cancel/remove only this user's resource.
 * Cancellation settles Query's retryer even if the transport ignores AbortSignal.
 * Tombstones also prevent rehydration after navigation or a cached-success replay.
 */
export function handleAiAuthorizationDenial(client: QueryClient, error: unknown, resource: AiAccessDenial): boolean {
	if (!isAiAuthorizationDenial(error) || !resource.userId || !resource.workspaceId ||
		(!resource.conversationId && !resource.pageId && !resource.generationId)) return false;
	const conversations = new Set(resource.conversationId ? [resource.conversationId] : []);
	if (!resource.conversationId && resource.pageId && !resource.generationId) {
		for (const [scope, thread] of Object.entries(useAiChatStore.getState().threads)) {
			if (scope.startsWith(`user:${resource.userId}:workspace:${resource.workspaceId}:`) &&
				(resource.accessId ? scope.endsWith(`:access:${resource.accessId}`) : !scope.includes(":access:")) && thread.conversationId &&
				(scope === getAiChatScope(resource.pageId, resource.workspaceId, resource.userId, resource.accessId) ||
					thread.messages.some((message) => getAiGenerationPageId(message.generation) === resource.pageId))) conversations.add(thread.conversationId);
		}
		for (const [key, conversation] of client.getQueriesData<AiConversation>({ queryKey: ["ai-history", resource.userId, "conversation"] })) {
			if (key[4] === resource.accessId && conversation?.workspace_id === resource.workspaceId && conversation.page_id === resource.pageId) conversations.add(conversation.id);
		}
	}
	useAiChatStore.getState().denyAccess(resource);
	if (!resource.conversationId && resource.pageId && !resource.generationId) {
		for (const conversationId of conversations) useAiChatStore.getState().denyAccess({ ...resource, conversationId });
	}
	if (!resource.generationId) {
		for (const [queryKey] of client.getQueriesData({ queryKey: ["ai-history", resource.userId, "conversations"] })) {
			const filters = queryKey[3] as { workspaceId?: string } | undefined;
			if (filters?.workspaceId !== resource.workspaceId || queryKey[4] !== resource.accessId) continue;
			void client.cancelQueries({ queryKey, exact: true });
			client.setQueryData<InfiniteData<AiHistoryPage<AiConversation>>>(queryKey, (data) => data && ({ ...data,
				pages: data.pages.map((page) => ({ ...page, items: page.items.filter((item) =>
					!conversations.has(item.id) && !(resource.pageId && !resource.conversationId && item.page_id === resource.pageId)) })),
			}));
		}
	}
	for (const conversationId of conversations) {
		const keys = [aiHistoryKeys.messages(resource.userId, conversationId, resource.accessId),
			aiHistoryKeys.generations(resource.userId, conversationId, resource.accessId),
			...(!resource.generationId ? [aiHistoryKeys.conversation(resource.userId, conversationId, resource.accessId)] : [])];
		for (const queryKey of keys) {
			void client.cancelQueries({ queryKey, exact: true });
			if (!resource.generationId) client.removeQueries({ queryKey, exact: true });
			else client.setQueryData<InfiniteData<AiHistoryPage<AiGeneration | AiHistoryMessage>>>(queryKey, (data) => data && ({
				...data, pages: data.pages.map((page) => ({ ...page, items: page.items.filter((item) =>
					"output_data" in item ? item.id !== resource.generationId : item.metadata?.generationId !== resource.generationId) })),
			}));
		}
	}
	return true;
}
