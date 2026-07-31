"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;
	skeletonRowCount?: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading = false,
	skeletonRowCount = 10,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className='overflow-x-auto'>
			<Table className='w-full min-w-205 border-separate border-spacing-y-2 text-sm'>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className='border-none hover:bg-transparent'
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className='h-auto pb-2 text-left font-medium text-muted-foreground'
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{isLoading ? (
						Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
							<TableRow
								key={`data-table-skeleton-${rowIndex}`}
								className='border-none bg-muted/50 hover:bg-muted/50'
							>
								{columns.map((_, cellIndex) => (
									<TableCell
										key={`data-table-skeleton-${rowIndex}-${cellIndex}`}
										className={`px-4 py-4 ${
											cellIndex === 0 ? "rounded-l-xl" : ""
										} ${
											cellIndex === columns.length - 1
												? "rounded-r-xl"
												: ""
										}`}
									>
										<Skeleton
											className={
												cellIndex === 0
													? "h-5 w-40"
													: cellIndex === columns.length - 1
														? "h-5 w-24"
														: "h-5 w-28"
											}
										/>
									</TableCell>
								))}
							</TableRow>
						))
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								className='border-none bg-muted/50 text-foreground hover:hover:bg-muted/80'
							>
								{row.getVisibleCells().map((cell, index) => (
									<TableCell
										key={cell.id}
										className={`px-4 py-4 ${
											index === 0 ? "rounded-l-xl" : ""
										} ${
											index ===
											row.getVisibleCells().length - 1
												? "rounded-r-xl"
												: ""
										}`}
									>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow className='border-none'>
							<TableCell
								colSpan={columns.length}
								className='h-24 text-center text-muted-foreground'
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
