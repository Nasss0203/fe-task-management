"use client";

import {
	Cell,
	ColumnDef,
	Header,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties } from "react";

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

import { useTask } from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import DropdownTaskStatus from "../dropdown/DropdownTaskStatus";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";

type TaskItem = {
	id: string;
	title: string;
	assigneeName: string | null;
	priorityName: string | null;
	statusName: string;
	estimateMinutes: number | null;
};

function getStatusClass(status: string) {
	switch (status?.toLowerCase()) {
		case "done":
			return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
		case "in progress":
			return "bg-blue-500/15 text-blue-600 border-blue-500/20";
		default:
			return "bg-slate-500/15 text-slate-600 border-slate-500/20";
	}
}

function getPriorityClass(priority: string | null) {
	switch (priority?.toLowerCase()) {
		case "high":
			return "bg-red-500/15 text-red-600 border-red-500/20";
		case "medium":
			return "bg-amber-500/15 text-amber-600 border-amber-500/20";
		case "low":
			return "bg-sky-500/15 text-sky-600 border-sky-500/20";
		default:
			return "bg-slate-500/15 text-slate-600 border-slate-500/20";
	}
}

function formatEstimate(minutes: number | null) {
	if (!minutes) return "—";
	if (minutes < 60) return `${minutes} phút`;

	const hour = Math.floor(minutes / 60);
	const remain = minutes % 60;

	if (!remain) return `${hour} giờ`;
	return `${hour} giờ ${remain} phút`;
}

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
				"h-11 bg-muted/40 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer hover:bg-sidebar-accent",
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
	const columns = React.useMemo<ColumnDef<TaskItem>[]>(
		() => [
			{
				accessorKey: "title",
				id: "title",
				size: 260,
				header: "Tên công việc",
				cell: ({ row }) => (
					<div className='font-medium text-foreground'>
						{row.original.title}
					</div>
				),
			},
			{
				accessorKey: "assigneeName",
				id: "assigneeName",
				size: 180,
				header: "Người được giao",
				cell: ({ row }) => (
					<div className='text-muted-foreground'>
						{row.original.assigneeName || "Chưa giao"}
					</div>
				),
			},
			{
				accessorKey: "priorityName",
				id: "priorityName",
				size: 140,
				header: "Ưu tiên",
				cell: ({ row }) => (
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
							getPriorityClass(row.original.priorityName),
						)}
					>
						{row.original.priorityName || "Chưa có"}
					</span>
				),
			},
			{
				accessorKey: "statusName",
				id: "statusName",
				size: 160,
				header: "Trạng thái",
				cell: ({ row }) => {
					return (
						<DropdownTaskStatus
							taskId={row.original.id}
							projectId={projectId}
							workspaceId={workspaceId}
							statusName={row.original.statusName}
						></DropdownTaskStatus>
					);
				},
			},
			{
				accessorKey: "estimateMinutes",
				id: "estimateMinutes",
				size: 140,
				header: "Ước tính",
				cell: ({ row }) => (
					<div className='text-muted-foreground'>
						{formatEstimate(row.original.estimateMinutes)}
					</div>
				),
			},
		],
		[],
	);

	const { taskQuery } = useTask(workspaceId, projectId);
	const dataTask = taskQuery?.data?.data;

	const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
		columns.map((c) => c.id!),
	);

	const table = useReactTable({
		data: dataTask as any,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnOrder,
		},
		onColumnOrderChange: setColumnOrder,
	});

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

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToHorizontalAxis]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<div className='overflow-hidden rounded-xl border bg-background shadow-sm'>
				<div className='border-b px-4 py-3'>
					<h3 className='text-sm font-semibold'>Board Table</h3>
					<p className='text-xs text-muted-foreground'>
						Kéo icon bên phải để đổi vị trí cột
					</p>
				</div>

				<div className='overflow-x-auto'>
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='border-b bg-muted/20 hover:bg-muted/20'
								>
									<SortableContext
										items={columnOrder}
										strategy={horizontalListSortingStrategy}
									>
										{headerGroup.headers.map((header) => (
											<DraggableTableHeader
												key={header.id}
												header={header}
											/>
										))}
									</SortableContext>
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{table?.getRowModel().rows.length ? (
								table?.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className='transition-colors hover:bg-muted/30'
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
										colSpan={columnOrder.length}
										className='h-24 text-center text-muted-foreground'
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
	);
};

export default BoardTable;
