"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";

import { useComments } from "@/entities/comment/model/comment.queries";
import type { CommentTarget } from "@/entities/comment/model/comment.types";
import { cn } from "@/shared/lib/utils";

import { CommentThreads, useCanComment } from "./comment-threads";

// Cùng lề với PageContent, cộng 60px của cột "+ ⋮⋮" để thẳng hàng với chữ của block
const DISCUSSION_COLUMN = "px-12 md:px-16 lg:px-24 [&>*]:ml-[60px]";

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

	const target: CommentTarget = { type: "PAGE", id: pageId };

	const canComment = useCanComment(pageId, !shareToken);
	const { data: comments = [] } = useComments(target, true, shareToken);

	if (comments.length === 0 && !composerOpen) {
		if (!canComment) return null;

		return (
			<div className={DISCUSSION_COLUMN}>
				<button
					type='button'
					onClick={() => setComposerOpen(true)}
					className='-ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] text-faint opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/page-title:opacity-100 [@media(hover:none)]:opacity-100'
				>
					<MessageSquare className='size-3.5' />
					Add comment
				</button>
			</div>
		);
	}

	return (
		<section
			aria-label='Page comments'
			className={cn(DISCUSSION_COLUMN, "pt-2")}
		>
			<CommentThreads
				target={target}
				pageId={pageId}
				canComment={canComment}
				shareToken={shareToken}
				autoFocusComposer={composerOpen && comments.length === 0}
				onComposerCancel={
					comments.length === 0 ? () => setComposerOpen(false) : undefined
				}
				onPosted={() => setComposerOpen(false)}
			/>
		</section>
	);
}
