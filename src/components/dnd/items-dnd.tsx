"use client";

import type { TaskItem } from "@/services/task/type";
import { useSortable } from "@dnd-kit/react/sortable";
import * as React from "react";
import { ItemView } from "./item-view";
import { usePermission } from "@/features/permission/hooks/usePermission";
import { useUser } from "@/features/auth/hooks/useUser";
import { PERMISSIONS } from "@/constants/permissions";

type ItemsDndProps = {
	id: string;
	task?: TaskItem;
	column: string;
	index: number;
	status: string;
	priority?: string;
	assignees?: TaskItem["assignees"];
	startAt?: string | null;
	dueAt?: string | null;
	name: string;
	description?: string;
	onUpdateName?: (id: string, newName: string) => void;
	onOpenDetail?: (taskId: string) => void;
};

const ItemsDnd = ({
	id,
	task,
	column,
	index,
	status,
	priority,
	assignees,
	startAt,
	dueAt,
	name,
	description,
	onUpdateName,
	onOpenDetail,
}: ItemsDndProps) => {
	const { user } = useUser();
	const isAssignee = React.useMemo(
		() => assignees?.some((a) => a.userId === user?.id) || false,
		[assignees, user?.id]
	);
	const canEdit = isAssignee;

	const { ref, isDragging, handleRef } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
		disabled: !canEdit,
	});
	const [preventOpenDetail, setPreventOpenDetail] = React.useState(false);
	const wasDraggingRef = React.useRef(false);

	React.useEffect(() => {
		if (isDragging) {
			wasDraggingRef.current = true;
			setPreventOpenDetail(true);
			return;
		}

		if (!wasDraggingRef.current) return;

		const timer = window.setTimeout(() => {
			wasDraggingRef.current = false;
			setPreventOpenDetail(false);
		}, 150);

		return () => window.clearTimeout(timer);
	}, [isDragging]);

	return (
		<div
			ref={ref}
			onPointerDownCapture={(e) => {
				if (!canEdit) {
					e.stopPropagation();
					e.nativeEvent.stopImmediatePropagation();
				}
			}}
			onClick={(event) => {
				const target = event.target as HTMLElement | null;

				if (target?.closest("[data-prevent-open-detail='true']")) {
					return;
				}

				if (!preventOpenDetail) {
					onOpenDetail?.(id);
				}
			}}
		>
			<ItemView
				id={id}
				task={task}
				status={status}
				name={name}
				priority={priority}
				assignees={assignees}
				startAt={startAt}
				dueAt={dueAt}
				description={description}
				onUpdateName={onUpdateName}
				onOpenDetail={onOpenDetail}
				isReadOnly={!canEdit}
			/>
		</div>
	);
};

export default ItemsDnd;
