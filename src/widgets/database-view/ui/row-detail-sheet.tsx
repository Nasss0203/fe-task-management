"use client";

import { Table2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDeleteDatabaseRow } from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type Database,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/shared/ui/sheet";

import { getRowValueMap, getTitleProperty } from "../lib/view-properties";
import { DatabaseCell } from "./database-cell";

interface RowDetailSheetProps {
	database: Database;
	/** Undefined closes the sheet (also when the row was deleted). */
	row?: DatabaseRow;
	/** Focus the title right away, e.g. for a row that was just created. */
	autoFocusTitle?: boolean;
	readOnly?: boolean;
	onClose: () => void;
}

/** Notion-style side peek: every property of one row, editable in place. */
export function RowDetailSheet({
	database,
	row,
	autoFocusTitle = false,
	readOnly = false,
	onClose,
}: RowDetailSheetProps) {
	const mode = readOnly ? "readonly" : "editable";
	const deleteRowMutation = useDeleteDatabaseRow(database.id);
	const titleProperty = getTitleProperty(database);
	const values = row ? getRowValueMap(row) : new Map<string, unknown>();
	const title =
		(titleProperty && (values.get(titleProperty.id) as string)) || "Untitled";
	const properties = [...database.properties]
		.filter((property) => property.type !== PropertyType.TITLE)
		.sort((a, b) => Number(a.position) - Number(b.position));

	return (
		<Sheet open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
			<SheetContent
				side='right'
				// Only a just-created row grabs focus; otherwise the title would open selected.
				onOpenAutoFocus={(event) => {
					if (!autoFocusTitle) event.preventDefault();
				}}
				className='w-full gap-0 overflow-y-auto sm:max-w-xl'
			>
				<SheetTitle className='sr-only'>{title}</SheetTitle>
				<SheetDescription className='sr-only'>
					Row details in {database.name}
				</SheetDescription>

				{row && (
					<div className='flex min-h-full flex-col'>
						<div className='flex h-12 items-center gap-1.5 border-b px-6 pr-12 text-sm text-muted-foreground sm:px-8'>
							<Table2 className='size-4 shrink-0' />
							<span className='truncate'>{database.name}</span>
						</div>

						<div className='flex flex-1 flex-col px-6 pb-6 pt-8 sm:px-8'>
							{titleProperty && (
								<div className='[&_input]:h-auto [&_input]:px-0 [&_input]:py-1 [&_input]:text-2xl [&_input]:font-bold [&_input]:leading-tight sm:[&_input]:text-[1.75rem]'>
									<DatabaseCell
										databaseId={database.id}
										pageId={database.pageId}
										rowId={row.id}
										property={titleProperty}
										value={values.get(titleProperty.id)}
										autoFocus={autoFocusTitle}
										mode={mode}
									/>
								</div>
							)}

							<section
								aria-label='Properties'
								className='-mx-2 mt-6'
							>
								{properties.map((property) => (
									<div
										key={property.id}
										className='flex min-h-10 items-center gap-3 rounded-md px-2 text-sm'
									>
										<span className='flex w-36 shrink-0 items-center gap-2 text-muted-foreground'>
											<PropertyIcon type={property.type} className='size-4' />
											<span className='truncate'>{property.name}</span>
										</span>
										{/* In the peek, empty-value hints stay visible and numbers align left. */}
										<div className='min-w-0 flex-1 rounded-md px-1 transition-colors hover:bg-muted/70 [&_.opacity-0]:opacity-100 [&_input]:text-left [&_span.text-muted-foreground]:text-muted-foreground/60'>
											<DatabaseCell
												databaseId={database.id}
												pageId={database.pageId}
												rowId={row.id}
												property={property}
												value={values.get(property.id)}
												mode={mode}
											/>
										</div>
									</div>
								))}
								{properties.length === 0 && (
									<p className='px-2 py-3 text-sm text-muted-foreground'>
										No other properties yet
									</p>
								)}
							</section>

							{!readOnly && (
								<div className='mt-auto flex justify-end pt-8'>
									<button
										type='button'
										disabled={deleteRowMutation.isPending}
										onClick={() =>
											deleteRowMutation.mutate(row.id, {
												onSuccess: onClose,
												onError: () => toast.error("Couldn't delete row"),
											})
										}
										className='flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50'
									>
										<Trash2 className='size-4' />
										Delete row
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
