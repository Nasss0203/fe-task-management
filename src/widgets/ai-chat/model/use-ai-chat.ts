"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { getAiAccessIdentity, getBoundAiShareToken, type AiPageAccessContext } from "@/entities/ai-assistant/model/ai-assistant.access";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";

import {
	useConfirmAiModificationPlan,
	useConfirmPageComposition,
	useCreateAiConversation,
	useDiscardAiGeneration,
	useGenerateAiModificationPlan,
	useGeneratePagePlanFromInstruction,
	useSubmitAiMessage,
	useAskAi,
} from "@/entities/ai-assistant/model/ai-assistant.mutations";

import type {
	AiGeneration,
	GeneratePagePlanFromInstructionResponse,
	ConfirmPageCompositionRequest,
} from "@/entities/ai-assistant/model/ai-assistant.types";

import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import { usePage } from "@/entities/page/model/page.queries";
import { useUser } from "@/features/auth";
import { getAiChatErrorMessage, isAiAuthorizationDenial } from "./ai-chat-error";
import { handleAiAuthorizationDenial } from "./ai-authorization-denial";

import type { AiChatMessage, AiChatMode, AiChatPendingStage, AiOperationToken, UnifiedAskInput } from "./types";
import { aiHistoryKeys, aiConversationDetailOptions, useAiConversation, useAiHistoryConversations, useAiHistoryGenerations, useAiHistoryMessages } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { getAiConversationVerification, isVerifiedAiConversationContext, mergeAiWorkspaceHistory, shouldReuseAiConversation } from "./ai-history-conversations";
import { createUnifiedAskOrchestrator, getUnifiedAskInstructionError } from "./ai-unified-ask-orchestrator";
import { acquireAiChatOperation, type AiChatView } from "./ai-unified-ask-context";
import { isAiModificationPlan } from "./ai-capability";
import { isValidAiCompositionGeneration, isValidAiGeneration } from "./ai-ask-response-mapper";
import { getPageInstructionFeedback } from "./page-instruction-feedback";
import { makeAiConversationTitle } from "./ai-conversation-title";
import { AiModificationActionError, assertModificationDraftTarget } from "./ai-modification-action";
import {
	aiHistorySelectionKey,
	saveSelectedAiConversation,
	useSelectedAiConversation,
	resetAiChatSelection,
	getAiSelectionRevision,
	getSelectedAiConversation,
} from "./ai-history-selection";

import {
	EMPTY_AI_CHAT_THREAD,
	getAiChatScope,
	getAiGenerationPageId,
	isAiAccessDenied,
	useAiChatStore,
} from "./use-ai-chat-store";

// Keep the existing type import used by AiMessageList.
export type { AiChatPendingStage } from "./types";

function getWritingText(generation: AiGeneration): string | null {
	const output = generation.output_data;

	if (!output || typeof output !== "object" || Array.isArray(output)) {
		return null;
	}

	const text = (output as Record<string, unknown>).text;

	return typeof text === "string" ? text : null;
}

/**
 * Ensure an async response belongs to the active request
 * in its original chat scope.
 *
 * A request from Page A must not update Page B.
 * A response from a reset chat must be ignored.
 */
function isActiveRequest(scope: string, requestId: string): boolean {
	const thread = useAiChatStore.getState().threads[scope];

	return thread?.activeRequestId === requestId;
}

