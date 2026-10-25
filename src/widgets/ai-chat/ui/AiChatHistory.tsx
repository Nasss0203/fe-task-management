"use client";

import { useState } from "react";
import {
	Clock3,
	FileText,
	ListChecks,
	Loader2,
	MessageSquare,
	Plus,
} from "lucide-react";

import type {
	AiConversation,
	AiGeneration,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface AiChatHistoryProps {
	conversations: AiConversation[];
	generations: AiGeneration[];
	selectedConversationId: string | null;
	loading: boolean;
	error: boolean;
	conversationsDenied?: boolean;
	onRetryConversations?: () => void;
	hasMoreConversations: boolean;
	hasMoreGenerations: boolean;
	loadingMoreConversations: boolean;
	loadingMoreGenerations: boolean;
	disabled: boolean;
	onSelectConversation: (id: string) => void;
	onNewChat: () => void;
	onLoadConversations: () => void;
	onLoadGenerations: () => void;
	onOpenGeneration: (generationId: string) => void;
}

const DRAFT_STATUS_LABEL: Record<AiGeneration["status"], string> = {
	PROCESSING: "Generating",
	COMPLETED: "Awaiting review",
	APPLIED: "Applied",
	DISCARDED: "Discarded",
	FAILED: "Failed",
};

const rowClassName =
	"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-50";

/** A compact History button; the list opens in a popover instead of taking a row. */
export function AiChatHistory({
	conversations: cachedConversations, generations, selectedConversationId, loading, error, conversationsDenied = false, onRetryConversations,
	hasMoreConversations, hasMoreGenerations, loadingMoreConversations,
	loadingMoreGenerations, disabled, onSelectConversation, onNewChat,
	onLoadConversations, onLoadGenerations, onOpenGeneration,
}: AiChatHistoryProps) {
	const [open, setOpen] = useState(false);
	const conversations = conversationsDenied ? [] : cachedConversations;
	const drafts = generations.filter((generation) =>
		generation.capability === "GENERATE_PAGE_COMPOSITION" ||
		generation.capability === "GENERATE_PAGE_MODIFICATION_PLAN"
	);
	// Picking an item navigates away from the list; loading more keeps it open.
	const pick = (action: () => void) => () => {
		action();
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="ghost" size="sm"
					className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground">
					<Clock3 className="size-3.5" aria-hidden="true" />
					History
					{conversations.length > 0 && (
						<span className="rounded-full bg-muted px-1.5 text-[10px] font-medium">
							{conversations.length}
						</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
					<p className="text-xs font-medium text-foreground">Chat history</p>
					<Button type="button" variant="ghost" size="xs" disabled={disabled}
						onClick={pick(onNewChat)}
						className="text-muted-foreground hover:text-foreground">
						<Plus /> New chat
					</Button>
				</div>

				<div className="max-h-96 space-y-0.5 overflow-y-auto p-1.5">
					{loading && (
						<p className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
							<Loader2 className="size-3.5 animate-spin" /> Loading conversations...
						</p>
					)}
					{error && <p role="alert" className="px-2 py-1.5 text-xs text-destructive">Unable to load chat history.</p>}
					{!loading && !error && conversations.length === 0 && (
						<p className="px-2 py-1.5 text-xs text-muted-foreground">No saved conversations yet.</p>
					)}

					{conversations.map((conversation) => {
						const selected = selectedConversationId === conversation.id;

						return (
							<button
								key={conversation.id}
								type="button"
								disabled={disabled}
								aria-current={selected ? "true" : undefined}
								onClick={pick(() => onSelectConversation(conversation.id))}
								className={cn(rowClassName, selected && "bg-accent font-medium")}
								title={conversation.title ?? "Untitled chat"}
							>
								<MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
								<span className="min-w-0 flex-1 truncate">{conversation.title || "Untitled chat"}</span>
								{conversation.status === "ARCHIVED" && (
									<span className="shrink-0 text-[10px] text-muted-foreground">Archived</span>
								)}
								<span className="shrink-0 rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
									{conversation.scope === "PAGE" ? "Page" : "Chat"}
								</span>
							</button>
						);
					})}

					{(conversationsDenied || error) && onRetryConversations && (
						<button type="button" disabled={loadingMoreConversations} onClick={onRetryConversations}
							className={cn(rowClassName, "justify-center text-muted-foreground")}>Retry chat history</button>
					)}
					{!conversationsDenied && hasMoreConversations && (
						<button type="button"
							disabled={disabled || loadingMoreConversations}
							onClick={onLoadConversations}
							className={cn(rowClassName, "justify-center text-muted-foreground")}>
							{loadingMoreConversations ? "Loading..." : "Load more conversations"}
						</button>
					)}

					{selectedConversationId && drafts.length > 0 && (
						<div className="mt-1.5 border-t border-border/50 pt-1.5">
							<p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">Drafts in this chat</p>
							{drafts.map((generation) => {
								const isPageDraft = generation.capability === "GENERATE_PAGE_COMPOSITION";
								const Icon = isPageDraft ? FileText : ListChecks;

								return (
									<button key={generation.id} type="button"
										disabled={disabled || generation.status === "PROCESSING" || generation.status === "FAILED"}
										onClick={pick(() => onOpenGeneration(generation.id))}
										className={rowClassName}>
										<Icon className="size-3.5 shrink-0 text-muted-foreground" />
										<span className="min-w-0 flex-1 truncate">
											{isPageDraft ? "Page draft" : "Page modification"}
										</span>
										<span className={cn(
											"shrink-0 text-[10px]",
											generation.status === "APPLIED" ? "text-success"
												: generation.status === "FAILED" ? "text-destructive"
													: generation.status === "COMPLETED" ? "text-primary"
														: "text-muted-foreground",
										)}>
											{DRAFT_STATUS_LABEL[generation.status]}
										</span>
									</button>
								);
							})}
							{hasMoreGenerations && (
								<button type="button"
									disabled={disabled || loadingMoreGenerations}
									onClick={onLoadGenerations}
									className={cn(rowClassName, "justify-center text-muted-foreground")}>
									{loadingMoreGenerations ? "Loading..." : "Load more drafts"}
								</button>
							)}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
