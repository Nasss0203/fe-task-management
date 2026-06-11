"use client";

import {
	Cell,
	Header,
	PaginationState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties, useState } from "react";

import {
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTask } from "@/features/task/hooks/useTask";
import { cn } from "@/lib/utils";
import PanigationTable from "@/components/panigation/PanigationTable";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { useBacklogColumns } from "./columns/column-task";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";

type TaskItem = {
	id: string;
	title: string;
	assigneeName: string | null;
	priorityName: string | null;
	statusName: string;
	estimateMinutes: number | null;
};

const DraggableTableHeader = ({
	header,
}: {
	header: Header<TaskItem, unknown>;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: header.column.id,
	});

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		width: header.column.getSize(),
		opacity: isDragging ? 0.9 : 1,
		position: "relative",
		zIndex: isDragging ? 20 : 0,
	};

	return (
		<TableHead
			{...attributes}
			{...listeners}
			ref={setNodeRef}
			colSpan={header.colSpan}
			style={style}
			className={cn(
				"h-11 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-sidebar-accent",
				isDragging && "bg-background shadow-sm",
			)}
		>
			<div className='flex items-center justify-between gap-2'>
				<div className='truncate'>
					{header.isPlaceholder
						? null
						: flexRender(
								header.column.columnDef.header,
								header.getContext(),
							)}
				</div>
			</div>
		</TableHead>
	);
};

const DragAlongCell = ({ cell }: { cell: Cell<TaskItem, unknown> }) => {
	const { setNodeRef, transform, transition, isDragging } = useSortable({
		id: cell.column.id,
	});

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		width: cell.column.getSize(),
		opacity: isDragging ? 0.9 : 1,
		position: "relative",
		zIndex: isDragging ? 10 : 0,
	};

	return (
		<TableCell
			ref={setNodeRef}
			style={style}
			className={cn(
				"px-3 py-3 align-middle",
				isDragging && "bg-background",
			)}
		>
			{flexRender(cell.column.columnDef.cell, cell.getContext())}
		</TableCell>
	);
};

const BoardTable = ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId: string;
}) => {
	const [activeDrawerTaskId, setActiveDrawerTaskId] = React.useState<string | null>(null);

	const columns = useBacklogColumns({
		workspaceId,
		projectId,
		onOpenDetail: setActiveDrawerTaskId,
	});

	const { taskQuery } = useTask(workspaceId, projectId);
	const rawTasks = Array.isArray(taskQuery?.data?.data)
		? taskQuery.data.data
		: [];
	const dataTask = React.useMemo<TaskItem[]>(
		() =>
			rawTasks.map((task) => ({
				id: task.id,
				title: task.title,
				assigneeName:
					task.assignees?.[0]?.fullName ??
					task.assignees?.[0]?.username ??
					null,
				assignees: task.assignees,
				priorityName: task.priorityName,
				statusName: task.statusName ?? "",
				estimateMinutes: task.estimateMinutes,
			})),
		[rawTasks],
	);

	const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
		columns.map((c) => c.id!),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		setColumnOrder((prev) => {
			const oldIndex = prev.indexOf(active.id as string);
			const newIndex = prev.indexOf(over.id as string);
			return arrayMove(prev, oldIndex, newIndex);
		});
	}

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 6,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 150,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor),
	);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data: dataTask,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
			columnOrder,
		},
	});

	const rows = table.getRowModel()?.rows ?? [];
	const columnCount = Math.max(columnOrder.length, columns.length, 1);

	const activeDrawerTask = React.useMemo(() => {
		return rawTasks.find((t: any) => t.id === activeDrawerTaskId) || null;
	}, [rawTasks, activeDrawerTaskId]);

	return (
		<>
		<section className='col-span-12 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm xl:col-span-6'>
			<DndContext
				collisionDetection={closestCenter}
				modifiers={[restrictToHorizontalAxis]}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<div className='overflow-hidden border border-border/60 bg-transparent'>
					<div className='w-full overflow-x-auto'>
						<Table
							className={cn(
								"w-full min-w-max border-collapse",

								"[&_th]:border-b [&_th]:border-border/50",
								"[&_td]:border-b [&_td]:border-border/50",
								"[&_tr]:border-0",
							)}
						>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className='h-10 border-b border-border/50 bg-background hover:bg-muted/30 transition-colors'
									>
										<SortableContext
											items={columnOrder}
											strategy={
												horizontalListSortingStrategy
											}
										>
											{headerGroup.headers.map(
												(header) => (
													<DraggableTableHeader
														key={header.id}
														header={header}
													/>
												),
											)}
										</SortableContext>
									</TableRow>
								))}
							</TableHeader>

							<TableBody>
								{rows.length ? (
									rows.map((row) => (
										<TableRow
											key={row.id}
											className='h-11 border-b border-border/50 bg-background transition-colors hover:bg-muted/40 last:border-b-0'
										>
											<SortableContext
												items={columnOrder}
												strategy={
													horizontalListSortingStrategy
												}
											>
												{row
													.getVisibleCells()
													.map((cell) => (
														<DragAlongCell
															key={cell.id}
															cell={cell}
														/>
													))}
											</SortableContext>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columnCount}
											className='h-28 text-center text-sm text-muted-foreground'
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</DndContext>
			<PanigationTable table={table} />
		</section>

		{activeDrawerTask ? (
			<DrawerItemView
				open={!!activeDrawerTask}
				onOpenChange={(open) => {
					if (!open) {
						setActiveDrawerTaskId(null);
					}
				}}
				task={activeDrawerTask}
			/>
		) : null}
		</>
	);
};

export default BoardTable;
