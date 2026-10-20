"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";

import {
	useConfirmAiModificationPlan,
	useConfirmPageComposition,
	useCreateAiConversation,
	useDiscardAiGeneration,
	useGenerateAiModificationPlan,
	useGeneratePagePlanFromInstruction,
	useSubmitAiMessage,
} from "@/entities/ai-assistant/model/ai-assistant.mutations";

import type {
	AiGeneration,
	GeneratePagePlanFromInstructionResponse,
	ConfirmPageCompositionRequest,
} from "@/entities/ai-assistant/model/ai-assistant.types";

import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import { usePage } from "@/entities/page/model/page.queries";
import { useUser } from "@/features/auth";
import { getAiChatErrorMessage } from "./ai-chat-error";

import type { AiChatMessage, AiChatMode, AiChatPendingStage } from "./types";
import { aiHistoryKeys, useAiHistoryConversations, useAiHistoryGenerations, useAiHistoryMessages } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { mapAiHistoryMessages } from "./ai-history-mapper";
import { mergeAiWorkspaceHistory, shouldReuseAiConversation } from "./ai-history-conversations";
import { getPageInstructionFeedback } from "./page-instruction-feedback";
import { makeAiConversationTitle } from "./ai-conversation-title";
import { AiModificationActionError, assertModificationDraftTarget } from "./ai-modification-action";
import {
	aiHistorySelectionKey,
	saveSelectedAiConversation,
	useSelectedAiConversation,
} from "./ai-history-selection";

