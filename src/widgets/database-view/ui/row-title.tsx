"use client";

import { Pencil } from "lucide-react";

import type {
	Database,
	DatabaseProperty,
	DatabaseRow,
} from "@/entities/database/model/database.types";
import { cn } from "@/shared/lib/utils";

import { getRowValueMap } from "../lib/view-properties";
import { DatabaseCell } from "./database-cell";

interface RowTitleProps {
	database: Database;
	row: DatabaseRow;
	titleProperty?: DatabaseProperty;
	editing: boolean;
	/** Called with false once the input loses focus (Enter, Escape or click away). */
	onEditingChange: (editing: boolean) => void;
	className?: string;
}

/**
 * A row's name as text, or as the title input while editing. Events from the
 * input never reach the card/row around it (no drag, no side peek).
 */
export function RowTitle({
	database,
	row,
	titleProperty,
	editing,
	onEditingChange,
	className,
}: RowTitleProps) {
	const title =
		titleProperty && (getRowValueMap(row).get(titleProperty.id) as string);

	if (editing && titleProperty) {
		return (
			<div
				className={cn(
					"min-w-0 flex-1 [&_input]:h-6 [&_input]:px-0 [&_input]:text-sm [&_input]:font-medium",
					className,
				)}
				onBlur={() => onEditingChange(false)}
				onClick={(event) => event.stopPropagation()}
				onMouseDown={(event) => event.stopPropagation()}
				onTouchStart={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<DatabaseCell
					databaseId={database.id}
					pageId={database.pageId}
					rowId={row.id}
					property={titleProperty}
					value={getRowValueMap(row).get(titleProperty.id)}
					autoFocus
				/>
			</div>
		);
	}

	return (
		<span
			className={cn(
				"min-w-0 truncate text-sm font-medium leading-6",
				!title && "text-muted-foreground",
				className,
			)}
		>
			{title || "Untitled"}
		</span>
	);
}

/** Small pencil button that switches a row title into edit mode. */
export function RenameRowButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type='button'
			aria-label='Rename'
			title='Rename'
			onClick={(event) => {
				event.stopPropagation();
				onClick();
			}}
			onMouseDown={(event) => event.stopPropagation()}
			onTouchStart={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
			className='flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100 [@media(hover:none)]:opacity-100'
		>
			<Pencil className='size-3.5' />
		</button>
	);
}
