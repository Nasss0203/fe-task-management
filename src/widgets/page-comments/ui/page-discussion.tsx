"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";

import { useComments } from "@/entities/comment/model/comment.queries";
import type { CommentTarget } from "@/entities/comment/model/comment.types";
import { cn } from "@/shared/lib/utils";

import { CommentThreads, useCanComment } from "./comment-threads";

// Cùng lề với PageContent, cộng 60px của cột "+ ⋮⋮" để thẳng hàng với chữ của block
const DISCUSSION_COLUMN =
	"mx-auto max-w-[1440px] px-12 md:px-16 lg:px-24 [&>*]:ml-[60px]";

interface PageDiscussionProps {
	pageId: string;
	/** Trang share link: chỉ đọc, đọc bằng token của link. */
	shareToken?: string;
}

/**
 * Comment cấp page nằm ngay dưới tiêu đề, giống Notion.
 * Đặt trong phần tử cha có class `group/page-title` để nút "Add comment" hiện khi hover tiêu đề.
 */
export function PageDiscussion({ pageId, shareToken }: PageDiscussionProps) {
	const [composerOpen, setComposerOpen] = useState(false);
	const [showResolved, setShowResolved] = useState(false);

	const target: CommentTarget = { type: "PAGE", id: pageId };

	const canComment = useCanComment(pageId, !shareToken);
	const { data: comments = [] } = useComments(target, true, shareToken);

	const roots = comments.filter((comment) => !comment.parent_comment_id);
	const hasOpenThread = roots.some((comment) => !comment.resolved_at);
	const resolvedCount = roots.filter((comment) => comment.resolved_at).length;

	if (!canComment && !hasOpenThread && resolvedCount === 0) return null;

	const showThreads = hasOpenThread || composerOpen || showResolved;

	return (
		<section aria-label='Page comments' className={DISCUSSION_COLUMN}>
			<div
				className={cn(
					"-ml-1.5 flex items-center gap-1 text-[13px] text-faint opacity-0 transition-opacity focus-within:opacity-100 group-hover/page-title:opacity-100 [@media(hover:none)]:opacity-100",
					(composerOpen || showResolved) && "opacity-100",
				)}
			>
				{canComment && !composerOpen && (
					<button
						type='button'
						onClick={() => setComposerOpen(true)}
						className='flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent hover:text-foreground'
					>
						<MessageSquare className='size-3.5' />
						Add comment
					</button>
				)}
				{resolvedCount > 0 && (
					<button
						type='button'
						onClick={() => setShowResolved((current) => !current)}
						className='rounded-md px-1.5 py-1 hover:bg-accent hover:text-foreground'
					>
						{showResolved ? "Hide resolved" : `${resolvedCount} resolved`}
					</button>
				)}
			</div>

			{showThreads && (
				<div className='pt-2'>
					<CommentThreads
						target={target}
						pageId={pageId}
						canComment={canComment}
						shareToken={shareToken}
						showComposer={composerOpen}
						showResolved={showResolved}
						autoFocusComposer={composerOpen}
						onComposerCancel={() => setComposerOpen(false)}
						onPosted={() => setComposerOpen(false)}
					/>
				</div>
			)}
		</section>
	);
}