import {
	EMPTY_AI_CHAT_THREAD,
	getAiChatScope,
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

export function useAiChat(currentPageId?: string) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { user } = useUser();
	const { data: workspaces = [] } = useWorkspaces();
	const { data: currentPage } = usePage(currentPageId);

	const addMessage = useAiChatStore((state) => state.addMessage);

	const setInput = useAiChatStore((state) => state.setInput);

	const setConversation = useAiChatStore((state) => state.setConversation);

	const setMessages = useAiChatStore((state) => state.setMessages);

	const newChat = useAiChatStore((state) => state.newChat);

	const beginRequest = useAiChatStore((state) => state.beginRequest);

	const setPendingStage = useAiChatStore((state) => state.setPendingStage);

	const finishRequest = useAiChatStore((state) => state.finishRequest);

	const createConversationMutation = useCreateAiConversation();

	const submitMessageMutation = useSubmitAiMessage();

	const generateModificationPlanMutation = useGenerateAiModificationPlan();
	const generatePagePlanFromInstructionMutation = useGeneratePagePlanFromInstruction();

	const confirmPageCompositionMutation = useConfirmPageComposition();

	const confirmModificationPlanMutation = useConfirmAiModificationPlan();

	const discardMutation = useDiscardAiGeneration();
	// Mutation state updates on the next render; a ref also blocks rapid double clicks.
	const generationActionRef = useRef(false);

	const currentWorkspaceId = useMemo(() => {
		if (currentPageId) return currentPage?.workspace_id ?? null;
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
	}, [user?.lastActiveWorkspaceId, workspaces, currentPageId, currentPage?.workspace_id]);

	const chatScope = getAiChatScope(currentPageId, currentWorkspaceId, user?.id);
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

	const historyKey = aiHistorySelectionKey(
		user?.id,
		currentWorkspaceId,
		currentPageId,
	);
	const selectedConversationId = useSelectedAiConversation(historyKey);
	const conversationFilters = currentWorkspaceId
		? {
				workspaceId: currentWorkspaceId,
				scope: currentPageId ? ("PAGE" as const) : ("GLOBAL" as const),
				...(currentPageId ? { pageId: currentPageId } : {}),
			}
		: null;
	const conversationsQuery = useAiHistoryConversations(user?.id, conversationFilters);
	// The Dashboard shows workspace-wide GLOBAL chats and PAGE drafts. In a
	// Page sidebar, history must remain strictly scoped to that Page.
	const workspacePageFilters = currentWorkspaceId && !currentPageId
		? { workspaceId: currentWorkspaceId, scope: "PAGE" as const }
		: null;
	const workspacePageConversationsQuery = useAiHistoryConversations(
		user?.id,
		workspacePageFilters,
	);
	const messagesQuery = useAiHistoryMessages(user?.id, selectedConversationId);
	const generationsQuery = useAiHistoryGenerations(user?.id, selectedConversationId);
	const conversations = useMemo(() => {
		const global = conversationsQuery.data?.pages.flatMap((page) => page.items) ?? [];
		if (currentPageId) return global;
		const pages = workspacePageConversationsQuery.data?.pages.flatMap((page) => page.items) ?? [];
		return mergeAiWorkspaceHistory(global, pages, currentWorkspaceId, true);
	}, [conversationsQuery.data, workspacePageConversationsQuery.data, currentPageId, currentWorkspaceId]);
	const selectedConversation = conversations.find(
		(conversation) => conversation.id === selectedConversationId,
	);
	const canReuseSelectedConversation = (scope: "GLOBAL" | "PAGE", pageId?: string) =>
		Boolean(
			currentWorkspaceId &&
			shouldReuseAiConversation(selectedConversation, currentWorkspaceId, scope, pageId),
		);
	const savedGenerations = useMemo(
		() => generationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
		[generationsQuery.data],
	);

	// Restore the selected conversation after F5. Never trust a persisted id
	// for authorization; the backend verifies the owner and page/workspace.
	useEffect(() => {
		if (!selectedConversationId || !currentWorkspaceId || activeRequestId) return;
		if (conversationId !== selectedConversationId ||
			conversationWorkspaceId !== currentWorkspaceId) {
			setMessages(chatScope, []);
			setConversation(chatScope, selectedConversationId, currentWorkspaceId);
		}
	}, [
		selectedConversationId, currentWorkspaceId, conversationId,
		conversationWorkspaceId, activeRequestId, chatScope, setConversation, setMessages,
	]);

	useEffect(() => {
		if (!selectedConversationId || !messagesQuery.isSuccess || !generationsQuery.isSuccess ||
			activeRequestId || conversationId !== selectedConversationId ||
			conversationWorkspaceId !== currentWorkspaceId) {
			return;
		}
		const historyMessages = messagesQuery.data.pages.flatMap((page) => page.items);
		setMessages(
			chatScope,
			mapAiHistoryMessages(historyMessages, savedGenerations),
		);
	}, [
		chatScope, selectedConversationId, conversationId, conversationWorkspaceId,
		currentWorkspaceId, currentPageId, activeRequestId, messagesQuery.data,
		messagesQuery.isSuccess, generationsQuery.isSuccess, savedGenerations, setMessages,
	]);

	const selectHistoryConversation = (id: string) => {
		if (!currentWorkspaceId || isPending) return;
		newChat(chatScope);
		setConversation(chatScope, id, currentWorkspaceId);
		saveSelectedAiConversation(historyKey, id);
	};

	const startNewChat = () => {
		if (isPending) return;
		saveSelectedAiConversation(historyKey, null);
		newChat(chatScope);
	};

	const refreshHistory = async (id: string) => {
		if (!user?.id) return;
		await Promise.all([
			...(conversationFilters ? [queryClient.invalidateQueries({ queryKey: aiHistoryKeys.conversations(user.id, conversationFilters) })] : []),
			...(workspacePageFilters ? [queryClient.invalidateQueries({ queryKey: aiHistoryKeys.conversations(user.id, workspacePageFilters) })] : []),
			queryClient.invalidateQueries({ queryKey: aiHistoryKeys.messages(user.id, id) }),
			queryClient.invalidateQueries({ queryKey: aiHistoryKeys.generations(user.id, id) }),
		]);
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

		const generation = await getAiGeneration(result.generationId);

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
				setPendingStage(scope, requestId, "loading-preview");
				const generation = await getAiGeneration(result.plan.generationId);
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
			workspaceId,
			instruction: content,
			requestId,
		});
		await showPageInstructionResult(result, content, workspaceId, scope, requestId);
	};

	/** Continue an ambiguous choice using the original user instruction. */
	const selectPageCandidate = async (messageId: string, selectedPageId: string) => {
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

		if (!content || isPending) {
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
	const confirmPageComposition = async (
		generationId: string,
		input: ConfirmPageCompositionRequest = {},
	) => {
		try {
			const result = await confirmPageCompositionMutation.mutateAsync({
				generationId,
				input,
			});

				updateGenerationInMessages(result.generation);
				if (selectedConversationId) void refreshHistory(selectedConversationId);

			toast.success("Page created successfully.");

			router.push(`/page/${result.execution.pageId}`);
		} catch (error) {
			toast.error(
				getAiChatErrorMessage(error, "Unable to create the page."),
			);
		}
	};

	/**
	 * Confirm Modification Plan.
	 *
	 * This is a frontend UX guard.
	 * NestJS remains responsible for authorization and
	 * deciding the authoritative target page.
	 */
	const confirmAiModificationPlan = async (
		generationId: string,
		pageId: string,
	): Promise<AiGeneration | null> => {
		if (isPending || generationActionRef.current) return null;
		generationActionRef.current = true;

		try {
			// Read the authoritative draft again. Never trust the displayed Page ID,
			// stale history or a draft selected before switching Workspaces.
			const fresh = await getAiGeneration(generationId);
			assertModificationDraftTarget(fresh, pageId, currentWorkspaceId, currentPageId);
			const result = await confirmModificationPlanMutation.mutateAsync({
				generationId,
				pageId,
			});

			updateGenerationInMessages(result.generation);
			if (fresh.conversation_id) void refreshHistory(fresh.conversation_id);

			toast.success("Page changes applied successfully.");
			return result.generation;
		} catch (error) {
			toast.error(
				getAiChatErrorMessage(error, "Unable to apply the page changes."),
			);
			return null;
		} finally {
			generationActionRef.current = false;
		}
	};

	/**
	 * Discard Generation.
	 */
	const discardGeneration = async (generationId: string): Promise<AiGeneration | null> => {
		if (isPending || generationActionRef.current) return null;
		generationActionRef.current = true;
		try {
			const fresh = await getAiGeneration(generationId);
			if (fresh.capability === "GENERATE_PAGE_MODIFICATION_PLAN") {
				const data = fresh.output_data;
				const pageId = data && typeof data === "object" && !Array.isArray(data) &&
					"pageId" in data ? data.pageId : null;
				if (typeof pageId !== "string") throw new AiModificationActionError("The draft has no valid target Page. Refresh your chat.");
				assertModificationDraftTarget(fresh, pageId, currentWorkspaceId, currentPageId, true);
			}
			const generation = await discardMutation.mutateAsync(generationId);

			updateGenerationInMessages(generation);
			if (fresh.conversation_id) void refreshHistory(fresh.conversation_id);

			toast.success("AI draft discarded.");
			return generation;
		} catch (error) {
			toast.error(
				getAiChatErrorMessage(error, "Unable to discard the AI draft."),
			);
			return null;
		} finally {
			generationActionRef.current = false;
		}
	};

	return {
		chatScope,
		currentWorkspaceId,
		isPending,
		isSending,
		pendingStage,
		 sendMessage,
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
		messagesQuery,
		generationsQuery,
		savedGenerations,
	};
}
