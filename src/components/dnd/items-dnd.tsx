"use client";

import type { TaskItem } from "@/services/task/type";
import { useSortable } from "@dnd-kit/react/sortable";
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
	const { ref, isDragging } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
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
			/>
		</div>
	);
};

export default ItemsDnd;
