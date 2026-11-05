"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, FileText, Loader2, MessageSquare, Sparkles } from "lucide-react";

import { useAiChat } from "../model/use-ai-chat";
import { EMPTY_AI_CHAT_THREAD, useAiChatStore } from "../model/use-ai-chat-store";

import { AiChatComposer } from "./AiChatComposer";
import { getQuickActionIcon, QUICK_ACTIONS } from "./AiChatEmptyState";

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
			<div className='mx-auto w-full max-w-[640px] px-4 pt-20 pb-16 sm:px-0 sm:pt-24'>
				<div className='mb-5 flex flex-col items-center text-center'>
					<div
						aria-hidden='true'
						className='mb-4 flex size-[52px] items-center justify-center rounded-[14px] bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/15 dark:text-indigo-300'
					>
						<Sparkles className='size-6' />
					</div>
					<h1 className='text-[28px] font-bold leading-[42px] tracking-tight text-foreground'>
						How can I help you today?
					</h1>
					<p className='mt-1.5 text-[14px] leading-[21px] text-muted-foreground'>
						Write, create a page, or update an existing page in your workspace.
					</p>
				</div>

				{isPending && (
					<Link
						href={AI_CHAT_THREAD_PATH}
						className='mb-3 flex items-center gap-2 rounded-[10px] bg-[#eeeffc] px-3.5 py-2.5 text-[13px] text-[#5e6ad2] transition-opacity hover:opacity-90 dark:bg-indigo-500/15 dark:text-indigo-300'
					>
						<Loader2 className='size-3.5 shrink-0 animate-spin' />
						<span className='min-w-0 flex-1'>
							AI is still responding in your current chat.
						</span>
						<span className='inline-flex shrink-0 items-center gap-0.5 font-semibold'>
							Open chat
							<ChevronRight className='size-3.5' />
						</span>
					</Link>
				)}

				<AiChatComposer
					value={input}
					onChange={(value) => setInput(chatScope, value)}
					onSend={send}
					disabled={disabled}
				/>

				<div className='mt-1.5 flex flex-wrap justify-center gap-2'>
					{QUICK_ACTIONS.map((action) => (
						<button
							key={action.id}
							type='button'
							disabled={disabled}
							onClick={() => selectQuickAction(chatScope, action)}
							className='inline-flex h-[34px] items-center gap-[7px] rounded-full border border-input bg-background px-3 text-[13px] font-normal text-foreground transition-colors hover:bg-accent/60 disabled:opacity-50'
						>
							{getQuickActionIcon(action.iconName)}
							{action.label}
						</button>
					))}
				</div>

				<section className='mt-10' aria-labelledby='ai-recent-chats'>
					<h2
						id='ai-recent-chats'
						className='mb-1.5 px-3 text-[12.5px] font-medium leading-[19px] text-muted-foreground'
					>
						Recent chats
					</h2>

					{loading ? (
						<p className='flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground'>
							<Loader2 className='size-3.5 animate-spin' /> Loading conversations...
						</p>
					) : null}
					{error && (
						<p role='alert' className='px-3 py-3 text-xs text-destructive'>
							Unable to load chat history.
						</p>
					)}
					{!loading && !error && conversations.length === 0 ? (
						<p className='rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground'>
							No chats yet. Your conversations will appear here.
						</p>
					) : !loading && (!error || listDenied) && conversations.length > 0 ? (
						<div className='max-h-[280px] overflow-y-auto pr-1 sm:max-h-[320px]'>
							<ul className='space-y-0.5'>
								{conversations.map((conversation) => (
									<li key={conversation.id}>
										<button
											type='button'
											disabled={disabled}
											onClick={() => openConversation(conversation.id)}
											className='group flex min-h-[44px] w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-accent/50 disabled:opacity-50'
										>
											{conversation.scope === "PAGE" ? (
												<FileText className='size-[15px] shrink-0 text-muted-foreground' />
											) : (
												<MessageSquare className='size-[15px] shrink-0 text-muted-foreground' />
											)}
											<span className='min-w-0 flex-1 truncate text-[13.5px] font-normal leading-5 text-foreground'>
												{conversation.title || "Untitled chat"}
											</span>
											<span className='shrink-0 rounded-[10px] bg-muted px-2 py-0.5 text-[11.5px] font-medium leading-[17px] text-muted-foreground'>
												{conversation.scope === "PAGE" ? "Page changes" : "Chat"}
											</span>
											<span className='shrink-0 text-[12px] leading-[18px] text-faint'>
												{formatDistanceToNow(new Date(conversation.updated_at), {
													addSuffix: true,
												})}
											</span>
										</button>
									</li>
								))}
							</ul>

							{hasMore && (
								<button
									type='button'
									disabled={loadingMore}
									onClick={() => {
										if (conversationsQuery.hasNextPage)
											void conversationsQuery.fetchNextPage();
										else void workspacePageConversationsQuery.fetchNextPage();
									}}
									className='mt-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:opacity-50'
								>
									{loadingMore && <Loader2 className='size-3 animate-spin' />}
									{loadingMore ? "Loading..." : "Load more chats"}
								</button>
							)}
						</div>
					) : null}

					{listDenied && (
						<button
							type='button'
							disabled={
								conversationsQuery.isFetching ||
								workspacePageConversationsQuery.isFetching
							}
							onClick={() => {
								if (conversationsQuery.isAccessDenied)
									void conversationsQuery.refetch();
								if (workspacePageConversationsQuery.isAccessDenied)
									void workspacePageConversationsQuery.refetch();
							}}
							className='mt-2 px-3 text-xs text-muted-foreground underline'
						>
							Retry chat history
						</button>
					)}
				</section>
			</div>
		</div>
	);
}
