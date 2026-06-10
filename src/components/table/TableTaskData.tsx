"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import { Fragment, useState } from "react";

import PanigationTable from "@/components/panigation/PanigationTable";
import { TaskBulkActionBar } from "@/features/task/components/task/TaskBulkActionBar";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";

type TableTaskDataProps<T extends { id: string }> = {
	data: T[];
	columns: ColumnDef<T>[];
	showBulkAction?: boolean;
	onMoveToSprint?: (selectedItems: T[]) => void;
	onAssign?: (selectedItems: T[]) => void;
	onChangeStatus?: (selectedItems: T[]) => void;
	onDelete?: (selectedItems: T[]) => void;
};

const TableTaskData = <T extends { id: string }>({
	data,
	columns,
	showBulkAction = true,
	onMoveToSprint,
	onAssign,
	onChangeStatus,
	onDelete,
}: TableTaskDataProps<T>) => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const table = useReactTable({
		data,
		columns,

		getRowId: (row) => row.id,
		enableRowSelection: true,

		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),

		onPaginationChange: setPagination,
		onRowSelectionChange: setRowSelection,

		state: {
			pagination,
			rowSelection,
		},
	});

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedItems = selectedRows.map((row) => row.original);
	const selectedCount = selectedItems.length;

	const selectedIds = selectedItems.map((item) => item.id);

	return (
		<Fragment>
			<div className='rounded-md border'>
				<div className='relative max-h-[600px] overflow-auto rounded-md'>
					<table className='w-full caption-bottom text-sm'>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='hover:bg-transparent'
								>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className='sticky top-0 z-20 h-10 bg-background shadow-[inset_0_-1px_0_hsl(var(--border))]'
											style={{
												width: header.getSize(),
												minWidth: header.getSize(),
											}}
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
										className='h-14'
										data-state={
											row.getIsSelected() && "selected"
										}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
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
										colSpan={columns.length}
										className='h-24 text-center text-sm text-muted-foreground'
									>
										Không có dữ liệu.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</table>
				</div>

				<PanigationTable table={table} />
			</div>

			{showBulkAction && (
				<TaskBulkActionBar
					selectedCount={selectedCount}
					totalCount={data.length}
					onSelectAll={() => table.toggleAllRowsSelected(true)}
					onClear={() => table.resetRowSelection()}
					onMoveToSprint={() => {
						if (onMoveToSprint) {
							onMoveToSprint(selectedItems);
							return;
						}

						console.log("move to sprint", selectedIds);
					}}
					onAssign={() => {
						if (onAssign) {
							onAssign(selectedItems);
							return;
						}

						console.log("assign", selectedIds);
					}}
					onChangeStatus={() => {
						if (onChangeStatus) {
							onChangeStatus(selectedItems);
							return;
						}

						console.log("change status", selectedIds);
					}}
					onDelete={() => {
						if (onDelete) {
							onDelete(selectedItems);
							return;
						}

						console.log("delete", selectedIds);
					}}
				/>
			)}
		</Fragment>
	);
};

export default TableTaskData;
