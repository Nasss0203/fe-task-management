"use client";

import { useEffect, useRef } from "react";

import { useComments } from "@/entities/comment/model/comment.queries";
import type { CommentTarget } from "@/entities/comment/model/comment.types";

import { CommentThreads, useCanComment } from "./comment-threads";

interface RowCommentsProps {
	/** Page chứa database; quyền comment theo page này. */
	pageId: string;
	rowId: string;
	/** Cuộn tới mục này khi mở (link thông báo comment). */
	scrollIntoView?: boolean;
}

/** Comment của một task (row database) trong drawer chi tiết. */
export function RowComments({
	pageId,
	rowId,
	scrollIntoView = false,
}: RowCommentsProps) {
	const target: CommentTarget = { type: "DATABASE_ROW", id: rowId };
	const sectionRef = useRef<HTMLElement>(null);

	const canComment = useCanComment(pageId);
	const { data: comments = [], isSuccess } = useComments(target);

	// Đợi comment tải xong để cuộn đúng chỗ (danh sách làm mục này cao lên)
	useEffect(() => {
		if (scrollIntoView && isSuccess) {
			sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
		}
	}, [scrollIntoView, isSuccess]);

	if (!canComment && comments.length === 0) return null;

	return (
		<section
			ref={sectionRef}
			aria-label='Comments'
			className='mt-8 scroll-mt-4 border-t pt-5'
		>
			<h3 className='mb-3 text-sm font-medium text-muted-foreground'>
				Comments
				{comments.length > 0 && (
					<span className='ml-1.5 text-xs font-normal'>{comments.length}</span>
				)}
			</h3>

			<CommentThreads
				target={target}
				pageId={pageId}
				canComment={canComment}
			/>
		</section>
	);
}
