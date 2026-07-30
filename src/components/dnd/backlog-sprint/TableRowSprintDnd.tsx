"use client";

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";

type TableRowDndProps<TData extends { id: string }> = {
	row: Row<TData>;
	index: number;
	containerId: string;
	gridTemplateColumns: string;
};

const TableRowDnd = <TData extends { id: string }>({
	row,
	index,
	containerId,
	gridTemplateColumns,
}: TableRowDndProps<TData>) => {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: row.original.id,
		data: {
			taskId: row.original.id,
			containerId,
			index,
		},
	});

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			role='row'
			className={cn(
				"grid min-h-14 border-b border-border/70 bg-background hover:bg-muted/35 data-[state=selected]:bg-muted",
				isDragging
					? "opacity-15 shadow-md"
					: "transition-colors duration-150",
			)}
			data-state={row.getIsSelected() && "selected"}
			style={{
				gridTemplateColumns,
				touchAction: "none",
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<div
					key={cell.id}
					role='cell'
					className='flex min-w-0 items-center whitespace-nowrap px-3 py-2 text-sm text-foreground'
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</div>
			))}
		</div>
	);
};

export default TableRowDnd;
