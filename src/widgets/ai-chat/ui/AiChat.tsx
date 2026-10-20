"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { getAiChatErrorMessage } from "../model/ai-chat-error";
import { Button } from "@/shared/ui/button";
import { useAiChat } from "../model/use-ai-chat";

import { EMPTY_AI_CHAT_THREAD, useAiChatStore } from "../model/use-ai-chat-store";

import { AiChatComposer } from "./AiChatComposer";
import { AiChatEmptyState } from "./AiChatEmptyState";
import { AiChatHeader } from "./AiChatHeader";
import { AiChatHistory } from "./AiChatHistory";
import { AiMessageItem } from "./AiMessageItem";
import { AiMessageList } from "./AiMessageList";
import { AiModificationActionDialog } from "./AiModificationActionDialog";

interface AiChatProps {
	showHeader?: boolean;
	currentPageId?: string;
}

export function AiChat({ showHeader = false, currentPageId }: AiChatProps) {
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
	} | null>(null);
	const draftRequestRef = useRef(0);
	const [action, setAction] = useState<{ kind: "apply" | "discard"; generationId: string; pageId: string } | null>(null);
	const [actionPending, setActionPending] = useState(false);
	/**
	 * Get the chat scope for the current page.
	 * Page chat: page:<pageId>
	 * Dashboard chat: global
	 */
	const setInput = useAiChatStore((state) => state.setInput);

	const setMode = useAiChatStore((state) => state.setMode);


	const selectQuickAction = useAiChatStore(
		(state) => state.selectQuickAction,
	);

	const {
		chatScope,
			sendMessage,
			selectPageCandidate,
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
	} = useAiChat(currentPageId);
	const thread = useAiChatStore((state) => state.threads[chatScope] ?? EMPTY_AI_CHAT_THREAD);
	const { messages, mode, input } = thread;
	// A draft opened in another chat/workspace must not appear after navigation
	// or a New Chat action, even if its API request finishes afterward.
	useEffect(() => {
		draftRequestRef.current += 1;
		setAction(null);
	}, [chatScope, selectedConversationId]);
	const requestAction = (kind: "apply" | "discard", generationId: string, pageId: string) => {
		if (!isPending && !actionPending) setAction({ kind, generationId, pageId });
	};
	const performAction = async () => {
		if (!action || actionPending || isPending) return;
		setActionPending(true);
		try {
			const generation = action.kind === "apply"
				? await confirmAiModificationPlan(action.generationId, action.pageId)
				: await discardGeneration(action.generationId);
			if (generation) {
				setDraftPreview((previous) => previous?.generation.id === generation.id ? { ...previous, generation } : previous);
				setAction(null);
			}
		} finally { setActionPending(false); }
	};

	const openDraft = async (generationId: string) => {
		if (!selectedConversationId) return;
		const requestId = ++draftRequestRef.current;
		const conversationId = selectedConversationId;
		const scope = chatScope;
		setLoadingDraft({ requestId, conversationId, scope });
		setDraftPreview(null);
		try {
			const generation = await getAiGeneration(generationId);
			if (draftRequestRef.current !== requestId) return;
			if (generation.conversation_id !== conversationId) {
				throw new Error("This draft belongs to another conversation.");
			}
			setDraftPreview({ requestId, scope, conversationId, generation });
		} catch (error) {
			if (draftRequestRef.current === requestId) {
				toast.error(getAiChatErrorMessage(error, "Unable to open AI draft."));
			}
		} finally {
			if (draftRequestRef.current === requestId) setLoadingDraft(null);
		}
	};
	const isLoadingDraft = loadingDraft?.requestId === draftRequestRef.current &&
		loadingDraft?.scope === chatScope &&
		loadingDraft?.conversationId === selectedConversationId;
	const visibleDraft =
		draftPreview?.requestId === draftRequestRef.current &&
		draftPreview.scope === chatScope &&
		draftPreview.conversationId === selectedConversationId
			? draftPreview.generation
			: null;
	const isHistoryLoading = Boolean(selectedConversationId) &&
		(messagesQuery.isPending || generationsQuery.isPending);

	/**
	 * Modification Planner requires a page context.
	 * Other capabilities require a workspace context.
	 */
	const isComposerDisabled = isPending || !currentWorkspaceId;

	const showEmptyState = messages.length === 0 && pendingStage === null;
	// Dashboard chat lives on its own page: a new chat starts from the Ask AI home,
	// which also lists the history. Page chat has no home, so it keeps History here.
	const handleNewChat = () => {
		startNewChat();
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
							hasMessages={messages.length > 0 || Boolean(selectedConversationId)}
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
				/>
			) : null}

			<AiChatComposer
				value={input}
				onChange={(value) => setInput(chatScope, value)}
				mode={mode}
				onModeChange={(nextMode) => setMode(chatScope, nextMode)}
				onSend={() => {
					void sendMessage();
				}}
				currentPageId={currentPageId}
				disabled={isComposerDisabled || isHistoryLoading || Boolean(selectedConversationId && messagesQuery.isError)}
			/>
			<AiModificationActionDialog action={action} workspaceId={currentWorkspaceId} currentPageId={currentPageId} pending={actionPending} onClose={() => { if (!actionPending) setAction(null); }} onConfirm={() => { void performAction(); }} />
			</div>
	);
}
