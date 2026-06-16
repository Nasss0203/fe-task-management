"use client";

import React, { useState } from "react";
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragOverEvent,
	DragEndEvent,
	defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	horizontalListSortingStrategy,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

// Types
type Task = {
	id: string;
	title: string;
	columnId: string;
};

type Column = {
	id: string;
	title: string;
};

// Mock Data
const MOCK_COLUMNS: Column[] = [
	{ id: "col-todo", title: "Cần làm" },
	{ id: "col-in-progress", title: "Đang làm" },
	{ id: "col-done", title: "Hoàn thành" },
];

const MOCK_TASKS: Task[] = [
	{ id: "t-1", title: "Xác định phạm vi và mục tiêu dự án", columnId: "col-todo" },
	{ id: "t-2", title: "Thiết lập schema cơ sở dữ liệu", columnId: "col-todo" },
	{ id: "t-3", title: "Thiết kế giao diện landing page", columnId: "col-todo" },
	{ id: "t-4", title: "Triển khai tính năng xác thực", columnId: "col-in-progress" },
	{ id: "t-5", title: "Tạo thiết kế mockup", columnId: "col-done" },
];

// --- Sortable Task Component ---
function SortableTask({ task }: { task: Task }) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: "Task", task },
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="opacity-30 border-2 border-primary rounded-xl h-[72px] w-full"
			/>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-card text-card-foreground shadow-sm rounded-xl p-3 border border-border cursor-grab hover:border-primary/50 transition-colors flex items-center gap-2 group"
		>
			<GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
			<span className="text-sm font-medium">{task.title}</span>
		</div>
	);
}

// --- Sortable Column Component ---
function SortableColumn({
	column,
	tasks,
}: {
	column: Column;
	tasks: Task[];
}) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: { type: "Column", column },
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="bg-secondary/50 border-2 border-primary opacity-40 rounded-2xl w-[300px] h-[500px] shrink-0"
			/>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-secondary/30 border border-border rounded-2xl w-[300px] shrink-0 flex flex-col h-[500px]"
		>
			<div
				{...attributes}
				{...listeners}
				className="p-4 font-semibold text-foreground flex items-center justify-between cursor-grab border-b border-border/50 bg-secondary/50 rounded-t-2xl"
			>
				<span>{column.title}</span>
				<span className="bg-background px-2 py-0.5 rounded-full text-xs text-muted-foreground font-medium">
					{tasks.length}
				</span>
			</div>
			<div className="flex-grow p-3 flex flex-col gap-2 overflow-y-auto">
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<SortableTask key={task.id} task={task} />
					))}
				</SortableContext>
			</div>
		</div>
	);
}

// --- Main Board Component ---
export default function MockKanbanBoard() {
	const [columns, setColumns] = useState<Column[]>(MOCK_COLUMNS);
	const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}
		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.task);
			return;
		}
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveTask = active.data.current?.type === "Task";
		const isOverTask = over.data.current?.type === "Task";
		const isOverColumn = over.data.current?.type === "Column";

		if (!isActiveTask) return;

		// Dropping a Task over another Task
		if (isActiveTask && isOverTask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);

				if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
					// Different column
					const newTasks = [...tasks];
					newTasks[activeIndex].columnId = tasks[overIndex].columnId;
					return arrayMove(newTasks, activeIndex, overIndex);
				}
				// Same column
				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		// Dropping a Task over an empty Column
		if (isActiveTask && isOverColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const newTasks = [...tasks];
				newTasks[activeIndex].columnId = overId as string;
				return arrayMove(newTasks, activeIndex, activeIndex);
			});
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveColumn = active.data.current?.type === "Column";
		if (isActiveColumn) {
			setColumns((columns) => {
				const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
				const overColumnIndex = columns.findIndex((col) => col.id === overId);
				return arrayMove(columns, activeColumnIndex, overColumnIndex);
			});
		}
	}

	return (
		<div className="w-full h-full overflow-x-auto p-4 flex gap-4 select-none">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragEnd={onDragEnd}
			>
				<SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
					{columns.map((col) => (
						<SortableColumn
							key={col.id}
							column={col}
							tasks={tasks.filter((t) => t.columnId === col.id)}
						/>
					))}
				</SortableContext>

				<DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
					<div className="z-[99999] pointer-events-none">
						{activeColumn && (
							<SortableColumn
								column={activeColumn}
								tasks={tasks.filter((t) => t.columnId === activeColumn.id)}
							/>
						)}
						{activeTask && <SortableTask task={activeTask} />}
					</div>
				</DragOverlay>
			</DndContext>
		</div>
	);
}
