"use client";

import type { LocalComment } from "@/components/drawer/task-detail/task-detail-types";
import { formatCommentTime } from "@/components/drawer/task-detail/task-detail-utils";
import type { GetMeResponse } from "@/services/auth/type";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";

type TaskDetailCommentsUser = GetMeResponse | undefined;

export function useTaskDetailComments(
	task: TaskItem,
	user: TaskDetailCommentsUser,
) {
	const [commentDraft, setCommentDraft] = React.useState("");
	const [composerOpen, setComposerOpen] = React.useState(false);
	const [comments, setComments] = React.useState<LocalComment[]>([]);

	React.useEffect(() => {
		setCommentDraft("");
		setComposerOpen(false);
		setComments([]);
	}, [task.id]);

	const handleSaveComment = () => {
		const trimmed = commentDraft.trim();

		if (!trimmed) return;

		const now = new Date();

		setComments((current) => [
			{
				id: `${task.id}-${now.getTime()}`,
				authorName: user?.username ?? "You",
				authorAvatar: user?.avatarUrl,
				body: trimmed,
				createdAt: formatCommentTime(now),
			},
			...current,
		]);
		setCommentDraft("");
		setComposerOpen(false);
	};

	const handleCancelComment = () => {
		setCommentDraft("");
		setComposerOpen(false);
	};

	return {
		items: comments,
		draft: commentDraft,
		composerOpen,
		currentUsername: user?.username ?? "You",
		currentUserAvatar: user?.avatarUrl,
		onComposerFocus: () => setComposerOpen(true),
		onDraftChange: setCommentDraft,
		onCancel: handleCancelComment,
		onSave: handleSaveComment,
	};
}
