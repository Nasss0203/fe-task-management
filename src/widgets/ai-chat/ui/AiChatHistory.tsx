"use client";

import { Clock3, Loader2, Plus } from "lucide-react";

import type {
	AiConversation,
	AiGeneration,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import { Button } from "@/shared/ui/button";

interface AiChatHistoryProps {
	conversations: AiConversation[];
	generations: AiGeneration[];
	selectedConversationId: string | null;
	loading: boolean;
	error: boolean;
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

export function AiChatHistory({
	conversations, generations, selectedConversationId, loading, error,
	hasMoreConversations, hasMoreGenerations, loadingMoreConversations,
	loadingMoreGenerations, disabled, onSelectConversation, onNewChat,
	onLoadConversations, onLoadGenerations, onOpenGeneration,
}: AiChatHistoryProps) {
	return (
		<details className="shrink-0 border-b border-border/60 py-2">
			<summary className="flex cursor-pointer items-center gap-2 rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring">
				<Clock3 className="size-3.5" />
				Chat history
				{conversations.length > 0 ? `(${conversations.length})` : ""}
			</summary>
			<div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-2">
				<Button
					type="button" size="sm" variant="ghost" disabled={disabled}
					onClick={onNewChat}
					className="w-full justify-start gap-2 text-xs"
				>
					<Plus className="size-3.5" /> New chat
				</Button>
				{loading && (
					<p className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
						<Loader2 className="size-3.5 animate-spin" /> Loading conversations...
					</p>
				)}
				{error && <p role="alert" className="p-2 text-xs text-destructive">Unable to load chat history.</p>}
				{!loading && !error && conversations.length === 0 && (
					<p className="p-2 text-xs text-muted-foreground">No saved conversations yet.</p>
				)}
				{conversations.map((conversation) => (
					<Button
						key={conversation.id}
						type="button" size="sm" variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
						disabled={disabled}
						onClick={() => onSelectConversation(conversation.id)}
						className="h-auto min-h-8 w-full justify-start px-2 py-1.5 text-left text-xs"
						title={conversation.title ?? "Untitled chat"}
					>
							<span className="min-w-0 flex-1 truncate">{conversation.title || "Untitled chat"}</span>
							<span className="shrink-0 text-[10px] text-muted-foreground">{conversation.scope === "PAGE" ? "Page" : "Chat"}</span>
						{conversation.status === "ARCHIVED" && (
							<span className="text-[10px] text-muted-foreground">Archived</span>
						)}
					</Button>
				))}
				{hasMoreConversations && (
					<Button type="button" variant="ghost" size="sm"
						disabled={disabled || loadingMoreConversations}
						onClick={onLoadConversations} className="w-full text-xs">
						{loadingMoreConversations ? "Loading..." : "Load more conversations"}
					</Button>
				)}
				{selectedConversationId && generations.some((generation) => generation.capability === "GENERATE_PAGE_COMPOSITION" || generation.capability === "GENERATE_PAGE_MODIFICATION_PLAN") && (
					<div className="mt-2 border-t border-border/50 pt-2">
						<p className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground">Generated drafts</p>
						{generations.filter((generation) =>
							generation.capability === "GENERATE_PAGE_COMPOSITION" ||
							generation.capability === "GENERATE_PAGE_MODIFICATION_PLAN"
						).map((generation) => (
							<Button key={generation.id} type="button" variant="ghost" size="sm"
								disabled={disabled || generation.status === "PROCESSING" || generation.status === "FAILED"}
								onClick={() => onOpenGeneration(generation.id)}
								className="h-auto w-full justify-start text-left text-xs">
								<span className="truncate">
									{generation.capability === "GENERATE_PAGE_COMPOSITION" ? "Page draft" : "Page modification"}
									{" · "}{generation.status.toLowerCase()}
								</span>
							</Button>
						))}
						{hasMoreGenerations && (
							<Button type="button" variant="ghost" size="sm"
								disabled={disabled || loadingMoreGenerations}
								onClick={onLoadGenerations} className="w-full text-xs">
								{loadingMoreGenerations ? "Loading..." : "Load more drafts"}
							</Button>
						)}
					</div>
				)}
			</div>
		</details>
	);
}
