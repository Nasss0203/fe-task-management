"use client";

import { useState, type ReactNode } from "react";

import {
	DatabaseViewType,
	type Database,
	type DatabaseRow,
	type DatabaseView,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";
import { GROUPABLE_PROPERTY_TYPES } from "../lib/group-rows";
import { BoardView } from "./board-view";
import { CalendarView } from "./calendar-view";
import { GroupedRows } from "./grouped-rows";
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
	const [openRow, setOpenRow] = useState<{
		id: string;
		isNew: boolean;
	} | null>(null);
	const onOpenRow: OpenRowHandler = (id, isNew = false) =>
		setOpenRow({ id, isNew });

	if (!viewDetail) {
		return (
			<div className='p-4 text-sm text-muted-foreground'>
				Loading view...
			</div>
		);
	}

	const groupProperty = database.properties.find(
		(property) =>
			property.id === viewDetail.groupBy &&
			GROUPABLE_PROPERTY_TYPES.has(property.type),
	);

	const withGroups = (render: (groupRows: DatabaseRow[]) => ReactNode) =>
		groupProperty ? (
			<GroupedRows
				key={groupProperty.id}
				property={groupProperty}
				rows={rows}
			>
				{render}
			</GroupedRows>
		) : (
			render(rows)
		);

	const content = (() => {
		switch (view.type) {
			case DatabaseViewType.TABLE:
				return withGroups((groupRows) => {
					return (
						<TableView
							database={database}
							viewId={view.id}
							viewDetail={viewDetail}
							rows={groupRows}
							onOpenRow={onOpenRow}
						/>
					);
				});

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
					<CalendarView
						database={database}
						rows={rows}
						onOpenRow={onOpenRow}
					/>
				);

			case DatabaseViewType.LIST:
				return withGroups((groupRows) => (
					<ListView
						database={database}
						viewDetail={viewDetail}
						rows={groupRows}
						onOpenRow={onOpenRow}
					/>
				));

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
