"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteDatabaseRow } from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type Database,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";

import { cn } from "@/shared/lib/utils";

import { RowComments } from "@/widgets/page-comments/ui/row-comments";

import { getChildRows } from "../lib/row-tree";
import { getRowValueMap, getTitleProperty } from "../lib/view-properties";
import { useDatabaseShareToken } from "../model/share-token-context";
import { DatabaseCell } from "./database-cell";
import type { OpenRowHandler } from "./database-view-renderer";
import { RowContent } from "./row-content";
import { RowSubtasks } from "./row-subtasks";

interface RowDetailBodyProps {
	database: Database;
	row: DatabaseRow;
	/** Every row of the database: finds the sub-tasks. */
	allRows: DatabaseRow[];
	readOnly: boolean;
	autoFocusTitle?: boolean;
	/** Cuộn tới mục Comments khi mở (từ link thông báo comment). */
	scrollToComments?: boolean;
	/** Opens another row (a sub-task), in the peek or full page. */
	onOpenRow?: OpenRowHandler;
	/** Called once the row is deleted, to leave the view. */
	onDeleted: () => void;
	/** "page": full-page task, with a page-sized title and properties kept compact. */
	variant?: "peek" | "page";
}

/**
 * One task: title, properties, sub-tasks, content and comments. Shared by the
 * side peek and the full-page task view.
 */
export function RowDetailBody({
	database,
	row,
	allRows,
	readOnly,
	autoFocusTitle = false,
	scrollToComments = false,
	onOpenRow,
	onDeleted,
	variant = "peek",
}: RowDetailBodyProps) {
	const mode = readOnly ? "readonly" : "editable";
	const deleteRowMutation = useDeleteDatabaseRow(database.id);
	const shareToken = useDatabaseShareToken();
	const titleProperty = getTitleProperty(database);
	const values = getRowValueMap(row);
	const subtaskCount = getChildRows(allRows, row.id).length;
	// Deleting a parent deletes its sub-tasks too: ask with a second click.
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const properties = [...database.properties]
		.filter((property) => property.type !== PropertyType.TITLE)
		.sort((a, b) => Number(a.position) - Number(b.position));

	return (
		<div className='flex flex-1 flex-col'>
			{titleProperty && (
				<div
					className={cn(
						"[&_input]:h-auto [&_input]:px-0 [&_input]:py-1 [&_input]:font-bold [&_input]:leading-tight",
						variant === "page"
							? "[&_input]:text-4xl"
							: "[&_input]:text-[22px] [&_input]:tracking-[-0.01em]",
					)}
				>
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
				className={cn("-mx-2 mt-4", variant === "page" && "max-w-3xl")}
			>
				{properties.map((property) => (
					<div
						key={property.id}
						className='flex min-h-8 items-center gap-2 rounded-md px-2 text-[13.5px]'
					>
						<span className='flex w-30 shrink-0 items-center gap-2 text-[13px] text-muted-foreground'>
							<PropertyIcon
								type={property.type}
								className='size-3.5'
							/>
							<span className='truncate'>{property.name}</span>
						</span>
						{/* In the peek, empty-value hints stay visible and numbers align left. */}
						<div
							className={cn(
								"rounded-md px-1 [&_.opacity-0]:opacity-100 [&_input]:text-left [&_span.text-muted-foreground]:text-muted-foreground/60",
								// A checkbox is only its box: no row-wide hover band behind it.
								property.type === PropertyType.CHECKBOX
									? "shrink-0"
									: "min-w-0 flex-1 transition-colors hover:bg-accent",
							)}
						>
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

			<RowSubtasks
				database={database}
				row={row}
				allRows={allRows}
				readOnly={readOnly}
				onOpenRow={onOpenRow}
			/>

			<RowContent
				pageId={database.pageId}
				rowId={row.id}
				readOnly={readOnly}
				shareToken={shareToken}
			/>

			{/* Drawer chỉ đọc còn dùng cho site public (người xem chưa đăng nhập): chỉ hiện comment khi sửa được hoặc mở qua link share */}
			{(!readOnly || shareToken) && (
				<RowComments
					pageId={database.pageId}
					rowId={row.id}
					scrollIntoView={scrollToComments}
					shareToken={shareToken}
				/>
			)}

			{!readOnly && (
				<div className='mt-auto flex justify-end pt-8'>
					<button
						type='button'
						disabled={deleteRowMutation.isPending}
						onClick={() => {
							if (
								subtaskCount > 0 &&
								confirmDeleteId !== row.id
							) {
								setConfirmDeleteId(row.id);
								return;
							}
							deleteRowMutation.mutate(row.id, {
								onSuccess: onDeleted,
								onError: () =>
									toast.error("Couldn't delete row"),
							});
						}}
						className='flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50'
					>
						<Trash2 className='size-4' />
						{confirmDeleteId === row.id
							? `Delete with ${subtaskCount} sub-task${subtaskCount > 1 ? "s" : ""}?`
							: "Delete row"}
					</button>
				</div>
			)}
		</div>
	);
}
