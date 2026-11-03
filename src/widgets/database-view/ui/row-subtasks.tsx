"use client";

import { FileText, Plus } from "lucide-react";
import { useState } from "react";

import {
	PropertyType,
	type Database,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { cn } from "@/shared/lib/utils";

import {
	getChildRows,
	getDoneProperty,
	getSubtaskProgress,
} from "../lib/row-tree";
import { getRowValueMap, getTitleProperty } from "../lib/view-properties";
import { useQuickAddRow } from "../model/use-quick-add-row";
import { DatabaseCell } from "./database-cell";
import type { OpenRowHandler } from "./database-view-renderer";
import { SubtaskProgress } from "./subtask-toggle";

interface RowSubtasksProps {
	database: Database;
	row: DatabaseRow;
	allRows: DatabaseRow[];
	readOnly: boolean;
	onOpenRow?: OpenRowHandler;
}

/** "Sub-tasks" in the side peek: each sub-task with its done marker, plus a quick add box. */
export function RowSubtasks({
	database,
	row,
	allRows,
	readOnly,
	onOpenRow,
}: RowSubtasksProps) {
	const { addRow } = useQuickAddRow(database);
	const [draft, setDraft] = useState("");
	const titleProperty = getTitleProperty(database);
	const done = getDoneProperty(database);
	const subtasks = getChildRows(allRows, row.id);

	if (readOnly && subtasks.length === 0) return null;

	const submit = async () => {
		const name = draft.trim();
		if (!name || !titleProperty) return;
		setDraft("");
		// Enter keeps the box focused, so several sub-tasks go in one after another.
		await addRow([{ propertyId: titleProperty.id, value: name }], row.id);
	};

	return (
		<section aria-label='Sub-tasks' className='mt-6 border-t border-border pt-4'>
			<h3 className='mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-foreground'>
				Sub-tasks
				<SubtaskProgress
					progress={getSubtaskProgress(database, allRows, row.id)}
				/>
			</h3>

			<ul className='-mx-2'>
				{subtasks.map((subtask) => {
					const values = getRowValueMap(subtask);

					const name =
						(titleProperty &&
							(values.get(titleProperty.id) as string)) ||
						"Untitled";
					const isDone =
						done !== null &&
						values.get(done.property.id) === done.doneValue;

					return (
						<li
							key={subtask.id}
							className='flex min-h-[30px] items-center gap-2 rounded-md px-2 hover:bg-accent'
						>
							{done && (
								<div
									className={cn(
										"shrink-0 text-sm",
										done.property.type !==
											PropertyType.CHECKBOX && "w-32",
									)}
								>
									<DatabaseCell
										databaseId={database.id}
										pageId={database.pageId}
										rowId={subtask.id}
										property={done.property}
										value={values.get(done.property.id)}
										mode={
											readOnly ? "readonly" : "editable"
										}
									/>
								</div>
							)}
							<button
								type='button'
								onClick={() => onOpenRow?.(subtask.id)}
								className='flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm'
							>
								<FileText className='size-4 shrink-0 text-muted-foreground' />
								<span
									className={cn(
										"truncate",
										(name === "Untitled" || isDone) &&
											"text-muted-foreground",
										isDone && "line-through",
									)}
								>
									{name}
								</span>
							</button>
							<SubtaskProgress
								progress={getSubtaskProgress(
									database,
									allRows,
									subtask.id,
								)}
							/>
						</li>
					);
				})}
			</ul>

			{!readOnly && titleProperty && (
				<label className='-mx-2 flex min-h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground focus-within:bg-muted/60'>
					<Plus className='size-4 shrink-0' />
					<input
						value={draft}
						placeholder='Add sub-task'
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (
								event.key === "Enter" &&
								!event.nativeEvent.isComposing
							) {
								event.preventDefault();
								void submit();
							}
						}}
						className='min-w-0 flex-1 bg-transparent py-1.5 text-foreground outline-none placeholder:text-muted-foreground'
					/>
				</label>
			)}
		</section>
	);
}
