"use client";

import { getAssigneeName } from "@/components/drawer/task-detail/task-detail-utils";
import { useAssign } from "@/features/assign/hooks/useAssign";
import type { MemberOption } from "@/features/assign/types/type";
import { useMember } from "@/hooks/use-member";
import type { GetMeResponse } from "@/services/auth/type";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";

type WorkspaceMemberItem = {
	user_id: string;
	full_name: string;
	email?: string;
	avatar_url?: string | null;
};

type TaskDetailAssigneesUser = GetMeResponse | undefined;

export function useTaskDetailAssignees(
	task: TaskItem,
	user: TaskDetailAssigneesUser,
) {
	const { findAllMember } = useMember({ workspaceId: task.workspaceId });
	const { assign, unassign } = useAssign(task.id);
	const [open, setOpen] = React.useState(false);
	const [selectedIds, setSelectedIds] = React.useState<string[]>(() =>
		task.assignees.map((assignee) => assignee.userId),
	);

	React.useEffect(() => {
		setOpen(false);
	}, [task.id]);

	React.useEffect(() => {
		setSelectedIds(task.assignees.map((assignee) => assignee.userId));
	}, [task.id, task.assignees]);

	const members = React.useMemo<MemberOption[]>(() => {
		const rawMembers = (findAllMember.data?.data ?? []) as WorkspaceMemberItem[];

		return rawMembers.map((member) => ({
			id: member.user_id,
			name: member.full_name,
			email: member.email,
			avatarUrl: member.avatar_url,
			isMe: member.user_id === user?.id,
		}));
	}, [findAllMember.data?.data, user?.id]);

	const fallbackSelectedMembers = React.useMemo<MemberOption[]>(() => {
		return task.assignees.map((assignee) => ({
			id: assignee.userId,
			name: getAssigneeName(assignee),
			avatarUrl: assignee.avatarUrl,
			isMe: assignee.userId === user?.id,
		}));
	}, [task.assignees, user?.id]);

	const selectedMembers = React.useMemo<MemberOption[]>(() => {
		const memberMap = new Map(
			members.map((member) => [member.id, member] as const),
		);
		const fallbackMap = new Map(
			fallbackSelectedMembers.map((member) => [member.id, member] as const),
		);

		return selectedIds
			.map((id) => memberMap.get(id) ?? fallbackMap.get(id))
			.filter((member): member is MemberOption => !!member);
	}, [fallbackSelectedMembers, members, selectedIds]);

	const handleToggle = async (memberId: string) => {
		const previousIds = selectedIds;
		const isAssigned = selectedIds.includes(memberId);
		const nextIds = isAssigned
			? selectedIds.filter((id) => id !== memberId)
			: [...selectedIds, memberId];

		setSelectedIds(nextIds);

		try {
			if (isAssigned) {
				await unassign.mutateAsync(memberId);
			} else {
				await assign.mutateAsync({
					taskId: task.id,
					userId: memberId,
				});
			}
		} catch {
			setSelectedIds(previousIds);
		}
	};

	const handleUnassign = async (memberId: string) => {
		if (!selectedIds.includes(memberId)) return;

		const previousIds = selectedIds;
		const nextIds = selectedIds.filter((id) => id !== memberId);

		setSelectedIds(nextIds);

		try {
			await unassign.mutateAsync(memberId);
		} catch {
			setSelectedIds(previousIds);
		}
	};

	return {
		open,
		onOpenChange: setOpen,
		members,
		selectedIds,
		selectedMembers,
		onToggle: handleToggle,
		onUnassign: handleUnassign,
		isPending: assign.isPending || unassign.isPending,
	};
}
