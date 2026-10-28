"use client";

import { useMemo, useState } from "react";

import {
	useCreateComment,
	useDeleteComment,
	useResolveComment,
	useUpdateComment,
} from "@/entities/comment/model/comment.mutations";
import {
	groupCommentThreads,
	useComments,
} from "@/entities/comment/model/comment.queries";
import type {
	Comment,
	CommentTarget,
} from "@/entities/comment/model/comment.types";
import { usePageAccess } from "@/entities/page-share/model/page-share.queries";
import { useUser } from "@/features/auth/model/use-user";
import { cn } from "@/shared/lib/utils";

import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

// Thu gọn để comment không chiếm quá nhiều chỗ
const VISIBLE_THREADS = 2;
const VISIBLE_REPLIES = 2;

/** VIEWER chỉ đọc; COMMENTER trở lên (gồm thành viên workspace) mới viết được. */
export function useCanComment(pageId: string) {
	const { data: access } = usePageAccess(pageId);
	const level = access?.effectiveAccessLevel ?? null;

	return level !== null && level !== "VIEWER";
}

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

interface CommentThreadsProps {
	target: CommentTarget;
	/** Page chứa target; gợi ý mention theo người xem được page này. */
	pageId: string;
	canComment: boolean;
	/** Focus ô nhập ngay (vd vừa bấm "Add comment"). */
	autoFocusComposer?: boolean;
	/** Có thì ô nhập có nút Cancel / Esc. */
	onComposerCancel?: () => void;
	onPosted?: () => void;
}

/** Danh sách thread (đã thu gọn) + ô nhập comment mới cho một target. */
export function CommentThreads({
	target,
	pageId,
	canComment,
	autoFocusComposer = false,
	onComposerCancel,
	onPosted,
}: CommentThreadsProps) {
	const [replyTo, setReplyTo] = useState<string | null>(null);
	const [showAllThreads, setShowAllThreads] = useState(false);
	const [showResolved, setShowResolved] = useState(false);
	const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
		() => new Set(),
	);

	const { user } = useUser();
	const { data: comments = [] } = useComments(target);

	const createComment = useCreateComment(target);
	const updateComment = useUpdateComment(target);
	const deleteComment = useDeleteComment(target);
	const resolveComment = useResolveComment(target);

	const allThreads = useMemo(() => groupCommentThreads(comments), [comments]);
	// Thread đã resolve ẩn mặc định, mở ra thì nằm sau các thread đang mở
	const openThreads = allThreads.filter(({ root }) => !root.resolved_at);
	const resolvedThreads = allThreads.filter(({ root }) => root.resolved_at);
	const threads = showResolved ? [...openThreads, ...resolvedThreads] : openThreads;

	const authorName = user?.username ?? "You";

	const commentProps = (comment: Comment) => ({
		comment,
		isOwn: comment.author_id === user?.id,
		onEdit: (body: string) =>
			updateComment.mutateAsync({ commentId: comment.id, body }),
		onDelete: () => deleteComment.mutate(comment.id),
		mentionPageId: pageId,
	});

	// Đang xem thread đã resolve thì hiện hết để chúng không đẩy thread đang mở vào "earlier"
	const hiddenThreadCount = showAllThreads || showResolved
		? 0
		: Math.max(threads.length - VISIBLE_THREADS, 0);

	return (
		<div className='max-w-3xl space-y-3'>
			{resolvedThreads.length > 0 && (
				<ToggleButton onClick={() => setShowResolved((current) => !current)}>
					{showResolved
						? "Hide resolved"
						: `Show ${resolvedThreads.length} resolved`}
				</ToggleButton>
			)}

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
					<div
						key={root.id}
						className={cn("space-y-2", root.resolved_at && "opacity-60")}
					>
						<CommentItem
							{...commentProps(root)}
							onReply={
								canComment && !root.resolved_at && replyTo !== root.id
									? () => setReplyTo(root.id)
									: undefined
							}
							onToggleResolved={
								canComment
									? () =>
											resolveComment.mutate({
												commentId: root.id,
												resolved: !root.resolved_at,
											})
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
										mentionPageId={pageId}
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
					autoFocus={autoFocusComposer}
					authorName={authorName}
					mentionPageId={pageId}
					placeholder='Add a comment…'
					submitLabel='Comment'
					pending={createComment.isPending}
					onCancel={onComposerCancel}
					onSubmit={async (body) => {
						await createComment.mutateAsync({ body });
						onPosted?.();
					}}
				/>
			)}
		</div>
	);
}
