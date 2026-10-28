"use client";

import { useComments } from "@/entities/comment/model/comment.queries";
import type { CommentTarget } from "@/entities/comment/model/comment.types";

import { CommentThreads, useCanComment } from "./comment-threads";

interface RowCommentsProps {
	/** Page chứa database; quyền comment theo page này. */
	pageId: string;
	rowId: string;
}

/** Comment của một task (row database) trong drawer chi tiết. */
export function RowComments({ pageId, rowId }: RowCommentsProps) {
	const target: CommentTarget = { type: "DATABASE_ROW", id: rowId };

	const canComment = useCanComment(pageId);
	const { data: comments = [] } = useComments(target);

	if (!canComment && comments.length === 0) return null;

	return (
		<section aria-label='Comments' className='mt-8 border-t pt-5'>
			<h3 className='mb-3 text-sm font-medium text-muted-foreground'>
				Comments
				{comments.length > 0 && (
					<span className='ml-1.5 text-xs font-normal'>{comments.length}</span>
				)}
			</h3>

			<CommentThreads target={target} canComment={canComment} />
		</section>
	);
}
