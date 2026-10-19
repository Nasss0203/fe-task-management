"use client";

import { useState } from "react";

import {
	DatabaseViewType,
	type Database,
	type DatabaseRow,
	type DatabaseView,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";
import { BoardView } from "./board-view";
import { CalendarView } from "./calendar-view";
import { ListView } from "./list-view";
import { RowDetailSheet } from "./row-detail-sheet";
import { TableView } from "./table-view";

/** Opens a row in the side peek; `isNew` focuses its title. */
export type OpenRowHandler = (rowId: string, isNew?: boolean) => void;

interface DatabaseViewRendererProps {
	database: Database;
	view: DatabaseView;
	viewDetail?: DatabaseViewDetail;
	rows: DatabaseRow[];
}

export function DatabaseViewRenderer({
	database,
	view,
	viewDetail,
	rows,
}: DatabaseViewRendererProps) {
	const [openRow, setOpenRow] = useState<{ id: string; isNew: boolean } | null>(
		null,
	);
	const onOpenRow: OpenRowHandler = (id, isNew = false) =>
		setOpenRow({ id, isNew });

	if (!viewDetail) {
		return (
			<div className='p-4 text-sm text-muted-foreground'>
				Loading view...
			</div>
		);
	}

	const content = (() => {
		switch (view.type) {
			case DatabaseViewType.TABLE:
				return (
					<TableView
						database={database}
						viewId={view.id}
						viewDetail={viewDetail}
						rows={rows}
						onOpenRow={onOpenRow}
					/>
				);

			case DatabaseViewType.BOARD:
				return (
					<BoardView
						database={database}
						viewDetail={viewDetail}
						rows={rows}
						onOpenRow={onOpenRow}
					/>
				);

			case DatabaseViewType.CALENDAR:
				return (
					<CalendarView database={database} rows={rows} onOpenRow={onOpenRow} />
				);

			case DatabaseViewType.LIST:
				return (
					<ListView
						database={database}
						viewDetail={viewDetail}
						rows={rows}
						onOpenRow={onOpenRow}
					/>
				);

			default:
				return null;
		}
	})();

	return (
		<>
			{content}
			<RowDetailSheet
				database={database}
				row={rows.find((row) => row.id === openRow?.id)}
				autoFocusTitle={openRow?.isNew}
				onClose={() => setOpenRow(null)}
			/>
		</>
	);
}
