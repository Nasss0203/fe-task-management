"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";

interface BacklogTableProps<TData, TValue> {
	table: TanStackTable<TData>;
	className?: string;
	emptyText?: string;
}

const BacklogTable = <TData, TValue>({
	table,
	className,
	emptyText = "Không có công việc nào.",
}: BacklogTableProps<TData, TValue>) => {
	return (
		<div
			className={cn(
				"min-h-0 min-w-0 flex-1 flex flex-col rounded-xl border border-border bg-card shadow-sm",
				className,
			)}
		>
			<Table containerClassName='flex-1 min-h-0 overflow-auto' className='w-full min-w-[720px] table-fixed'>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className='h-12 border-b border-border bg-muted/30 hover:bg-muted/30'
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{
										width: header.getSize(),
									}}
									className={cn(
										"whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground",
										(
											header.column.columnDef
												.meta as any
										)?.className,
									)}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef
													.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={
									row.getIsSelected() && "selected"
								}
								className='h-14 border-b border-border/70 transition-colors hover:bg-muted/35 data-[state=selected]:bg-muted'
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										style={{
											width: cell.column.getSize(),
										}}
										className={cn(
											"whitespace-nowrap px-3 text-sm text-foreground",
											(
												cell.column.columnDef
													.meta as any
											)?.className,
										)}
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
						<TableRow>
							<TableCell
								colSpan={
									table.getVisibleLeafColumns().length
								}
								className='p-0 text-center text-muted-foreground'
							>
								<div className='flex min-h-[280px] items-center justify-center text-sm'>
									{emptyText}
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default BacklogTable;