export function useAiChat(currentPageId?: string, pageAccess?: AiPageAccessContext) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { user } = useUser();
	const { data: workspaces = [] } = useWorkspaces();
	const suppliedPageContext = Boolean(pageAccess?.shareToken && pageAccess.userId === user?.id && pageAccess.pageId === currentPageId);
	const currentPageQuery = usePage(currentPageId, !suppliedPageContext);
	const { data: currentPage } = currentPageQuery;
	const accessDenials = useAiChatStore((state) => state.accessDenials);

	const addMessage = useAiChatStore((state) => state.addMessage);

	const setInput = useAiChatStore((state) => state.setInput);

	const setConversation = useAiChatStore((state) => state.setConversation);

	const setMessages = useAiChatStore((state) => state.setMessages);
	const hydrateHistory = useAiChatStore((state) => state.hydrateHistory);

	const newChat = useAiChatStore((state) => state.newChat);

	const beginRequest = useAiChatStore((state) => state.beginRequest);

	const setPendingStage = useAiChatStore((state) => state.setPendingStage);

	const finishRequest = useAiChatStore((state) => state.finishRequest);

	const createConversationMutation = useCreateAiConversation();

	const submitMessageMutation = useSubmitAiMessage();
	const askMutation = useAskAi();

	const generateModificationPlanMutation = useGenerateAiModificationPlan();
	const generatePagePlanFromInstructionMutation = useGeneratePagePlanFromInstruction();

	const confirmPageCompositionMutation = useConfirmPageComposition();

	const confirmModificationPlanMutation = useConfirmAiModificationPlan();

	const discardMutation = useDiscardAiGeneration();
	// Mutation state updates on the next render; a ref also blocks rapid double clicks.
	const generationActionRef = useRef(false);

	const currentWorkspaceId = useMemo(() => {
		if (currentPageId) return currentPage?.workspace_id ?? (suppliedPageContext ? pageAccess!.workspaceId : null);
		const lastActiveWorkspaceId = user?.lastActiveWorkspaceId;

		if (
			lastActiveWorkspaceId &&
			workspaces.some(
				(workspace) => workspace.id === lastActiveWorkspaceId,
			)
		) {
			return lastActiveWorkspaceId;
		}

		return workspaces[0]?.id ?? null;
	}, [user?.lastActiveWorkspaceId, workspaces, currentPageId, currentPage?.workspace_id, suppliedPageContext, pageAccess]);

	const shareToken = getBoundAiShareToken(pageAccess, user?.id, currentWorkspaceId, currentPageId);
	const accessId = getAiAccessIdentity(shareToken);
	const chatScope = getAiChatScope(currentPageId, currentWorkspaceId, user?.id, accessId);
	const thread = useAiChatStore(
		(state) => state.threads[chatScope] ?? EMPTY_AI_CHAT_THREAD,
	);
	const {
		input,
		mode,
		conversationId,
		conversationWorkspaceId,
		pendingStage,
		activeRequestId,
	} = thread;

	const entryMessageIds = useMemo(() => new Set(
		(useAiChatStore.getState().threads[chatScope]?.messages ?? []).map((message) => message.id),
	), [chatScope]);
	const historyKey = aiHistorySelectionKey(
		user?.id,
		currentWorkspaceId,
		currentPageId,
		accessId,
	);
	const selectedConversationId = useSelectedAiConversation(historyKey);
	const accessContext = useMemo(() => ({ userId: user?.id ?? "", workspaceId: currentWorkspaceId ?? "",
		conversationId: selectedConversationId, pageId: currentPageId ?? null, accessId }), [user?.id, currentWorkspaceId, selectedConversationId, currentPageId, accessId]);
	const contextDenied = isAiAccessDenied(accessDenials, accessContext);
	const onHistoryError = (error: unknown) => handleAiAuthorizationDenial(queryClient, error, accessContext);
	const conversationDetailQuery = useAiConversation(user?.id, selectedConversationId, !contextDenied, onHistoryError, shareToken);
	const messagesQuery = useAiHistoryMessages(user?.id, selectedConversationId, !contextDenied, (message) =>
		!isAiAccessDenied(useAiChatStore.getState().accessDenials, { ...accessContext,
			generationId: typeof message.metadata?.generationId === "string" ? message.metadata.generationId : undefined }), onHistoryError, shareToken);
	const generationsQuery = useAiHistoryGenerations(user?.id, selectedConversationId, !contextDenied, (generation) =>
		!isAiAccessDenied(useAiChatStore.getState().accessDenials, { ...accessContext, generationId: generation.id,
			pageId: getAiGenerationPageId(generation) ?? accessContext.pageId }), onHistoryError, shareToken);
	const accessError = [conversationDetailQuery.error, messagesQuery.error, generationsQuery.error,
		...(currentPageId && !shareToken ? [currentPageQuery.error] : [])].find(isAiAuthorizationDenial);
	const accessDenied = contextDenied || Boolean(accessError);
	const conversationVerification = getAiConversationVerification(user?.id, selectedConversationId, conversationDetailQuery);
	const selectedContextIsReadable = Boolean(!accessDenied && user?.id && currentWorkspaceId && isVerifiedAiConversationContext(
		conversationVerification, { userId: user.id, workspaceId: currentWorkspaceId, currentPageId }, false,
	));
	// Retained thread messages/previews are usable only after all protected
	// history surfaces have verified this token entry. Direct access is unchanged.
	const historyAccessVerified = !shareToken || Boolean(selectedContextIsReadable &&
		messagesQuery.isAccessVerified && generationsQuery.isAccessVerified);
	const visibleMessages = accessDenied ? [] : !shareToken || historyAccessVerified ? thread.messages
		: thread.messages.filter((message) => !selectedConversationId && !conversationId &&
			!entryMessageIds.has(message.id) && !message.generation && message.origin?.source !== "persisted");
	const liveViewRef = useRef<AiChatView | null>(null);
	const viewRevisionRef = useRef(0);
	const previousUserRef = useRef(user?.id);
	useEffect(() => {
		if (previousUserRef.current && previousUserRef.current !== user?.id) useAiChatStore.getState().purgeUserThreads(previousUserRef.current);
		previousUserRef.current = user?.id;
		liveViewRef.current = { userId: user?.id, workspaceId: currentWorkspaceId, pageId: currentPageId ?? null,
			chatScope, accessId, shareToken, revision: ++viewRevisionRef.current };
		return () => { liveViewRef.current = null; };
	}, [user?.id, currentWorkspaceId, currentPageId, chatScope, accessId, shareToken]);
	const previousAccessRef = useRef({ accessId, chatScope, userId: user?.id, workspaceId: currentWorkspaceId, pageId: currentPageId, selectedConversationId });
	useEffect(() => {
		const previous = previousAccessRef.current;
		if (previous.accessId !== accessId) {
			const ids = new Set([previous.selectedConversationId, useAiChatStore.getState().threads[previous.chatScope]?.conversationId]);
			useAiChatStore.getState().clearAccessThread(previous.chatScope);
			const predicate = (query: { queryKey: readonly unknown[] }) => {
				const key = query.queryKey;
				if (key[0] !== "ai-history" || key[1] !== previous.userId || key[4] !== previous.accessId) return false;
				if (key[2] !== "conversations") return ids.has(key[3] as string);
				const filters = key[3] as { workspaceId: string; pageId?: string };
				return filters.workspaceId === previous.workspaceId && filters.pageId === previous.pageId;
			};
			void queryClient.cancelQueries({ predicate });
			queryClient.removeQueries({ predicate });
		}
		previousAccessRef.current = { accessId, chatScope, userId: user?.id, workspaceId: currentWorkspaceId, pageId: currentPageId, selectedConversationId };
	}, [accessId, chatScope, user?.id, currentWorkspaceId, currentPageId, selectedConversationId, queryClient]);
	const operationView = () => {
		const view = liveViewRef.current;
		return view && view.userId === user?.id && view.workspaceId === currentWorkspaceId &&
			view.pageId === (currentPageId ?? null) && view.chatScope === chatScope ? view : null;
	};
	const conversationFilters = currentWorkspaceId
		? {
				workspaceId: currentWorkspaceId,
				scope: currentPageId ? ("PAGE" as const) : ("GLOBAL" as const),
				...(currentPageId ? { pageId: currentPageId } : {}),
			}
		: null;
	const isConversationReadable = (conversation: { id: string; workspace_id: string | null; page_id: string | null }) =>
		!isAiAccessDenied(useAiChatStore.getState().accessDenials, { userId: user?.id ?? "", workspaceId: conversation.workspace_id ?? "",
			conversationId: conversation.id, pageId: conversation.page_id, accessId });
	const conversationsQuery = useAiHistoryConversations(user?.id, conversationFilters, isConversationReadable, shareToken);
	// The Dashboard shows workspace-wide GLOBAL chats and PAGE drafts. In a
	// Page sidebar, history must remain strictly scoped to that Page.
	const workspacePageFilters = currentWorkspaceId && !currentPageId
		? { workspaceId: currentWorkspaceId, scope: "PAGE" as const }
		: null;
	const workspacePageConversationsQuery = useAiHistoryConversations(
		user?.id,
		workspacePageFilters,
		isConversationReadable,
		shareToken,
	);
	useEffect(() => {
		if (accessError && user?.id && currentWorkspaceId) handleAiAuthorizationDenial(queryClient, accessError, {
			userId: user.id, workspaceId: currentWorkspaceId, accessId,
			conversationId: currentPageId && !shareToken && isAiAuthorizationDenial(currentPageQuery.error) ? null : selectedConversationId, pageId: currentPageId ?? null,
		});
	}, [accessError, user?.id, currentWorkspaceId, selectedConversationId, currentPageId, currentPageQuery.error, queryClient, accessId, shareToken]);
	const canReadGeneration = useCallback((generationId: string, id = selectedConversationId, pageId = currentPageId ?? null) =>
		!(id === selectedConversationId && (accessDenied || Boolean(id && (!selectedContextIsReadable || !historyAccessVerified)))) && !isAiAccessDenied(useAiChatStore.getState().accessDenials,
			{ ...accessContext, conversationId: id, generationId, pageId }), [accessContext, accessDenied, currentPageId, selectedConversationId, selectedContextIsReadable, historyAccessVerified]);
	const handleGenerationAccessError = useCallback((error: unknown, generationId: string, id = selectedConversationId) =>
		handleAiAuthorizationDenial(queryClient, error, { ...accessContext, conversationId: id, generationId }), [queryClient, accessContext, selectedConversationId]);
	const conversations = useMemo(() => {
		const readable = (conversation: { id: string; workspace_id: string | null; page_id: string | null }) =>
			!isAiAccessDenied(accessDenials, { userId: user?.id ?? "", workspaceId: conversation.workspace_id ?? "",
				conversationId: conversation.id, pageId: conversation.page_id, accessId });
		const global = (isAiAuthorizationDenial(conversationsQuery.error) ? [] : conversationsQuery.data?.pages.flatMap((page) => page.items) ?? []).filter(readable);
		if (currentPageId) return global;
		const pages = (isAiAuthorizationDenial(workspacePageConversationsQuery.error) ? [] : workspacePageConversationsQuery.data?.pages.flatMap((page) => page.items) ?? []).filter(readable);
		return mergeAiWorkspaceHistory(global, pages, currentWorkspaceId, true);
	}, [conversationsQuery.data, conversationsQuery.error, workspacePageConversationsQuery.data, workspacePageConversationsQuery.error, currentPageId, currentWorkspaceId, accessDenials, user?.id, accessId]);
	const selectedConversation = conversations.find(
		(conversation) => conversation.id === selectedConversationId,
	);
	const canReuseSelectedConversation = (scope: "GLOBAL" | "PAGE", pageId?: string) =>
		Boolean(
			currentWorkspaceId &&
			shouldReuseAiConversation(selectedConversation, currentWorkspaceId, scope, pageId),
		);
	const savedGenerations = useMemo(
		() => accessDenied || selectedConversationId && !selectedContextIsReadable ? [] : (generationsQuery.data?.pages.flatMap((page) => page.items) ?? [])
			.filter((generation) => !isAiAccessDenied(accessDenials, { ...accessContext, generationId: generation.id,
				pageId: getAiGenerationPageId(generation) ?? accessContext.pageId })),
		[generationsQuery.data, accessDenied, accessDenials, accessContext, selectedConversationId, selectedContextIsReadable],
	);

	// Restore the selected conversation after F5. Never trust a persisted id
	// for authorization; the backend verifies the owner and page/workspace.
	useEffect(() => {
		if (!selectedConversationId || !currentWorkspaceId || activeRequestId || thread.operation || !selectedContextIsReadable) return;
		if (conversationId !== selectedConversationId ||
			conversationWorkspaceId !== currentWorkspaceId) {
			setMessages(chatScope, []);
			setConversation(chatScope, selectedConversationId, currentWorkspaceId);
		}
	}, [
		selectedConversationId, currentWorkspaceId, conversationId,
		conversationWorkspaceId, activeRequestId, chatScope, setConversation, setMessages, thread.operation, selectedContextIsReadable,
	]);

	useEffect(() => {
		if (!selectedConversationId || accessDenied || activeRequestId || thread.operation ||
			(!conversationDetailQuery.isError && (!conversationDetailQuery.isSuccess || selectedContextIsReadable))) return;
		setMessages(chatScope, (messages) => messages.filter((message) =>
			message.origin?.source === "feedback" && !message.generation && !message.unifiedSelection));
	}, [selectedConversationId, accessDenied, activeRequestId, thread.operation, conversationDetailQuery.isError,
		conversationDetailQuery.isSuccess, selectedContextIsReadable, chatScope, setMessages]);

	useEffect(() => {
		if (!selectedConversationId || !messagesQuery.isSuccess || !generationsQuery.isSuccess ||
			activeRequestId || thread.operation || !selectedContextIsReadable || conversationId !== selectedConversationId ||
			conversationWorkspaceId !== currentWorkspaceId) {
			return;
		}
		// A list refresh must not bypass a failed explicit Generation verification.
		const recoveringIds = new Set((useAiChatStore.getState().threads[chatScope]?.messages ?? [])
			.flatMap((message) => message.previewRecovery ? [message.previewRecovery.generationId] : []));
		const historyMessages = messagesQuery.data.pages.flatMap((page) => page.items)
			.filter((message) => message.role !== "ASSISTANT" || typeof message.metadata?.generationId !== "string" ||
				!recoveringIds.has(message.metadata.generationId));
		hydrateHistory(chatScope, selectedConversationId, currentWorkspaceId!,
			historyMessages, savedGenerations, thread.epoch);
	}, [
		chatScope, selectedConversationId, conversationId, conversationWorkspaceId,
		currentWorkspaceId, currentPageId, activeRequestId, messagesQuery.data,
		messagesQuery.isSuccess, generationsQuery.isSuccess, savedGenerations, hydrateHistory, thread.epoch, thread.operation, selectedContextIsReadable,
	]);

	const selectHistoryConversation = (id: string) => {
		if (!currentWorkspaceId || isPending) return false;
		return resetAiChatSelection(chatScope, historyKey, { id, workspaceId: currentWorkspaceId });
	};

	const startNewChat = () => {
		if (isPending) return false;
		return resetAiChatSelection(chatScope, historyKey);
	};

	const refreshHistory = async (id: string, origin?: AiOperationToken) => {
		const userId = origin?.userId ?? user?.id;
		if (!userId) return;
		const originAccessId = origin ? origin.accessId : accessId;
		const filters = origin ? [
			{ workspaceId: origin.workspaceId, scope: "GLOBAL" as const },
			{ workspaceId: origin.workspaceId, scope: "PAGE" as const },
			...(origin.pageId ? [{ workspaceId: origin.workspaceId, scope: "PAGE" as const, pageId: origin.pageId }] : []),
		] : [conversationFilters, workspacePageFilters].filter((filter) => filter !== null);
		await Promise.all([
			...filters.map((filter) => queryClient.invalidateQueries({ queryKey: aiHistoryKeys.conversations(userId, filter, originAccessId), exact: true })),
			queryClient.invalidateQueries({ queryKey: aiHistoryKeys.messages(userId, id, originAccessId), exact: true }),
			queryClient.invalidateQueries({ queryKey: aiHistoryKeys.generations(userId, id, originAccessId), exact: true }),
		]);
	};

	const unifiedOrchestrator = () => {
		const view = operationView();
		if (!view) return null;
		return createUnifiedAskOrchestrator({ view, liveView: () => liveViewRef.current,
			ask: (request) => askMutation.mutateAsync({ ...request, ...(view.shareToken ? { shareToken: view.shareToken } : {}) }),
			readConversation: async (id) => {
				const options = aiConversationDetailOptions(view.userId ?? "", id, undefined, view.shareToken);
				// Owner preflight must not join a GET from an older token entry.
				if (view.shareToken) await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
				return queryClient.fetchQuery(options);
			},
			getGeneration: (id) => view.shareToken ? getAiGeneration(id, undefined, view.shareToken) : getAiGeneration(id), refreshHistory,
			denyAccess: (error, resource) => {
				const denied = handleAiAuthorizationDenial(queryClient, error, resource);
				if (denied) toast.error(getAiChatErrorMessage(error, "Unable to access this AI resource."));
				return denied;
			},
		});
	};
	const sendUnifiedAsk = (request: UnifiedAskInput) => unifiedOrchestrator()?.send(request) ?? Promise.resolve(false);
	const selectUnifiedAskPageCandidate = (messageId: string, pageId: string) => unifiedOrchestrator()?.selectCandidate(messageId, pageId) ?? Promise.resolve(false);
	const retryUnifiedAskPreview = (messageId: string) => unifiedOrchestrator()?.retryPreview(messageId) ?? Promise.resolve(false);

	const prepareUnifiedAskSubmission = (instruction: string) => {
		const view = operationView();
		if (!view?.userId || !view.workspaceId || view.pageId || getUnifiedAskInstructionError(instruction) || isPending ||
			Object.values(useAiChatStore.getState().threads).some((item) => item.pendingSubmission) || !startNewChat()) return false;
		const epoch = useAiChatStore.getState().threads[view.chatScope]?.epoch ?? 0;
		return useAiChatStore.getState().queueUnifiedSubmission({
			userId: view.userId, workspaceId: view.workspaceId, pageId: view.pageId, chatScope: view.chatScope, accessId: view.accessId, epoch,
		}, instruction, getAiSelectionRevision(historyKey));
	};
	const consumeUnifiedAskSubmission = () => {
		const view = operationView();
		if (!view?.userId || !view.workspaceId) {
			useAiChatStore.getState().clearPendingSubmissions();
			return Promise.resolve(false);
		}
		const pending = useAiChatStore.getState().takeUnifiedSubmission({
			userId: view.userId, workspaceId: view.workspaceId, pageId: view.pageId, chatScope: view.chatScope, accessId: view.accessId,
			epoch: useAiChatStore.getState().threads[view.chatScope]?.epoch ?? 0,
		}, getAiSelectionRevision(historyKey));
		if (!pending || getSelectedAiConversation(historyKey)) return Promise.resolve(false);
		return sendUnifiedAsk({ instruction: pending.instruction });
	};

	/**
	 * Reset only the current thread if the workspace changes.
	 * Other Page threads remain untouched.
	 */
	useEffect(() => {
		if (
			conversationWorkspaceId &&
			currentWorkspaceId &&
			conversationWorkspaceId !== currentWorkspaceId
		) {
			newChat(chatScope);
		}
	}, [chatScope, conversationWorkspaceId, currentWorkspaceId, newChat]);

	const isSending = activeRequestId !== null;

	const isPending =
		isSending ||
		Boolean(thread.operation) ||
		Boolean(selectedConversationId && conversationDetailQuery.isPending && !accessDenied) ||
		confirmPageCompositionMutation.isPending ||
		confirmModificationPlanMutation.isPending ||
		discardMutation.isPending;

	/**
	 * Update a previously stored generation in this chat.
	 * Used by Apply / Discard actions.
	 */
	const updateGenerationInMessages = (generation: AiGeneration) => {
		const existingMessages =
			useAiChatStore.getState().threads[chatScope]?.messages ?? [];

		if (
			!existingMessages.some(
				(message) => message.generation?.id === generation.id,
			)
		) {
			return;
		}

		setMessages(chatScope, (messages: AiChatMessage[]) =>
			messages.map((message) =>
				message.generation?.id === generation.id
					? {
							...message,
							generation,
						}
					: message,
			),
		);
	};

	/**
	 * Generate a modification plan for a snapshot of Page A.
	 * Results are written back only to Page A's chat scope.
	 */
	const readLegacyGeneration = async (generationId: string, workspaceId: string, id: string, pageId: string | null, scope: string, requestId: string) => {
		try { return await (shareToken ? getAiGeneration(generationId, undefined, shareToken) : getAiGeneration(generationId)); }
		catch (error) {
			if (!isActiveRequest(scope, requestId)) throw error;
			if (user?.id && handleAiAuthorizationDenial(queryClient, error, { userId: user.id, workspaceId, accessId,
				conversationId: id, pageId, generationId })) {
				const feedback = getAiChatErrorMessage(error, "Unable to access this AI draft.");
				toast.error(feedback);
				throw new AiModificationActionError(feedback);
			}
			throw error;
		}
	};
	const sendModificationPlan = async (
		content: string,
		targetPageId: string,
		targetWorkspaceId: string,
		scope: string,
		requestId: string,
		existingConversationId: string | null,
	) => {
		const result = await generateModificationPlanMutation.mutateAsync({
			pageId: targetPageId,
			...(shareToken ? { shareToken } : {}),
			input: {
				instruction: content,
				requestId,
				...(existingConversationId ? { conversationId: existingConversationId } : {}),
			},
		});

		if (!isActiveRequest(scope, requestId)) {
			return;
		}
		setConversation(scope, result.conversationId, targetWorkspaceId);
		saveSelectedAiConversation(historyKey, result.conversationId);

		setPendingStage(scope, requestId, "loading-preview");

		const generation = await readLegacyGeneration(result.generationId, targetWorkspaceId, result.conversationId, targetPageId, scope, requestId);

		if (!isActiveRequest(scope, requestId)) {
			return;
		}

		if (generation.status === "FAILED") {
			throw new Error(
				generation.error_message ??
					"AI modification plan generation failed.",
			);
		}

		const assistantMessage: AiChatMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			content:
				result.status === "PLAN_READY"
					? "I've prepared changes for this page. Review them before applying."
					: "I need more context before I can safely modify this page.",
			capability: "GENERATE_PAGE_MODIFICATION_PLAN",
			generation,
			createdAt: generation.created_at,
		};

		addMessage(scope, assistantMessage, requestId);
		void refreshHistory(result.conversationId);
	};

	/**
	 * Dashboard natural-language planning: the title is extracted by FastAPI,
	 * and the actual Page is resolved and authorized by NestJS.
	 * PAGE-scoped drafts must not be attached to GLOBAL chat history.
	 */
	const showPageInstructionResult = async (
		result: GeneratePagePlanFromInstructionResponse,
		originalInstruction: string,
		workspaceId: string,
		scope: string,
		requestId: string,
		selectionMessageId?: string,
	) => {
		if (!isActiveRequest(scope, requestId)) return;

		let message: AiChatMessage;
		const base = {
			id: selectionMessageId ?? crypto.randomUUID(),
			role: "assistant" as const,
			capability: "GENERATE_PAGE_MODIFICATION_PLAN" as const,
			createdAt: new Date().toISOString(),
		};
		switch (result.status) {
			case "UNSUPPORTED_OPERATION":
			case "NOT_A_PAGE_MODIFICATION":
				message = {
					...base,
					content: getPageInstructionFeedback(result),
				};
				break;
			case "NEEDS_CLARIFICATION":
				message = {
					...base,
					content: getPageInstructionFeedback(result),
				};
				break;
			case "PAGE_NOT_FOUND":
				message = {
					...base,
					content: getPageInstructionFeedback(result),
				};
				break;
			case "AMBIGUOUS_PAGE":
				message = {
					...base,
					content: getPageInstructionFeedback(result),
					pageSelection: {
						workspaceId,
						instruction: originalInstruction,
						candidates: result.candidates,
					},
				};
				break;
			case "PLAN_GENERATED":
			case "PLAN_NEEDS_MORE_CONTEXT": {
				if (shareToken && result.page.pageId !== currentPageId) throw new AiModificationActionError("The draft does not match the current Page.");
				setPendingStage(scope, requestId, "loading-preview");
				const generation = await readLegacyGeneration(result.plan.generationId, workspaceId, result.plan.conversationId, result.page.pageId, scope, requestId);
				if (!isActiveRequest(scope, requestId)) return;
				if (
					generation.status === "FAILED" ||
					generation.capability !== "GENERATE_PAGE_MODIFICATION_PLAN" ||
					generation.conversation_id !== result.plan.conversationId ||
					result.plan.pageId !== result.page.pageId ||
					!generation.output_data ||
					typeof generation.output_data !== "object" ||
					Array.isArray(generation.output_data) ||
					(generation.output_data as Record<string, unknown>).pageId !== result.page.pageId
				) {
					throw new Error("The generated preview did not match the selected page.");
				}
				message = {
					...base,
					content: getPageInstructionFeedback(result),
					generation,
				};
				break;
			}
		}

		if (!isActiveRequest(scope, requestId)) return;
		if (selectionMessageId) {
			setMessages(scope, (messages) =>
				messages.map((existing) =>
					existing.id === selectionMessageId ? message : existing,
				),
			);
		} else {
			addMessage(scope, message, requestId);
		}
		if (result.status === "PLAN_GENERATED" || result.status === "PLAN_NEEDS_MORE_CONTEXT") {
			// PAGE drafts are persisted on the server. Select their PAGE
			// conversation even when they originated from Dashboard Chat.
			setConversation(scope, result.plan.conversationId, workspaceId);
			saveSelectedAiConversation(historyKey, result.plan.conversationId);
			void refreshHistory(result.plan.conversationId);
		}
	};

	const sendPageInstruction = async (
		content: string,
		workspaceId: string,
		scope: string,
		requestId: string,
	) => {
		const result = await generatePagePlanFromInstructionMutation.mutateAsync({
			...(shareToken ? { shareToken } : {}),
			workspaceId,
			instruction: content,
			requestId,
		});
		await showPageInstructionResult(result, content, workspaceId, scope, requestId);
	};

	/** Continue an ambiguous choice using the original user instruction. */
	const selectPageCandidate = async (messageId: string, selectedPageId: string) => {
		if (shareToken && selectedPageId !== currentPageId) return;
		const scope = chatScope;
		const threadNow = useAiChatStore.getState().threads[scope];
		const selection = threadNow?.messages.find(
			(message) => message.id === messageId,
		)?.pageSelection;
		if (!selection || threadNow.activeRequestId || selection.workspaceId !== currentWorkspaceId ||
			!selection.candidates.some((candidate) => candidate.pageId === selectedPageId)) return;

		const requestId = crypto.randomUUID();
		if (!beginRequest(scope, requestId, "planning-modification")) return;
		try {
			const result = await generatePagePlanFromInstructionMutation.mutateAsync({
				...(shareToken ? { shareToken } : {}),
				workspaceId: selection.workspaceId,
				instruction: selection.instruction,
				selectedPageId,
				requestId,
			});
			await showPageInstructionResult(
				result, selection.instruction, selection.workspaceId, scope, requestId, messageId,
			);
		} catch (error) {
			if (isActiveRequest(scope, requestId)) {
				if (user?.id && handleAiAuthorizationDenial(queryClient, error, { userId: user.id,
					workspaceId: selection.workspaceId, accessId, conversationId: null, pageId: selectedPageId })) {
					toast.error(getAiChatErrorMessage(error, "Unable to access this page."));
					return;
				}
					toast.error(getAiChatErrorMessage(error, "Unable to generate a preview for that page."));
			}
		} finally {
			finishRequest(scope, requestId);
		}
	};

	/**
	 * Keep Writing and Page Composition behavior.
	 * Conversation ID is scoped to the active chat thread.
	 */
	const sendConversationMessage = async (
		content: string,
		selectedCapability: AiChatMode,
		targetWorkspaceId: string,
		scope: string,
		requestId: string,
		existingConversationId: string | null,
		existingConversationWorkspaceId: string | null,
	) => {
		let activeConversationId = existingConversationId;

		if (
			!activeConversationId ||
			existingConversationWorkspaceId !== targetWorkspaceId
		) {
			setPendingStage(scope, requestId, "preparing");

				const conversation = await createConversationMutation.mutateAsync({
					...(shareToken ? { shareToken } : {}),
					workspaceId: targetWorkspaceId,
					title: makeAiConversationTitle(content),
					scope: currentPageId ? "PAGE" : "GLOBAL",
					...(currentPageId ? { pageId: currentPageId } : {}),
				});

			if (!isActiveRequest(scope, requestId)) {
				return;
			}

			activeConversationId = conversation.id;

				setConversation(scope, conversation.id, targetWorkspaceId);
				saveSelectedAiConversation(historyKey, conversation.id);
		}

		if (!activeConversationId) {
			throw new Error("Unable to initialize AI conversation.");
		}

		setPendingStage(
			scope,
			requestId,
			selectedCapability === "GENERATE_PAGE_COMPOSITION"
				? "composing-page"
				: "writing",
		);

		const generation = await submitMessageMutation.mutateAsync({
			conversationId: activeConversationId,
			...(shareToken ? { shareToken } : {}),
				input: {
					content,
					capability: selectedCapability,
					requestId,
				},
		});

		if (!isActiveRequest(scope, requestId)) {
			return;
		}

		if (generation.status === "FAILED") {
			throw new Error(
				generation.error_message ?? "AI generation failed.",
			);
		}

		let assistantContent: string;

		if (generation.capability === "GENERATE_PAGE_COMPOSITION") {
			assistantContent =
				"I've prepared a page draft. Review it before creating the page.";
		} else {
			const writingText = getWritingText(generation);

			if (!writingText) {
				throw new Error("AI writing response did not contain text.");
			}

			assistantContent = writingText;
		}

		const assistantMessage: AiChatMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			content: assistantContent,
			capability: generation.capability,
			generation,
			createdAt: generation.created_at,
		};

			addMessage(scope, assistantMessage, requestId);
			void refreshHistory(activeConversationId);
	};

	/**
	 * Called when the user submits the composer.
	 */
	const sendMessage = async () => {
		const content = input.trim();

		const currentThread = useAiChatStore.getState().threads[chatScope];
		if (!content || isPending || currentThread?.operation || currentThread?.activeRequestId) {
			return;
		}

		/**
		 * Snapshot current context before the request begins.
		 */
		const scope = chatScope;
		const selectedCapability = mode;
		const targetPageId = currentPageId ?? "";
		const targetWorkspaceId = currentWorkspaceId ?? "";

		const existingConversationId = conversationId;
		const existingConversationWorkspaceId = conversationWorkspaceId;

		if (!targetWorkspaceId) {
			toast.error("No workspace available.");
			return;
		}

		// PAGE drafts belong to a PAGE conversation, never an existing GLOBAL
		// history conversation. Detach first to avoid history refresh replacing
		// the ephemeral plan/selection messages from this request.
		if (selectedCapability === "GENERATE_PAGE_MODIFICATION_PLAN" && !targetPageId &&
			selectedConversationId) {
			saveSelectedAiConversation(historyKey, null);
			newChat(scope);
			useAiChatStore.getState().setMode(scope, selectedCapability);
		}

		const requestId = crypto.randomUUID();

		const initialStage: AiChatPendingStage =
			selectedCapability === "GENERATE_PAGE_MODIFICATION_PLAN"
				? "planning-modification"
				: "preparing";

		/**
		 * Prevent duplicate requests in the same thread.
		 */
		const requestStarted = beginRequest(scope, requestId, initialStage);

		if (!requestStarted) {
			return;
		}

		const userMessage: AiChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content,
			capability: selectedCapability,
			createdAt: new Date().toISOString(),
		};

		addMessage(scope, userMessage, requestId);

		setInput(scope, "");

		try {
			if (selectedCapability === "GENERATE_PAGE_MODIFICATION_PLAN") {
				if (!targetPageId) {
					await sendPageInstruction(content, targetWorkspaceId, scope, requestId);
				} else {
					await sendModificationPlan(
						content,
						targetPageId,
						targetWorkspaceId,
						scope,
						requestId,
							existingConversationWorkspaceId === targetWorkspaceId
								&& canReuseSelectedConversation("PAGE", targetPageId)
								? existingConversationId
							: null,
					);
				}
			} else {
				await sendConversationMessage(
					content,
					selectedCapability,
					targetWorkspaceId,
					scope,
					requestId,
						canReuseSelectedConversation(currentPageId ? "PAGE" : "GLOBAL", currentPageId)
							? existingConversationId : null,
						existingConversationWorkspaceId,
				);
			}
		} catch (error) {
			if (isActiveRequest(scope, requestId)) {
				if (user?.id && handleAiAuthorizationDenial(queryClient, error, { userId: user.id,
					workspaceId: targetWorkspaceId, accessId, conversationId: useAiChatStore.getState().threads[scope]?.conversationId ?? existingConversationId,
					pageId: targetPageId || null })) {
					toast.error(getAiChatErrorMessage(error, "Unable to access this AI resource."));
					return;
				}
				const errorMessage = getAiChatErrorMessage(
					error,
					"Unable to get a response from AI.",
				);

				const assistantErrorMessage: AiChatMessage = {
					id: crypto.randomUUID(),
					role: "assistant",
					content: `I couldn't complete your request. ${errorMessage}`,
					capability: selectedCapability,
					createdAt: new Date().toISOString(),
				};

				addMessage(scope, assistantErrorMessage, requestId);

				toast.error(errorMessage);
			}
		} finally {
			finishRequest(scope, requestId);
		}
	};

	/**
	 * Confirm Page Composition.
	 */
	const acquireDraftAction = (kind: "confirm" | "discard", generationId: string) => {
		const view = operationView();
		if (!view || !canReadGeneration(generationId) || isPending || generationActionRef.current || (selectedConversationId && !selectedContextIsReadable)) return null;
		const operation = acquireAiChatOperation(view, () => liveViewRef.current, { type: kind, generationId });
		if (operation) generationActionRef.current = true;
		return operation;
	};

	const verifyDraftAction = (fresh: AiGeneration, generationId: string, operation: NonNullable<ReturnType<typeof acquireDraftAction>>) => {
		if (!isValidAiGeneration(fresh) || fresh.id !== generationId || fresh.workspace_id !== operation.token.workspaceId ||
			fresh.status !== "COMPLETED" || (operation.initialConversationId && fresh.conversation_id !== operation.initialConversationId)) {
			throw new AiModificationActionError("This draft does not belong to the current conversation/context, or is no longer actionable.");
		}
	};

	const confirmPageComposition = async (generationId: string, input: ConfirmPageCompositionRequest = {}) => {
		const operation = acquireDraftAction("confirm", generationId);
		if (!operation) return;
		try {
			const fresh = await (operation.shareToken ? getAiGeneration(generationId, undefined, operation.shareToken) : getAiGeneration(generationId));
			if (!operation.isCurrent()) return;
			verifyDraftAction(fresh, generationId, operation);
			if (!isValidAiCompositionGeneration(fresh)) throw new AiModificationActionError("This page draft could not be verified.");
			const result = await confirmPageCompositionMutation.mutateAsync({ generationId, input, ...(operation.shareToken ? { shareToken: operation.shareToken } : {}) });
			if (!operation.isCurrent()) return;
			if (result.generation.id !== generationId || result.generation.workspace_id !== operation.token.workspaceId ||
				result.generation.conversation_id !== fresh.conversation_id || result.generation.status !== "APPLIED" ||
				!isValidAiCompositionGeneration(result.generation) || !result.execution?.pageId) {
				throw new AiModificationActionError("The action completed, but its result could not be verified. Refresh history before trying again.");
			}
			updateGenerationInMessages(result.generation);
			if (fresh.conversation_id) void refreshHistory(fresh.conversation_id, operation.token).catch(() => {});
			toast.success("Page created successfully.");
			if (operation.isCurrent()) router.push(`/page/${result.execution.pageId}`);
		} catch (error) {
			const current = operation.isCurrent();
			if (current) handleAiAuthorizationDenial(queryClient, error, { ...operation.token, conversationId: operation.initialConversationId, generationId });
			if (current) toast.error(getAiChatErrorMessage(error, "Unable to create the page."));
		} finally {
			generationActionRef.current = false;
			useAiChatStore.getState().releaseOperation(operation.token);
		}
	};

	/** Shared lock includes preflight. Backend authorization/freshness remain authoritative. */
	const confirmAiModificationPlan = async (generationId: string, pageId: string): Promise<AiGeneration | null> => {
		const operation = acquireDraftAction("confirm", generationId);
		if (!operation) return null;
		try {
			const fresh = await (operation.shareToken ? getAiGeneration(generationId, undefined, operation.shareToken) : getAiGeneration(generationId));
			if (!operation.isCurrent()) return null;
			verifyDraftAction(fresh, generationId, operation);
			assertModificationDraftTarget(fresh, pageId, operation.token.workspaceId, operation.token.pageId ?? undefined);
			if (!isAiModificationPlan(fresh.output_data)) throw new AiModificationActionError("This modification draft is malformed.");
			const result = await confirmModificationPlanMutation.mutateAsync({ generationId, pageId, ...(operation.shareToken ? { shareToken: operation.shareToken } : {}) });
			if (!operation.isCurrent()) return null;
			if (!isValidAiGeneration(result.generation) || result.generation.id !== generationId || result.generation.workspace_id !== operation.token.workspaceId ||
				result.generation.conversation_id !== fresh.conversation_id ||
				result.generation.capability !== fresh.capability || result.generation.status !== "APPLIED" ||
				!isAiModificationPlan(result.generation.output_data) || result.generation.output_data.pageId !== pageId) {
				throw new AiModificationActionError("The action completed, but its result could not be verified. Refresh history before trying again.");
			}
			updateGenerationInMessages(result.generation);
			if (fresh.conversation_id) void refreshHistory(fresh.conversation_id, operation.token).catch(() => {});
			toast.success("Page changes applied successfully.");
			return result.generation;
		} catch (error) {
			const current = operation.isCurrent();
			if (current) handleAiAuthorizationDenial(queryClient, error, { ...operation.token, conversationId: operation.initialConversationId, generationId });
			if (current && axios.isAxiosError(error) && error.response?.status === 409) return await settleConflict(generationId, operation);
			if (current) toast.error(getAiChatErrorMessage(error, "Unable to apply the page changes."));
			return null;
		} finally {
			generationActionRef.current = false;
			useAiChatStore.getState().releaseOperation(operation.token);
		}
	};

	// 409 means the draft was handled elsewhere or its Page changed since planning.
	// Re-read it: a settled draft shows its real status; an unchanged one is outdated.
	const settleConflict = async (generationId: string, operation: NonNullable<ReturnType<typeof acquireDraftAction>>): Promise<AiGeneration | null> => {
		const latest = await (operation.shareToken ? getAiGeneration(generationId, undefined, operation.shareToken) : getAiGeneration(generationId))
			.catch(() => null);
		if (!operation.isCurrent()) return null;
		if (latest && latest.id === generationId && isValidAiGeneration(latest) &&
			latest.workspace_id === operation.token.workspaceId && latest.status !== "COMPLETED") {
			updateGenerationInMessages(latest);
			toast.error("This AI draft has already been handled.");
			return latest;
		}
		useAiChatStore.getState().markGenerationStale(generationId);
		toast.error("The page changed after this draft was created. Send your request again to get a new draft.");
		return null;
	};

	const discardGeneration = async (generationId: string): Promise<AiGeneration | null> => {
		const operation = acquireDraftAction("discard", generationId);
		if (!operation) return null;
		try {
			const fresh = await (operation.shareToken ? getAiGeneration(generationId, undefined, operation.shareToken) : getAiGeneration(generationId));
			if (!operation.isCurrent()) return null;
			verifyDraftAction(fresh, generationId, operation);
			if (fresh.capability === "GENERATE_PAGE_MODIFICATION_PLAN") {
				if (!isAiModificationPlan(fresh.output_data)) throw new AiModificationActionError("The draft has no valid target Page. Refresh your chat.");
				assertModificationDraftTarget(fresh, fresh.output_data.pageId, operation.token.workspaceId, operation.token.pageId ?? undefined, true);
			} else if (fresh.capability === "GENERATE_PAGE_COMPOSITION" && !isValidAiCompositionGeneration(fresh)) {
				throw new AiModificationActionError("This page draft could not be verified.");
			}
			const generation = await discardMutation.mutateAsync(operation.shareToken ? { generationId, shareToken: operation.shareToken } : generationId);
			if (!operation.isCurrent()) return null;
			if (!isValidAiGeneration(generation) || generation.id !== generationId || generation.workspace_id !== operation.token.workspaceId ||
				generation.conversation_id !== fresh.conversation_id ||
				generation.capability !== fresh.capability || generation.status !== "DISCARDED") {
				throw new AiModificationActionError("The action completed, but its result could not be verified. Refresh history before trying again.");
			}
			updateGenerationInMessages(generation);
			if (fresh.conversation_id) void refreshHistory(fresh.conversation_id, operation.token).catch(() => {});
			toast.success("AI draft discarded.");
			return generation;
		} catch (error) {
			const current = operation.isCurrent();
			if (current) handleAiAuthorizationDenial(queryClient, error, { ...operation.token, conversationId: operation.initialConversationId, generationId });
			if (current) toast.error(getAiChatErrorMessage(error, "Unable to discard the AI draft."));
			return null;
		} finally {
			generationActionRef.current = false;
			useAiChatStore.getState().releaseOperation(operation.token);
		}
	};
	return {
		shareToken,
		accessId,
		chatScope,
		accessDenied,
		historyAccessVerified,
		visibleMessages,
		canReadGeneration,
		handleGenerationAccessError,
		currentWorkspaceId,
		isPending,
		isSending,
		pendingStage,
			sendMessage,
			sendUnifiedAsk,
			selectUnifiedAskPageCandidate,
			retryUnifiedAskPreview,
			prepareUnifiedAskSubmission,
			consumeUnifiedAskSubmission,
			selectPageCandidate,
		confirmPageComposition,
		confirmAiModificationPlan,
		discardGeneration,
		startNewChat,
		selectHistoryConversation,
		selectedConversationId,
		conversations,
		conversationsQuery,
		workspacePageConversationsQuery,
		messagesQuery: { ...messagesQuery,
			isPending: !accessDenied && (messagesQuery.isPending || Boolean(selectedConversationId && conversationDetailQuery.isPending)),
			isError: accessDenied || messagesQuery.isError || Boolean(selectedConversationId && (conversationDetailQuery.isError ||
				conversationDetailQuery.isSuccess && !selectedContextIsReadable)),
		},
		conversationDetailQuery,
		generationsQuery,
		savedGenerations,
	};
}
