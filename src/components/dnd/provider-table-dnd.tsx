"use client";

/**
 * ProviderTableDnd
 *
 * Giống ProviderDragDrop (Kanban) nhưng render dạng TABLE thay vì columns.
 * Kéo thả row để:
 *  1. Thay đổi thứ tự (position) trong cùng status
 *  2. Kéo sang status khác (thả vào badge header của status group)
 *
 * Stack: @dnd-kit/react (same as existing code)
 */

import { useSprints } from "@/hooks/use-sprint";
import { useTask, useTaskStatus } from "@/hooks/use-task";
import { useUser } from "@/hooks/use-user";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TableRowDnd } from "./table-row-dnd";
import { TableStatusGroup } from "./table-status-group";

// ─── types ────────────────────────────────────────────────────────────────────

type DndColumns = Record<string, string[]>; // statusId → taskId[]

type Props = {
	workspaceId: string;
	projectId: string;
	sprintId?: string;
};

// ─── helpers (same as existing provider) ──────────────────────────────────────

function cloneItems(items: DndColumns): DndColumns {
	return Object.fromEntries(
		Object.entries(items).map(([k, v]) => [k, [...v]]),
	);
}

function findStatusIdByTaskId(items: DndColumns, taskId: string) {
	for (const [statusId, ids] of Object.entries(items)) {
		if (ids.includes(taskId)) return statusId;
	}
	return null;
}

function findPositionInColumn(
	items: DndColumns,
	statusId: string,
	taskId: string,
) {
	const idx = items[statusId]?.findIndex((id) => id === taskId) ?? -1;
	return idx < 0 ? null : idx + 1;
}

// ─── component ────────────────────────────────────────────────────────────────

export function ProviderTableDnd({ workspaceId, projectId, sprintId }: Props) {
	const {
		taskQuery,
		createTask,
		updateTask: { mutate: updateTaskMutate },
	} = useTask(workspaceId, projectId);
	const { user } = useUser();
	const { sprintsTaskQuery } = useSprints({
		workspaceId,
		projectId,
		sprintId,
	});
	const taskStatusQuery = useTaskStatus(workspaceId, projectId);

	const taskList = useMemo(
		() => taskQuery.data?.data ?? [],
		[taskQuery.data?.data],
	);

	const statusList = useMemo(
		() =>
			[...(taskStatusQuery.data?.data ?? [])].sort(
				(a, b) => a.position - b.position,
			),
		[taskStatusQuery.data?.data],
	);

	const taskMap = useMemo(
		() => Object.fromEntries(taskList.map((t) => [t.id, t])),
		[taskList],
	);

	const mappedItems = useMemo<DndColumns>(() => {
		const grouped: DndColumns = {};
		for (const s of statusList) grouped[s.id] = [];
		for (const t of taskList) {
			if (!t.statusId) continue;
			if (!grouped[t.statusId]) grouped[t.statusId] = [];
			grouped[t.statusId].push(t.id);
		}
		return grouped;
	}, [taskList, statusList]);

	const [items, setItems] = useState<DndColumns>({});
	const itemsRef = useRef<DndColumns>({});
	const snapshotRef = useRef<DndColumns>({});

	const syncItems = (next: DndColumns) => {
		itemsRef.current = next;
		setItems(next);
	};

	useEffect(() => {
		itemsRef.current = mappedItems;
		setItems(mappedItems);
	}, [mappedItems]);

	if (taskQuery.isLoading || taskStatusQuery.isLoading)
		return <div>Loading…</div>;
	if (taskQuery.isError || taskStatusQuery.isError)
		return <div>Load data failed</div>;

	const handleAddTask = (statusId: string) => {
		createTask({
			workspaceId,
			projectId,
			title: "New task",
			statusId,
			createdBy: user?.id as string,
		});
	};

	return (
		<DragDropProvider
			onDragStart={() => {
				snapshotRef.current = cloneItems(itemsRef.current);
			}}
			onDragOver={(event) => {
				const { source } = event.operation;
				if (!source || source.type === "status-group") return;
				syncItems(move(itemsRef.current, event));
			}}
			onDragEnd={(event) => {
				const { source } = event.operation;
				if (!source || source.type === "status-group") return;

				if (event.canceled) {
					syncItems(snapshotRef.current);
					return;
				}

				const taskId = String(source.id);
				const next = itemsRef.current;
				const nextStatusId = findStatusIdByTaskId(next, taskId);

				if (!nextStatusId) {
					syncItems(snapshotRef.current);
					return;
				}

				const nextPosition = findPositionInColumn(
					next,
					nextStatusId,
					taskId,
				);
				if (nextPosition == null) {
					syncItems(snapshotRef.current);
					return;
				}

				updateTaskMutate(
					{
						id: taskId,
						statusId: nextStatusId,
						position: nextPosition,
					},
					{ onError: () => syncItems(snapshotRef.current) },
				);
			}}
		>
			{/* ── Table ── */}
			<div className='w-full rounded-lg overflow-hidden border border-neutral-700'>
				{/* Header */}
				<div className='grid grid-cols-[2rem_1fr_10rem_10rem_10rem] bg-neutral-800 text-xs text-neutral-400 font-semibold uppercase tracking-wider px-4 py-2 border-b border-neutral-700'>
					<span />
					<span>Task</span>
					<span>Status</span>
					<span>Priority</span>
					<span>Assignee</span>
				</div>

				{/* Rows grouped by status */}
				{statusList.map((status) => {
					const columnItems = items[status.id] ?? [];
					return (
						<TableStatusGroup
							key={status.id}
							statusId={status.id}
							statusName={status.name}
							statusColor={status.color}
							isDone={status.isDone}
							count={columnItems.length}
							onAddTask={() => handleAddTask(status.id)}
						>
							{columnItems.map((id, index) => {
								const task = taskMap[id];
								return (
									<TableRowDnd
										key={id}
										id={id}
										column={status.id}
										index={index}
										statusName={status.name}
										statusColor={status.color}
										task={task as any}
										onUpdateName={(taskId, newName) =>
											updateTaskMutate({
												id: taskId,
												title: newName,
											})
										}
									/>
								);
							})}
						</TableStatusGroup>
					);
				})}
			</div>
		</DragDropProvider>
	);
}
