"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

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

/**
 * Link thông báo comment task là `/page/:id?row=<rowId>`: mở drawer của row đó.
 * Theo dõi URL nên bấm thông báo khi đang ở sẵn page cũng mở (không cần reload).
 */
function RowLinkOpener({
	rows,
	onOpen,
}: {
	rows: DatabaseRow[];
	onOpen: (rowId: string) => void;
}) {
	const rowId = useSearchParams().get("row");

	useEffect(() => {
		const url = new URL(window.location.href);

		// Đọc lại URL thật: view khác cùng database có thể vừa xử lý link này
		if (!rowId || url.searchParams.get("row") !== rowId) return;
		if (!rows.some((row) => row.id === rowId)) return;

		onOpen(rowId);

		// Bỏ `?row` để đóng drawer không mở lại; bấm lại thông báo thì URL đổi và mở tiếp
		url.searchParams.delete("row");
		window.history.replaceState(window.history.state, "", url);
	}, [rowId, rows, onOpen]);

	return null;
}

/** Opens a row in the side peek; `isNew` focuses its title. */
export type OpenRowHandler = (rowId: string, isNew?: boolean) => void;

interface DatabaseViewRendererProps {
	database: Database;
	view: DatabaseView;
	viewDetail?: DatabaseViewDetail;
	rows: DatabaseRow[];
	readOnly?: boolean;
}

export function DatabaseViewRenderer({
	database,
	view,
	viewDetail,
	rows,
	readOnly = false,
}: DatabaseViewRendererProps) {
	const [openRow, setOpenRow] = useState<{
		id: string;
		isNew: boolean;
		/** Mở từ link thông báo comment: cuộn tới mục Comments. */
		showComments?: boolean;
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
							mode={readOnly ? "readonly" : "editable"}
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
						readOnly={readOnly}
					/>
				);

			case DatabaseViewType.CALENDAR:
				return (
					<CalendarView
						database={database}
						rows={rows}
						onOpenRow={onOpenRow}
						readOnly={readOnly}
					/>
				);

			case DatabaseViewType.LIST:
				return withGroups((groupRows) => (
					<ListView
						database={database}
						viewDetail={viewDetail}
						rows={groupRows}
						onOpenRow={onOpenRow}
						readOnly={readOnly}
					/>
				));

			default:
				return null;
		}
	})();

	return (
		<>
			{content}
			{/* Suspense riêng: useSearchParams không làm cả trang phải render động */}
			<Suspense fallback={null}>
				<RowLinkOpener
					rows={rows}
					onOpen={(id) => setOpenRow({ id, isNew: false, showComments: true })}
				/>
			</Suspense>
			<RowDetailSheet
				database={database}
				row={rows.find((row) => row.id === openRow?.id)}
				autoFocusTitle={openRow?.isNew}
				scrollToComments={openRow?.showComments}
				readOnly={readOnly}
				onClose={() => setOpenRow(null)}
			/>
		</>
	);
}
