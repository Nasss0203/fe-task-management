"use client";

import { FileText, PanelRightOpen, Plus } from "lucide-react";

import type {
	Database,
	DatabaseRow,
	DatabaseViewDetail,
} from "@/entities/database/model/database.types";
import { cn } from "@/shared/lib/utils";

import {
	getRowValueMap,
	getTitleProperty,
	getVisibleProperties,
} from "../lib/view-properties";
import { useQuickAddRow } from "../model/use-quick-add-row";
import type { OpenRowHandler } from "./database-view-renderer";
import { RowActionsMenu } from "./row-actions-menu";
import { RowPropertySummary } from "./row-property-summary";

interface ListViewProps {
	database: Database;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];
	onOpenRow: OpenRowHandler;
}

export function ListView({
	database,
	viewDetail,
	rows,
	onOpenRow,
}: ListViewProps) {
	const titleProperty = getTitleProperty(database);
	const visibleProperties = getVisibleProperties(database, viewDetail);
	const { addRow, isPending } = useQuickAddRow(database);

	return (
		<div className='w-full min-w-0'>
			<ul className='border-t'>
				{rows.map((row) => {
					const values = getRowValueMap(row);
					const title =
						titleProperty && (values.get(titleProperty.id) as string);

					return (
						<li
							key={row.id}
							className='group/row flex min-h-10 items-center gap-2 border-b px-1 transition-colors hover:bg-muted/40'
						>
							{/* The whole row opens the side peek, like Notion's list. */}
							<button
								type='button'
								onClick={() => onOpenRow(row.id)}
								className='flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-sm px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
							>
								<FileText className='size-4 shrink-0 text-muted-foreground' />
								<span
									className={cn(
										"min-w-[80px] shrink truncate text-sm font-medium",
										!title && "text-muted-foreground",
									)}
								>
									{title || "Untitled"}
								</span>
								<span className='ml-auto hidden min-w-0 max-w-[65%] sm:block'>
									<RowPropertySummary
										databaseId={database.id}
										pageId={database.pageId}
										rowId={row.id}
										properties={visibleProperties}
										values={values}
										layout='inline'
									/>
								</span>
								<PanelRightOpen className='size-4 shrink-0 text-muted-foreground opacity-0 group-hover/row:opacity-100 [@media(hover:none)]:hidden' />
							</button>

							<div className='w-8 shrink-0'>
								<RowActionsMenu databaseId={database.id} rowId={row.id} />
							</div>
						</li>
					);
				})}

				{rows.length === 0 && (
					<li className='border-b px-2 py-5 text-sm text-muted-foreground'>
						No rows yet
					</li>
				)}
			</ul>

			<button
				type='button'
				disabled={isPending}
				onClick={async () => {
					const rowId = await addRow();
					if (rowId) onOpenRow(rowId, true);
				}}
				className='flex h-9 w-full items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50'
			>
				<Plus className='size-4' />
				{isPending ? "Adding..." : "New row"}
			</button>
		</div>
	);
}
