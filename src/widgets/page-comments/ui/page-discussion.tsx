"use client";

import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";

import {
	useCreatePageComment,
	useDeleteComment,
	useUpdateComment,
} from "@/entities/comment/model/comment.mutations";
import {
	groupCommentThreads,
	usePageComments,
} from "@/entities/comment/model/comment.queries";
import type { Comment } from "@/entities/comment/model/comment.types";
import { usePageAccess } from "@/entities/page-share/model/page-share.queries";
import { useUser } from "@/features/auth/model/use-user";
import { cn } from "@/shared/lib/utils";

import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

// Cùng lề với PageContent, cộng 60px của cột "+ ⋮⋮" để thẳng hàng với chữ của block
const DISCUSSION_COLUMN = "px-12 md:px-16 lg:px-24 [&>*]:ml-[60px]";

// Thu gọn để comment không đẩy nội dung page xuống quá xa
const VISIBLE_THREADS = 2;
const VISIBLE_REPLIES = 2;

function ToggleButton({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='-ml-1 rounded px-1 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
		>
			{children}
		</button>
	);
}

interface PageDiscussionProps {
	pageId: string;
}

/**
 * Comment cấp page nằm ngay dưới tiêu đề, giống Notion.
 * Đặt trong phần tử cha có class `group/page-title` để nút "Add comment" hiện khi hover tiêu đề.
 */
export function PageDiscussion({ pageId }: PageDiscussionProps) {
	const [composerOpen, setComposerOpen] = useState(false);
	const [replyTo, setReplyTo] = useState<string | null>(null);
	const [showAllThreads, setShowAllThreads] = useState(false);
	const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
		() => new Set(),
	);

	const { user } = useUser();
	const { data: access } = usePageAccess(pageId);
	const { data: comments = [] } = usePageComments(pageId);

	const createComment = useCreatePageComment(pageId);
	const updateComment = useUpdateComment(pageId);
	const deleteComment = useDeleteComment(pageId);

	const level = access?.effectiveAccessLevel ?? null;
	// VIEWER chỉ đọc; COMMENTER trở lên (gồm thành viên workspace) mới viết được
	const canComment = level !== null && level !== "VIEWER";

	const threads = useMemo(() => groupCommentThreads(comments), [comments]);

	const authorName = user?.username ?? "You";

	if (threads.length === 0 && !composerOpen) {
		if (!canComment) return null;

		return (
			<div className={DISCUSSION_COLUMN}>
				<button
					type='button'
					onClick={() => setComposerOpen(true)}
					className='-ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/page-title:opacity-100 [@media(hover:none)]:opacity-100'
				>
					<MessageSquare className='size-4' />
					Add comment
				</button>
			</div>
		);
	}

	const commentProps = (comment: Comment) => ({
		comment,
		isOwn: comment.author_id === user?.id,
		onEdit: (body: string) =>
			updateComment.mutateAsync({ commentId: comment.id, body }),
		onDelete: () => deleteComment.mutate(comment.id),
	});

	const hiddenThreadCount = showAllThreads
		? 0
		: Math.max(threads.length - VISIBLE_THREADS, 0);

	return (
		<section aria-label='Page comments' className={cn(DISCUSSION_COLUMN, "pt-2")}>
			<div className='max-w-3xl space-y-3'>
				{hiddenThreadCount > 0 && (
					<ToggleButton onClick={() => setShowAllThreads(true)}>
						Show {hiddenThreadCount} earlier{" "}
						{hiddenThreadCount === 1 ? "comment" : "comments"}
					</ToggleButton>
				)}

				{showAllThreads && threads.length > VISIBLE_THREADS && (
					<ToggleButton onClick={() => setShowAllThreads(false)}>
						Show less
					</ToggleButton>
				)}

				{threads.slice(hiddenThreadCount).map(({ root, replies }) => {
					const hiddenReplyCount = expandedThreads.has(root.id)
						? 0
						: Math.max(replies.length - VISIBLE_REPLIES, 0);

					return (
						<div key={root.id} className='space-y-2'>
							<CommentItem
								{...commentProps(root)}
								onReply={
									canComment && replyTo !== root.id
										? () => setReplyTo(root.id)
										: undefined
								}
							/>
	
							{(replies.length > 0 || replyTo === root.id) && (
								<div className='ml-3 space-y-2 border-l border-border/60 pl-4'>
									{hiddenReplyCount > 0 && (
										<ToggleButton
											onClick={() =>
												setExpandedThreads((current) =>
													new Set(current).add(root.id),
												)
											}
										>
											Show {hiddenReplyCount} earlier{" "}
											{hiddenReplyCount === 1 ? "reply" : "replies"}
										</ToggleButton>
									)}
	
									{replies.slice(hiddenReplyCount).map((reply) => (
										<CommentItem key={reply.id} {...commentProps(reply)} />
									))}
	
									{replyTo === root.id && (
										<CommentComposer
											autoFocus
											authorName={authorName}
											placeholder='Reply…'
											submitLabel='Reply'
											pending={createComment.isPending}
											onCancel={() => setReplyTo(null)}
											onSubmit={async (body) => {
												await createComment.mutateAsync({
													body,
													parentCommentId: root.id,
												});
												setReplyTo(null);
											}}
										/>
									)}
								</div>
							)}
						</div>
					);
				})}

				{canComment && (
					<CommentComposer
						autoFocus={composerOpen && threads.length === 0}
						authorName={authorName}
						placeholder='Add a comment…'
						submitLabel='Comment'
						pending={createComment.isPending}
						onCancel={
							threads.length === 0 ? () => setComposerOpen(false) : undefined
						}
						onSubmit={async (body) => {
							await createComment.mutateAsync({ body });
							setComposerOpen(false);
						}}
					/>
				)}
			</div>
		</section>
	);
}
