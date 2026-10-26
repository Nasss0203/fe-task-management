"use client";

import { FileText, PanelRightOpen, Plus } from "lucide-react";
import { useState } from "react";

import type {
	Database,
	DatabaseRow,
	DatabaseViewDetail,
} from "@/entities/database/model/database.types";

import {
	getRowValueMap,
	getTitleProperty,
	getVisibleProperties,
} from "../lib/view-properties";
import { useQuickAddRow } from "../model/use-quick-add-row";
import type { OpenRowHandler } from "./database-view-renderer";
import { RowActionsMenu } from "./row-actions-menu";
import { RowPropertySummary } from "./row-property-summary";
import { RenameRowButton, RowTitle } from "./row-title";

interface ListViewProps {
	database: Database;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];
	onOpenRow: OpenRowHandler;
	readOnly?: boolean;
}

export function ListView({
	database,
	viewDetail,
	rows,
	onOpenRow,
	readOnly = false,
}: ListViewProps) {
	const titleProperty = getTitleProperty(database);
	const visibleProperties = getVisibleProperties(database, viewDetail);
	const { addRow, isPending } = useQuickAddRow(database);
	// Row whose name is being edited inline (pencil button or a just-added row).
	const [editingRowId, setEditingRowId] = useState<string | null>(null);

	return (
		<div className='w-full min-w-0'>
			<ul className='border-t'>
				{rows.map((row) => {
					const values = getRowValueMap(row);
					const editing = row.id === editingRowId;
					const summary = (
						<RowPropertySummary
							databaseId={database.id}
							pageId={database.pageId}
							rowId={row.id}
							properties={visibleProperties}
							values={values}
							layout='inline'
						/>
					);

					return (
						<li
							key={row.id}
							className='group/row flex min-h-10 items-center gap-2 border-b px-1 transition-colors hover:bg-muted/40'
						>
							{editing ? (
								<div className='flex min-w-0 flex-1 items-center gap-2 px-1'>
									<FileText className='size-4 shrink-0 text-muted-foreground' />
									<RowTitle
										database={database}
										row={row}
										titleProperty={titleProperty}
										editing
										onEditingChange={() => setEditingRowId(null)}
									/>
								</div>
							) : (
								// The whole row opens the side peek, like Notion's list. A div (not a
								// button) so the rename button can sit right after the name.
								<div
									role='button'
									tabIndex={0}
									onClick={() => onOpenRow(row.id)}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											onOpenRow(row.id);
										}
									}}
									className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 self-stretch rounded-sm px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
								>
									<FileText className='size-4 shrink-0 text-muted-foreground' />
									<RowTitle
										database={database}
										row={row}
										titleProperty={titleProperty}
										editing={false}
										onEditingChange={() => undefined}
										className='min-w-[60px] shrink'
									/>
									{titleProperty && !readOnly && (
										<RenameRowButton onClick={() => setEditingRowId(row.id)} />
									)}
									<span className='ml-auto hidden min-w-0 max-w-[65%] sm:block'>
										{summary}
									</span>
									<PanelRightOpen className='size-4 shrink-0 text-muted-foreground opacity-0 group-hover/row:opacity-100 [@media(hover:none)]:hidden' />
								</div>
							)}

							{!readOnly && (
								<div className='w-8 shrink-0'>
									<RowActionsMenu databaseId={database.id} rowId={row.id} />
								</div>
							)}
						</li>
					);
				})}

				{rows.length === 0 && (
					<li className='border-b px-2 py-5 text-sm text-muted-foreground'>
						No rows yet
					</li>
				)}
			</ul>

			{!readOnly && (
				<button
					type='button'
					disabled={isPending}
					onClick={async () => {
						const rowId = await addRow();
						if (rowId) setEditingRowId(rowId);
					}}
					className='flex h-9 w-full items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50'
				>
					<Plus className='size-4' />
					{isPending ? "Adding..." : "New row"}
				</button>
			)}
		</div>
	);
}
