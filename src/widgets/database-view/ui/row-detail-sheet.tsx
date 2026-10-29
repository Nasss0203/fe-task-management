"use client";

import { ChevronRight, Maximize2, Table2 } from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import type { Database, DatabaseRow } from "@/entities/database/model/database.types";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/shared/ui/sheet";

import {
	clampRowSheetWidth,
	readRowSheetWidth,
	ROW_SHEET_DEFAULT_WIDTH,
	saveRowSheetWidth,
} from "../lib/row-sheet-width";
import { getRowValueMap, getTitleProperty } from "../lib/view-properties";
import { useDatabaseShareToken } from "../model/share-token-context";
import type { OpenRowHandler } from "./database-view-renderer";
import { RowDetailBody } from "./row-detail-body";
import { SheetResizeHandle } from "./sheet-resize-handle";

interface RowDetailSheetProps {
	database: Database;
	/** Undefined closes the sheet (also when the row was deleted). */
	row?: DatabaseRow;
	/** Every row of the database: finds the parent task and the sub-tasks. */
	allRows?: DatabaseRow[];
	/** Opens another row in this peek (a sub-task or the parent task). */
	onOpenRow?: OpenRowHandler;
	/** Focus the title right away, e.g. for a row that was just created. */
	autoFocusTitle?: boolean;
	/** Cuộn tới mục Comments khi mở (từ link thông báo comment). */
	scrollToComments?: boolean;
	readOnly?: boolean;
	onClose: () => void;
}

/** The URL of a task opened full page. */
export function rowPageHref(pageId: string, rowId: string) {
	return `/page/${pageId}/row/${rowId}`;
}

/** Notion-style side peek: every property of one row, editable in place. */
export function RowDetailSheet({
	database,
	row,
	allRows = [],
	onOpenRow,
	autoFocusTitle = false,
	scrollToComments = false,
	readOnly = false,
	onClose,
}: RowDetailSheetProps) {
	const shareToken = useDatabaseShareToken();
	const titleProperty = getTitleProperty(database);
	const rowTitle = (target?: DatabaseRow) =>
		(target &&
			titleProperty &&
			(getRowValueMap(target).get(titleProperty.id) as string)) ||
		"Untitled";
	const parentRow = allRows.find((item) => item.id === row?.parentRowId);
	// Read once: the sheet only renders in the browser, after it opens.
	const [width, setWidth] = useState(() =>
		typeof window === "undefined"
			? ROW_SHEET_DEFAULT_WIDTH
			: clampRowSheetWidth(readRowSheetWidth(), window.innerWidth),
	);

	return (
		<Sheet open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
			<SheetContent
				side='right'
				// Only a just-created row grabs focus; otherwise the title would open selected.
				onOpenAutoFocus={(event) => {
					if (!autoFocusTitle) event.preventDefault();
				}}
				// Phone: full width. Wider screens: the width dragged from the left edge.
				className='w-full gap-0 sm:w-(--row-sheet-width) sm:max-w-[90vw]'
				style={{ "--row-sheet-width": `${width}px` } as CSSProperties}
			>
				<SheetTitle className='sr-only'>{rowTitle(row)}</SheetTitle>
				<SheetDescription className='sr-only'>
					Row details in {database.name}
				</SheetDescription>

				<SheetResizeHandle
					width={width}
					onResize={setWidth}
					onCommit={(next) => {
						setWidth(next ?? ROW_SHEET_DEFAULT_WIDTH);
						saveRowSheetWidth(next);
					}}
				/>

				{row && (
					// Scrolls inside, so the resize handle and close button stay put.
					<div className='flex h-full min-h-0 flex-col overflow-y-auto'>
						{/* shrink-0: inside the scrolling column a long task would squash it */}
						<div className='flex h-12 shrink-0 items-center gap-1.5 border-b px-6 pr-12 text-sm text-muted-foreground sm:px-8'>
							<Table2 className='size-4 shrink-0' />
							<span className='truncate'>{database.name}</span>
							{parentRow && (
								<>
									<ChevronRight className='size-3.5 shrink-0' />
									<button
										type='button'
										onClick={() => onOpenRow?.(parentRow.id)}
										className='truncate rounded-sm px-1 hover:bg-muted hover:text-foreground'
									>
										{rowTitle(parentRow)}
									</button>
								</>
							)}
							{/* Full page needs a signed-in workspace member, so not on share links or public sites. */}
							{!readOnly && !shareToken && (
								<Link
									href={rowPageHref(database.pageId, row.id)}
									aria-label='Open as page'
									title='Open as page'
									className='ml-auto flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-muted hover:text-foreground'
								>
									<Maximize2 className='size-4' />
								</Link>
							)}
						</div>

						<div className='flex flex-1 flex-col px-6 pb-6 pt-8 sm:px-8'>
							<RowDetailBody
								database={database}
								row={row}
								allRows={allRows}
								readOnly={readOnly}
								autoFocusTitle={autoFocusTitle}
								scrollToComments={scrollToComments}
								onOpenRow={onOpenRow}
								onDeleted={onClose}
							/>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
