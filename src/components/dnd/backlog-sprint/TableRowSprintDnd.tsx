"use client";

import { useDraggable } from "@dnd-kit/react"; // 👈 đổi import
import { flexRender, type Row } from "@tanstack/react-table";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableRowDndProps<TData extends { id: string }> = {
	row: Row<TData>;
	index: number;
	containerId: string;
};

const TableRowDnd = <TData extends { id: string }>({
	row,
	index,
	containerId,
}: TableRowDndProps<TData>) => {
	const { ref, isDragging } = useDraggable({
		// 👈 đổi hook
		id: row.original.id,
		type: "item",
		data: {
			taskId: row.original.id,
			containerId,
		},
	});

	return (
		<TableRow
			ref={ref}
			className={cn("h-14 cursor-grab", isDragging && "opacity-40")}
			data-state={row.getIsSelected() && "selected"}
			style={{ touchAction: "none" }}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
};

export default TableRowDnd;
