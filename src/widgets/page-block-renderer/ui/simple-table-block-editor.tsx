"use client";

import { Check, MoreHorizontal, Plus, Settings2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";

import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface SimpleTableBlockEditorProps {
	block: PageBlockNode;
}

interface TableCell {
	id: string;
	text: string;
}

interface TableRow {
	id: string;
	cells: TableCell[];
}

type SimpleTableContent = Record<string, unknown> & {
	rows: TableRow[];
	hasHeaderRow: boolean;
	hasHeaderColumn: boolean;
};

function createCell(): TableCell {
	return {
		id: crypto.randomUUID(),
		text: "",
	};
}

function createRow(columnCount: number): TableRow {
	return {
		id: crypto.randomUUID(),
		cells: Array.from({ length: columnCount }, () => createCell()),
	};
}

function createDefaultTable(): SimpleTableContent {
	return {
		rows: [createRow(2), createRow(2)],
		hasHeaderRow: false,
		hasHeaderColumn: false,
	};
}

function getTableContent(block: PageBlockNode): SimpleTableContent {
	const content = block.content;

	if (
		content &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"rows" in content &&
		Array.isArray(content.rows)
	) {
		return {
			rows: content.rows as TableRow[],

			hasHeaderRow:
				"hasHeaderRow" in content &&
				typeof content.hasHeaderRow === "boolean"
					? content.hasHeaderRow
					: false,

			hasHeaderColumn:
				"hasHeaderColumn" in content &&
				typeof content.hasHeaderColumn === "boolean"
					? content.hasHeaderColumn
					: false,
		};
	}

	return createDefaultTable();
}

export function SimpleTableBlockEditor({ block }: SimpleTableBlockEditorProps) {
	const [table, setTable] = useState<SimpleTableContent>(() =>
		getTableContent(block),
	);

	const updateBlock = useUpdatePageBlock();

	useEffect(() => {
		setTable(getTableContent(block));
	}, [block]);

	const saveTable = (nextTable: SimpleTableContent) => {
		setTable(nextTable);

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: nextTable,
		});
	};

	const handleCellChange = (rowId: string, cellId: string, value: string) => {
		setTable((current) => ({
			...current,

			rows: current.rows.map((row) => {
				if (row.id !== rowId) {
					return row;
				}

				return {
					...row,

					cells: row.cells.map((cell) => {
						if (cell.id !== cellId) {
							return cell;
						}

						return {
							...cell,
							text: value,
						};
					}),
				};
			}),
		}));
	};

	const handleCellBlur = () => {
		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: table,
		});
	};

	const handleAddRow = () => {
		const columnCount = table.rows[0]?.cells.length ?? 2;

		const nextTable: SimpleTableContent = {
			...table,
			rows: [...table.rows, createRow(columnCount)],
		};

		saveTable(nextTable);
	};

	const handleAddColumn = () => {
		const nextTable: SimpleTableContent = {
			...table,

			rows: table.rows.map((row) => ({
				...row,
				cells: [...row.cells, createCell()],
			})),
		};

		saveTable(nextTable);
	};

	const handleToggleHeaderRow = () => {
		saveTable({
			...table,
			hasHeaderRow: !table.hasHeaderRow,
		});
	};

	const handleToggleHeaderColumn = () => {
		saveTable({
			...table,
			hasHeaderColumn: !table.hasHeaderColumn,
		});
	};

	const handleDeleteRow = (rowId: string) => {
		if (table.rows.length <= 1) {
			return;
		}

		const nextTable: SimpleTableContent = {
			...table,
			rows: table.rows.filter((row) => row.id !== rowId),
		};

		saveTable(nextTable);
	};

	const handleDeleteColumn = (columnIndex: number) => {
		const columnCount = table.rows[0]?.cells.length ?? 0;

		if (columnCount <= 1) {
			return;
		}

		const nextTable: SimpleTableContent = {
			...table,

			rows: table.rows.map((row) => ({
				...row,
				cells: row.cells.filter((_, index) => index !== columnIndex),
			})),
		};

		saveTable(nextTable);
	};

	const columnCount = table.rows[0]?.cells.length ?? 0;

	return (
		<div className='w-full'>
			{/* Table settings */}
			<div className='mb-1 flex justify-end'>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-7 text-muted-foreground hover:text-foreground'
						>
							<Settings2 className='size-4' />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						side='bottom'
						align='end'
						sideOffset={4}
						className='w-48 p-1'
					>
						<button
							type='button'
							onClick={handleToggleHeaderRow}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<div className='flex size-4 items-center justify-center'>
								{table.hasHeaderRow && (
									<Check className='size-4' />
								)}
							</div>

							<span>Header row</span>
						</button>

						<button
							type='button'
							onClick={handleToggleHeaderColumn}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<div className='flex size-4 items-center justify-center'>
								{table.hasHeaderColumn && (
									<Check className='size-4' />
								)}
							</div>

							<span>Header column</span>
						</button>
					</PopoverContent>
				</Popover>
			</div>

			<div className='flex items-start'>
				{/* Table */}
				<div className='min-w-0 flex-1 overflow-x-auto'>
					<table className='w-full border-collapse'>
						<tbody>
							{table.rows.map((row, rowIndex) => (
								<tr key={row.id}>
									{row.cells.map((cell, columnIndex) => {
										const isHeaderRow =
											table.hasHeaderRow &&
											rowIndex === 0;

										const isHeaderColumn =
											table.hasHeaderColumn &&
											columnIndex === 0;

										const isHeader =
											isHeaderRow || isHeaderColumn;

										return (
											<td
												key={cell.id}
												className={`group/cell relative min-w-[160px] border border-border p-0 ${
													isHeader
														? "bg-muted/40"
														: ""
												}`}
											>
												<input
													value={cell.text}
													onChange={(event) =>
														handleCellChange(
															row.id,
															cell.id,
															event.target.value,
														)
													}
													onBlur={handleCellBlur}
													className={`h-9 w-full border-0 bg-transparent px-2 pr-9 text-sm outline-none focus:bg-muted/30 ${
														isHeader
															? "font-semibold"
															: ""
													}`}
												/>

												{/* Row / Column actions */}
												<div className='absolute right-0.5 top-1 opacity-0 transition-opacity group-hover/cell:opacity-100'>
													<Popover>
														<PopoverTrigger asChild>
															<Button
																type='button'
																variant='ghost'
																size='icon'
																className='size-7 text-muted-foreground hover:text-foreground'
															>
																<MoreHorizontal className='size-4' />
															</Button>
														</PopoverTrigger>

														<PopoverContent
															side='bottom'
															align='end'
															sideOffset={4}
															className='w-48 p-1'
														>
															<button
																type='button'
																disabled={
																	table.rows
																		.length <=
																	1
																}
																onClick={() =>
																	handleDeleteRow(
																		row.id,
																	)
																}
																className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
															>
																<Trash2 className='size-4' />
																<span>
																	Delete row
																</span>
															</button>

															<button
																type='button'
																disabled={
																	columnCount <=
																	1
																}
																onClick={() =>
																	handleDeleteColumn(
																		columnIndex,
																	)
																}
																className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40'
															>
																<Trash2 className='size-4' />
																<span>
																	Delete
																	column
																</span>
															</button>
														</PopoverContent>
													</Popover>
												</div>
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Add column */}
				<button
					type='button'
					onClick={handleAddColumn}
					title='Add column'
					className='ml-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<Plus className='size-4' />
				</button>
			</div>

			{/* Add row */}
			<button
				type='button'
				onClick={handleAddRow}
				className='mt-1 flex h-7 w-full items-center justify-center rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
			>
				<div className='flex items-center gap-1'>
					<Plus className='size-3.5' />
					<span>Add row</span>
				</div>
			</button>
		</div>
	);
}
