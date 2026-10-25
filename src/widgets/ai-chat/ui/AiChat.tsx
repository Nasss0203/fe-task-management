"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiPageAccessContext } from "@/entities/ai-assistant/model/ai-assistant.access";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { getAiChatErrorMessage } from "../model/ai-chat-error";
import { Button } from "@/shared/ui/button";
import { useAiChat } from "../model/use-ai-chat";

import { EMPTY_AI_CHAT_THREAD, getAiGenerationPageId, useAiChatStore } from "../model/use-ai-chat-store";

import { AiChatComposer } from "./AiChatComposer";
import { AiChatEmptyState } from "./AiChatEmptyState";
import { AiChatHeader } from "./AiChatHeader";
import { AiChatHistory } from "./AiChatHistory";
import { AiMessageItem, isReviewableAiGeneration } from "./AiMessageItem";
import { AiMessageList } from "./AiMessageList";
import { AiModificationActionDialog } from "./AiModificationActionDialog";

interface AiChatProps {
	showHeader?: boolean;
	currentPageId?: string;
	pageAccess?: AiPageAccessContext;
}

export function AiChat({ showHeader = false, currentPageId, pageAccess }: AiChatProps) {
	const router = useRouter();
	const [draftPreview, setDraftPreview] = useState<{
		requestId: number;
		scope: string;
		conversationId: string;
		generation: AiGeneration;
	} | null>(null);
	const [loadingDraft, setLoadingDraft] = useState<{
		requestId: number;
		scope: string;
		conversationId: string;
		generationId: string;
	} | null>(null);
	const draftRequestRef = useRef(0);
	const [action, setAction] = useState<{ kind: "apply" | "discard"; generationId: string; pageId: string; scope: string } | null>(null);
	const [actionPending, setActionPending] = useState(false);
	/**
	 * Get the chat scope for the current page.
	 * Page chat: page:<pageId>
	 * Dashboard chat: global
	 */
	const setInput = useAiChatStore((state) => state.setInput);

	const selectQuickAction = useAiChatStore(
		(state) => state.selectQuickAction,
	);

	const {
		shareToken,
		chatScope,
		sendUnifiedAsk,
		consumeUnifiedAskSubmission,
		selectPageCandidate,
		selectUnifiedAskPageCandidate,
		retryUnifiedAskPreview,
		confirmPageComposition,
		confirmAiModificationPlan,
		discardGeneration,
		isPending,
		pendingStage,
		currentWorkspaceId,
		startNewChat,
		selectHistoryConversation,
		selectedConversationId,
		conversations,
		conversationsQuery,
		messagesQuery,
		generationsQuery,
		savedGenerations,
		accessDenied,
		visibleMessages,
		canReadGeneration,
		handleGenerationAccessError,
	} = useAiChat(currentPageId, pageAccess);
	const thread = useAiChatStore((state) => state.threads[chatScope] ?? EMPTY_AI_CHAT_THREAD);
	const accessDenials = useAiChatStore((state) => state.accessDenials);
	const { input } = thread;
	const messages = accessDenied ? [] : shareToken ? visibleMessages ?? [] : thread.messages;
	useEffect(() => {
		let cancelled = false;
		// Strict Mode's trial effect is cleaned up before this microtask can consume the ticket.
		queueMicrotask(() => { if (!cancelled) void consumeUnifiedAskSubmission(); });
		return () => { cancelled = true; };
	}, [chatScope, consumeUnifiedAskSubmission]);
	// A draft opened in another chat/workspace must not appear after navigation
	// or a New Chat action, even if its API request finishes afterward.
	useEffect(() => {
		draftRequestRef.current += 1;
		setAction(null);
		setDraftPreview(null);
		setLoadingDraft(null);
		return () => { draftRequestRef.current += 1; };
	}, [chatScope, selectedConversationId, thread.epoch, currentWorkspaceId, currentPageId]);
	useEffect(() => {
		if (accessDenied || draftPreview && canReadGeneration?.(draftPreview.generation.id) === false ||
			loadingDraft && canReadGeneration?.(loadingDraft.generationId) === false ||
			action && canReadGeneration?.(action.generationId) === false) {
			draftRequestRef.current += 1;
			setDraftPreview(null);
			setLoadingDraft(null);
			setAction(null);
		}
	}, [accessDenied, accessDenials, canReadGeneration, draftPreview, loadingDraft, action]);
	const requestAction = (kind: "apply" | "discard", generationId: string, pageId: string) => {
		if (!accessDenied && canReadGeneration?.(generationId) !== false && !isPending && !actionPending) setAction({ kind, generationId, pageId, scope: chatScope });
	};
	const performAction = async () => {
		if (!action || action.scope !== chatScope || accessDenied || canReadGeneration?.(action.generationId) === false || actionPending || isPending) return;
		setActionPending(true);
		const actionViewRequest = draftRequestRef.current;
		try {
			const generation = action.kind === "apply"
				? await confirmAiModificationPlan(action.generationId, action.pageId)
				: await discardGeneration(action.generationId);
			if (generation && draftRequestRef.current === actionViewRequest) {
				setDraftPreview((previous) => previous?.generation.id === generation.id ? { ...previous, generation } : previous);
				setAction(null);
			} else if (useAiChatStore.getState().staleGenerationIds[action.generationId]) {
				// An outdated draft can never be applied; retrying from the dialog is pointless.
				setAction(null);
			}
		} finally { setActionPending(false); }
	};

	const openDraft = async (generationId: string) => {
		const currentThread = useAiChatStore.getState().threads[chatScope];
		if (!selectedConversationId || accessDenied || canReadGeneration?.(generationId) === false || isPending || currentThread?.operation || currentThread?.activeRequestId) return;
		const epoch = currentThread?.epoch;
		const requestId = ++draftRequestRef.current;
		const conversationId = selectedConversationId;
		const scope = chatScope;
		setLoadingDraft({ requestId, conversationId, scope, generationId });
		setDraftPreview(null);
		try {
			const generation = await (shareToken ? getAiGeneration(generationId, undefined, shareToken) : getAiGeneration(generationId));
			if (draftRequestRef.current !== requestId || useAiChatStore.getState().threads[scope]?.epoch !== epoch ||
				canReadGeneration?.(generationId, conversationId, getAiGenerationPageId(generation) ?? currentPageId ?? null) === false) return;
			if (generation.id !== generationId || generation.conversation_id !== conversationId ||
				!isReviewableAiGeneration(generation, { workspaceId: currentWorkspaceId, pageId: currentPageId })) {
				throw new Error("This draft belongs to another conversation.");
			}
			setDraftPreview({ requestId, scope, conversationId, generation });
		} catch (error) {
			if (!shareToken || draftRequestRef.current === requestId) handleGenerationAccessError?.(error, generationId, conversationId);
			if (draftRequestRef.current === requestId) {
				toast.error(getAiChatErrorMessage(error, "Unable to open AI draft."));
			}
		} finally {
			if (draftRequestRef.current === requestId) setLoadingDraft(null);
		}
	};
	const isLoadingDraft = !accessDenied && Boolean(loadingDraft && canReadGeneration?.(loadingDraft.generationId) !== false) && loadingDraft?.requestId === draftRequestRef.current &&
		loadingDraft?.scope === chatScope &&
		loadingDraft?.conversationId === selectedConversationId;
	const visibleDraft =
		!accessDenied && draftPreview && canReadGeneration?.(draftPreview.generation.id) !== false && draftPreview.requestId === draftRequestRef.current &&
		draftPreview.scope === chatScope &&
		draftPreview.conversationId === selectedConversationId
			? draftPreview.generation
			: null;
	const isHistoryLoading = !accessDenied && Boolean(selectedConversationId) &&
		(messagesQuery.isPending || generationsQuery.isPending);

	/**
	 * Modification Planner requires a page context.
	 * Other capabilities require a workspace context.
	 */
	const isComposerDisabled = accessDenied || isPending || !currentWorkspaceId || Boolean(thread.pendingSubmission);

	const showEmptyState = messages.length === 0 && pendingStage === null;
	// Dashboard chat lives on its own page: a new chat starts from the Ask AI home,
	// which also lists the history. Page chat has no home, so it keeps History here.
	const handleNewChat = () => {
		if (!startNewChat()) return;
		if (!currentPageId) router.push("/dashboard/ai");
	};

	return (
		<div className='mx-auto flex h-full w-full max-w-3xl flex-col px-4 sm:px-6'>
			{(currentPageId || showHeader) && (
				<div className='flex shrink-0 items-center justify-end gap-1 pt-3'>
					{currentPageId && (
						<AiChatHistory
							conversations={conversations}
							generations={savedGenerations}
							selectedConversationId={selectedConversationId}
							loading={conversationsQuery.isPending}
							error={conversationsQuery.isError}
							conversationsDenied={conversationsQuery.isAccessDenied}
							onRetryConversations={() => { void conversationsQuery.refetch(); }}
							hasMoreConversations={Boolean(conversationsQuery.hasNextPage)}
							hasMoreGenerations={Boolean(generationsQuery.hasNextPage)}
							loadingMoreConversations={conversationsQuery.isFetchingNextPage}
							loadingMoreGenerations={generationsQuery.isFetchingNextPage}
							disabled={isPending}
							onSelectConversation={selectHistoryConversation}
							onNewChat={handleNewChat}
							onLoadConversations={() => { void conversationsQuery.fetchNextPage(); }}
							onLoadGenerations={() => { void generationsQuery.fetchNextPage(); }}
							onOpenGeneration={(generationId) => { void openDraft(generationId); }}
						/>
					)}
					{showHeader && (
						<AiChatHeader
							onNewChat={handleNewChat}
								hasMessages={!isPending && (messages.length > 0 || Boolean(selectedConversationId))}
						/>
					)}
				</div>
			)}

			{(isLoadingDraft || visibleDraft) && (
				<div className="mt-3 max-h-[45%] shrink-0 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-3">
					{isLoadingDraft ? (
						<p className="flex items-center gap-2 text-xs text-muted-foreground">
							<Loader2 className="size-4 animate-spin" /> Loading draft...
						</p>
					) : visibleDraft ? (
						<>
							<div className="mb-3 flex items-center justify-between gap-2">
								<p className="text-xs font-medium text-muted-foreground">Saved generation preview</p>
								<Button variant="ghost" size="icon-xs" onClick={() => setDraftPreview(null)}
									aria-label="Close preview" title="Close preview"
									className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></Button>
							</div>
							<AiMessageItem
								message={{
									id: `preview-${visibleDraft.id}`,
									role: "assistant",
									content: "",
									capability: visibleDraft.capability,
									generation: visibleDraft,
									createdAt: visibleDraft.created_at,
								}}
								disabled={isPending}
									generationContext={{ workspaceId: currentWorkspaceId, pageId: currentPageId, conversationId: selectedConversationId }}
								onConfirmPageComposition={(id) => { void confirmPageComposition(id); }}
									onConfirmAiModificationPlan={(id, pageId) => requestAction("apply", id, pageId)}
									onDiscardGeneration={(id) => {
									const plan = visibleDraft.output_data;
									if (visibleDraft.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && plan && typeof plan === "object" && !Array.isArray(plan) && "pageId" in plan && typeof plan.pageId === "string") requestAction("discard", id, plan.pageId);
									else void discardGeneration(id);
								}}
							/>
						</>
					) : null}
				</div>
			)}

			{isHistoryLoading && (
				<p role="status" className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" /> Restoring conversation...
				</p>
			)}
			{selectedConversationId && (messagesQuery.isError || generationsQuery.isError) && (
				<p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
					Unable to restore this conversation. Select another chat or start a new one.
				</p>
			)}

			{!isHistoryLoading && showEmptyState ? (
				<AiChatEmptyState
					disabled={isPending}
					onSelectQuickAction={(action) =>
						selectQuickAction(chatScope, action)
					}
				/>
			) : !isHistoryLoading ? (
				<AiMessageList
					key={chatScope}
					messages={messages}
					hasMore={Boolean(messagesQuery.hasNextPage)}
					loadingMore={messagesQuery.isFetchingNextPage}
					onLoadMore={() => { void messagesQuery.fetchNextPage(); }}
					pendingStage={pendingStage}
					disabled={isPending}
						generationContext={{ workspaceId: currentWorkspaceId, pageId: currentPageId, conversationId: selectedConversationId }}
					onConfirmPageComposition={(generationId) => {
						void confirmPageComposition(generationId);
					}}
					onConfirmAiModificationPlan={(generationId, pageId) => {
							requestAction("apply", generationId, pageId);
					}}
						onDiscardGeneration={(generationId) => {
								const matched = messages.find((message) => message.generation?.id === generationId)?.generation;
								const output = matched?.output_data;
								if (matched?.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && output && typeof output === "object" && !Array.isArray(output) && "pageId" in output && typeof output.pageId === "string") requestAction("discard", generationId, output.pageId);
								else void discardGeneration(generationId);
						}}
						onSelectPageCandidate={selectPageCandidate}
						onSelectUnifiedAskPageCandidate={selectUnifiedAskPageCandidate}
						onRetryUnifiedAskPreview={retryUnifiedAskPreview}
				/>
			) : null}

			<AiChatComposer
				value={input}
				onChange={(value) => setInput(chatScope, value)}
				onSend={() => {
						void sendUnifiedAsk({ instruction: useAiChatStore.getState().threads[chatScope]?.input ?? "" });
				}}
				currentPageId={currentPageId}
				disabled={isComposerDisabled || isHistoryLoading || Boolean(selectedConversationId && messagesQuery.isError)}
			/>
			<AiModificationActionDialog shareToken={shareToken} action={!accessDenied && action?.scope === chatScope && canReadGeneration?.(action.generationId) !== false ? action : null} onAccessError={handleGenerationAccessError} workspaceId={currentWorkspaceId} currentPageId={currentPageId} pending={actionPending} onClose={() => { if (!actionPending) setAction(null); }} onConfirm={() => { void performAction(); }} />
			</div>
	);
}
