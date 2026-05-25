"use client";

import { useState } from "react";
import { useAssign } from "./useAssign";

export function useTaskAssignee(taskId: string, initialAssigneeIds: string[]) {
	const [open, setOpen] = useState(false);
	const [selectedIds, setSelectedIds] =
		useState<string[]>(initialAssigneeIds);
	const { assign, unassign } = useAssign(taskId);

	const handleToggle = async (memberId: string) => {
		const isAssigned = selectedIds.includes(memberId);
		const previousIds = selectedIds;

		setSelectedIds(
			isAssigned
				? selectedIds.filter((id) => id !== memberId)
				: [...selectedIds, memberId],
		);

		try {
			if (isAssigned) {
				await unassign.mutateAsync(memberId);
			} else {
				await assign.mutateAsync({ taskId, userId: memberId });
			}
		} catch {
			setSelectedIds(previousIds);
		}
	};

	return {
		open,
		setOpen,
		selectedIds,
		handleToggle,
		isPending: assign.isPending || unassign.isPending,
	};
}
