"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { flexRender, type Row } from "@tanstack/react-table";

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
	const { ref, isDragging } = useSortable({
		id: row.original.id,
		index,
		group: containerId,
		type: "item",
		accept: ["item"],
		data: {
			taskId: row.original.id,
			containerId,
		},
	});

	return (
		<TableRow
			ref={ref}
			className={cn("h-14 cursor-pointer", isDragging && "opacity-40")}
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
