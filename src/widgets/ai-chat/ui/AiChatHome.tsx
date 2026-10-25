"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Loader2, MessageSquare } from "lucide-react";

import { useAiChat } from "../model/use-ai-chat";
import { EMPTY_AI_CHAT_THREAD, useAiChatStore } from "../model/use-ai-chat-store";

import { AiChatComposer } from "./AiChatComposer";
import { getQuickActionIcon, QUICK_ACTIONS } from "./AiChatEmptyState";
import { AiAssistantAvatar } from "./AiMessageItem";

export const AI_CHAT_THREAD_PATH = "/dashboard/ai/chat";

/** Ask AI landing: composer on top, recent chats below. Chatting happens on its own page. */
export function AiChatHome() {
	const router = useRouter();
	const {
		chatScope,
		currentWorkspaceId,
		isPending,
		prepareUnifiedAskSubmission,
		selectHistoryConversation,
		conversations,
		conversationsQuery,
		workspacePageConversationsQuery,
	} = useAiChat();
	const { input, pendingSubmission } = useAiChatStore(
		(state) => state.threads[chatScope] ?? EMPTY_AI_CHAT_THREAD,
	);
	const setInput = useAiChatStore((state) => state.setInput);
	const selectQuickAction = useAiChatStore((state) => state.selectQuickAction);
	const navigatingRef = useRef(false);
	// Returning to Home must not revive an abandoned auto-submit ticket.
	useEffect(() => { useAiChatStore.getState().clearPendingSubmissions(); }, []);

	const disabled = isPending || !currentWorkspaceId || Boolean(pendingSubmission);
	const loading = conversationsQuery.isPending || workspacePageConversationsQuery.isPending;
	const error = conversationsQuery.isError || workspacePageConversationsQuery.isError;
	const listDenied = conversationsQuery.isAccessDenied || workspacePageConversationsQuery.isAccessDenied;
	const hasMore = Boolean(conversationsQuery.hasNextPage || workspacePageConversationsQuery.hasNextPage);
	const loadingMore = conversationsQuery.isFetchingNextPage || workspacePageConversationsQuery.isFetchingNextPage;

	// Transfer only. Chat owns the operation after its view has mounted.
	const send = () => {
		if (disabled || navigatingRef.current || !prepareUnifiedAskSubmission(input)) return;
		navigatingRef.current = true;
		router.push(AI_CHAT_THREAD_PATH);
	};

	const openConversation = (id: string) => {
		if (disabled || navigatingRef.current || !selectHistoryConversation(id)) return;
		navigatingRef.current = true;
		router.push(AI_CHAT_THREAD_PATH);
	};

	return (
		<div className='h-full overflow-y-auto'>
			<div className='mx-auto w-full max-w-2xl px-4 pt-[12vh] pb-16 sm:px-6'>
				<div className='mb-6 flex flex-col items-center text-center'>
					<div className='mb-4 scale-125'>
						<AiAssistantAvatar />
					</div>
					<h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
						How can I help you today?
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Write, create a page, or update an existing page in your workspace.
					</p>
				</div>

				{isPending && (
					<Link
						href={AI_CHAT_THREAD_PATH}
						className='mb-2 flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground'
					>
						<Loader2 className='size-3.5 animate-spin' />
						AI is still responding in your current chat. Open chat
						<ChevronRight className='size-3.5' />
					</Link>
				)}

				<AiChatComposer
					value={input}
					onChange={(value) => setInput(chatScope, value)}
					onSend={send}
					disabled={disabled}
				/>

				<div className='flex flex-wrap justify-center gap-2'>
					{QUICK_ACTIONS.map((action) => (
						<button
							key={action.id}
							type='button'
							disabled={disabled}
							onClick={() => selectQuickAction(chatScope, action)}
							className='inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 px-3 text-xs font-medium text-foreground/90 transition-colors hover:bg-accent/50 disabled:opacity-50'
						>
							{getQuickActionIcon(action.iconName)}
							{action.label}
						</button>
					))}
				</div>

				<section className='mt-12' aria-labelledby='ai-recent-chats'>
					<h2 id='ai-recent-chats' className='mb-2 px-1 text-sm font-medium text-foreground'>
						Recent chats
					</h2>

					{loading ? (
						<p className='flex items-center gap-2 px-1 py-3 text-xs text-muted-foreground'>
							<Loader2 className='size-3.5 animate-spin' /> Loading conversations...
						</p>
					) : null}
					{error && (
						<p role='alert' className='px-1 py-3 text-xs text-destructive'>
							Unable to load chat history.
						</p>
					)}
					{!loading && !error && conversations.length === 0 ? (
						<p className='rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground'>
							No chats yet. Your conversations will appear here.
						</p>
					) : !loading && (!error || listDenied) && conversations.length > 0 ? (
						<ul className='overflow-hidden rounded-xl border border-border/60 bg-card'>
							{conversations.map((conversation) => (
								<li key={conversation.id} className='border-b border-border/40 last:border-b-0'>
									<button
										type='button'
										disabled={disabled}
										onClick={() => openConversation(conversation.id)}
										className='group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40 disabled:opacity-50'
									>
										<MessageSquare className='size-4 shrink-0 text-muted-foreground' />
										<span className='min-w-0 flex-1'>
											<span className='block truncate text-sm text-foreground'>
												{conversation.title || "Untitled chat"}
											</span>
											<span className='mt-0.5 block text-[11px] text-muted-foreground'>
												{conversation.scope === "PAGE" ? "Page changes" : "Chat"}
												{" · "}
												{formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
											</span>
										</span>
										<ChevronRight className='size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5' />
									</button>
								</li>
							))}
						</ul>
					) : null}

					{listDenied && (
						<button type="button" disabled={conversationsQuery.isFetching || workspacePageConversationsQuery.isFetching}
							onClick={() => {
								if (conversationsQuery.isAccessDenied) void conversationsQuery.refetch();
								if (workspacePageConversationsQuery.isAccessDenied) void workspacePageConversationsQuery.refetch();
							}}
							className="mt-3 text-xs text-muted-foreground underline">Retry chat history</button>
					)}

					{hasMore && (
						<button
							type='button'
							disabled={loadingMore}
							onClick={() => {
								if (conversationsQuery.hasNextPage) void conversationsQuery.fetchNextPage();
								else void workspacePageConversationsQuery.fetchNextPage();
							}}
							className='mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground disabled:opacity-50'
						>
							{loadingMore && <Loader2 className='size-3 animate-spin' />}
							{loadingMore ? "Loading..." : "Load more chats"}
						</button>
					)}
				</section>
			</div>
		</div>
	);
}
