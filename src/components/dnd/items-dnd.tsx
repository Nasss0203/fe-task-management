"use client";

import type { TaskItem } from "@/services/task/type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import { ItemView } from "./item-view";

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

const ItemsDnd = React.memo(function ItemsDnd({
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
}: ItemsDndProps) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		data: {
			type: "item",
			containerId: column,
			index,
		},
	});
	const wasDraggingRef = React.useRef(false);

	React.useEffect(() => {
		if (isDragging) {
			wasDraggingRef.current = true;
			return;
		}

		if (!wasDraggingRef.current) return;

		const timer = window.setTimeout(() => {
			wasDraggingRef.current = false;
		}, 150);

		return () => window.clearTimeout(timer);
	}, [isDragging]);

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={{
				opacity: isDragging ? 0.4 : 1,
				transform: CSS.Transform.toString(transform),
				transition,
				willChange: transform ? "transform" : undefined,
				zIndex: isDragging ? 1 : undefined,
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
				isReadOnly={false}
				onClick={(event) => {
					const target = event.target as HTMLElement | null;
					if (target?.closest("[data-prevent-open-detail='true']"))
						return;
					if (!wasDraggingRef.current) onOpenDetail?.(id);
				}}
			/>
		</div>
	);
});

export default ItemsDnd;
