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
				"overflow-hidden rounded-xl border border-border bg-card shadow-sm",
				className,
			)}
		>
			<div className='w-full overflow-x-auto'>
				<Table className='w-auto'>
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
										className='whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground'
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
											className='whitespace-nowrap px-3 text-sm text-foreground'
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
									className='h-28 text-center text-sm text-muted-foreground'
								>
									{emptyText}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default BacklogTable;
