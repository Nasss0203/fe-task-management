import type { Table as TanStackTable } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

type PanigationTableProps<TData> = {
	table: TanStackTable<TData>;
};

const PanigationTable = <TData,>({ table }: PanigationTableProps<TData>) => {
	const pageIndex = table.getState().pagination.pageIndex;
	const pageSize = table.getState().pagination.pageSize;
	const pageCount = Math.max(table.getPageCount(), 1);

	const totalRows = table.getFilteredRowModel().rows.length;
	const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
	const to = Math.min((pageIndex + 1) * pageSize, totalRows);

	return (
		<div className='flex shrink-0 flex-col gap-3 border-t border-border bg-background px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
			<div className='text-xs font-medium'>
				Hiển thị{" "}
				<span className='font-semibold text-foreground'>
					{from} - {to}
				</span>{" "}
				trên{" "}
				<span className='font-semibold text-foreground'>
					{totalRows}
				</span>{" "}
				công việc
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<select
					value={pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
					className='h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none transition hover:bg-accent focus:border-blue-500'
				>
					{[10, 20, 30, 40, 50].map((size) => (
						<option key={size} value={size}>
							{size} / trang
						</option>
					))}
				</select>

				<div className='flex items-center gap-1'>
					<button
						type='button'
						onClick={() => table.firstPage()}
						disabled={!table.getCanPreviousPage()}
						className='flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'
					>
						<ChevronsLeft size={15} />
					</button>

					<button
						type='button'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className='flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'
					>
						<ChevronLeft size={15} />
					</button>

					<div className='flex h-8 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground'>
						<span>Trang</span>
						<span className='font-semibold text-foreground'>
							{pageIndex + 1}
						</span>
						<span>/</span>
						<span>{pageCount}</span>
					</div>

					<button
						type='button'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className='flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'
					>
						<ChevronRight size={15} />
					</button>

					<button
						type='button'
						onClick={() => table.lastPage()}
						disabled={!table.getCanNextPage()}
						className='flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'
					>
						<ChevronsRight size={15} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default PanigationTable;
