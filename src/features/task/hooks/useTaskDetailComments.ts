"use client";

import { useGetComments, useCreateComment, useUpdateComment, useDeleteComment } from "./useComments";
import type { GetMeResponse } from "@/services/auth/type";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

type TaskDetailCommentsUser = GetMeResponse | undefined;

export function useTaskDetailComments(
	task: TaskItem,
	user: TaskDetailCommentsUser,
) {
	const [commentDraft, setCommentDraft] = React.useState("");
	const [composerOpen, setComposerOpen] = React.useState(false);
	const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);

	const { data: comments = [], isLoading } = useGetComments(
		task.workspaceId,
		task.projectId,
		task.id,
	);

	const createCommentMutation = useCreateComment();
	const updateCommentMutation = useUpdateComment();
	const deleteCommentMutation = useDeleteComment();

	React.useEffect(() => {
		setCommentDraft("");
		setComposerOpen(false);
		setEditingCommentId(null);
	}, [task.id]);

	const handleSaveComment = () => {
		const trimmed = commentDraft.trim();

		if (!trimmed || !user) return;

		if (editingCommentId) {
			updateCommentMutation.mutate({
				workspaceId: task.workspaceId,
				projectId: task.projectId,
				taskId: task.id,
				commentId: editingCommentId,
				content: trimmed,
			});
		} else {
			createCommentMutation.mutate({
				workspaceId: task.workspaceId,
				projectId: task.projectId,
				taskId: task.id,
				content: trimmed,
			});
		}

		setCommentDraft("");
		setComposerOpen(false);
		setEditingCommentId(null);
	};

	const handleCancelComment = () => {
		setCommentDraft("");
		setComposerOpen(false);
		setEditingCommentId(null);
	};

	const handleEditComment = (commentId: string, content: string) => {
		setEditingCommentId(commentId);
		setCommentDraft(content);
		setComposerOpen(true);
		setTimeout(() => {
			document.getElementById("comment-composer")?.focus();
		}, 0);
	};

	const handleDeleteComment = (commentId: string) => {
		deleteCommentMutation.mutate({
			workspaceId: task.workspaceId,
			projectId: task.projectId,
			taskId: task.id,
			commentId,
		});
	};

	return {
		items: comments,
		isLoading,
		draft: commentDraft,
		composerOpen,
		editingCommentId,
		currentUserId: user?.id,
		currentUsername: user?.username ?? "You",
		currentUserAvatar: user?.avatarUrl,
		onComposerFocus: () => setComposerOpen(true),
		onDraftChange: setCommentDraft,
		onCancel: handleCancelComment,
		onSave: handleSaveComment,
		onEdit: handleEditComment,
		isSaving: createCommentMutation.isPending,
		onDelete: handleDeleteComment,
		isUpdating: updateCommentMutation.isPending,
		isDeleting: deleteCommentMutation.isPending,
	};
}
