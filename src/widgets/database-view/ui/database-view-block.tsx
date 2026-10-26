"use client";

import { useEffect, useMemo, useState } from "react";

import {
	useDatabase,
	useDatabaseRows,
	useDatabaseView,
	useDatabaseViews,
	useSharedDatabase,
	useSharedDatabaseRows,
	useSharedDatabaseView,
	useSharedDatabaseViews,
} from "@/entities/database/model/database.queries";
import { DatabaseViewType } from "@/entities/database/model/database.types";

import { filterRows } from "../lib/filter-rows";
import { sortRows } from "../lib/sort-rows";
import { DatabaseShareTokenContext } from "../model/share-token-context";
import { AddDatabaseViewPopover } from "./add-database-view-popover";
import { DatabaseTitle } from "./database-title";
import { DatabaseViewFilterPopover } from "./database-view-filter-popover";
import { DatabaseViewGroupPopover } from "./database-view-group-popover";
import { DatabaseViewPropertiesPopover } from "./database-view-properties-popover";
import { DatabaseViewRenderer } from "./database-view-renderer";
import { DatabaseViewSortPopover } from "./database-view-sort-popover";
import { DatabaseViewTab } from "./database-view-tab";

interface DatabaseViewBlockProps {
	databaseId: string;
	/** Defaults to the first view. */
	viewId?: string;
	/** View-only readers can switch views but change nothing. */
	readOnly?: boolean;
	/** Reads through a share link instead of workspace membership. */
	shareToken?: string;
}

export function DatabaseViewBlock({
	databaseId,
	viewId,
	readOnly = false,
	shareToken,
}: DatabaseViewBlockProps) {
	const shared = Boolean(shareToken);

	const databaseQuery = useDatabase(databaseId, !shared);
	const sharedDatabaseQuery = useSharedDatabase(databaseId, shareToken, shared);
	const { data: database, isLoading: isDatabaseLoading } = shared
		? sharedDatabaseQuery
		: databaseQuery;

	const viewsQuery = useDatabaseViews(databaseId, !shared);
	const sharedViewsQuery = useSharedDatabaseViews(databaseId, shareToken, shared);
	const { data: views = [], isLoading: isViewsLoading } = shared
		? sharedViewsQuery
		: viewsQuery;

	const rowsQuery = useDatabaseRows(databaseId, !shared);
	const sharedRowsQuery = useSharedDatabaseRows(databaseId, shareToken, shared);
	const { data: rows = [], isLoading: isRowsLoading } = shared
		? sharedRowsQuery
		: rowsQuery;

	const [activeViewId, setActiveViewId] = useState(viewId);

	useEffect(() => {
		setActiveViewId(viewId);
	}, [viewId]);

	const activeView =
		views.find((view) => view.id === activeViewId) ?? views[0];

	const viewDetailQuery = useDatabaseView(database?.id, activeView?.id, !shared);
	const sharedViewDetailQuery = useSharedDatabaseView(
		database?.id,
		activeView?.id,
		shareToken,
		shared,
	);
	const { data: activeViewDetail } = shared
		? sharedViewDetailQuery
		: viewDetailQuery;

	const visibleRows = useMemo(() => {
		const properties = database?.properties ?? [];
		return sortRows(
			filterRows(rows, properties, activeViewDetail?.filters),
			properties,
			activeViewDetail?.sorts,
		);
	}, [rows, database?.properties, activeViewDetail?.filters, activeViewDetail?.sorts]);

	if (isDatabaseLoading || isViewsLoading || isRowsLoading) {
		return (
			<div className='text-sm text-muted-foreground'>
				Loading database...
			</div>
		);
	}

	if (!database) {
		return (
			<div className='text-sm text-destructive'>Database not found</div>
		);
	}

	if (!activeView) {
		return (
			<div className='text-sm text-muted-foreground'>
				No database views
			</div>
		);
	}

	return (
		<DatabaseShareTokenContext.Provider value={shareToken}>
		<div className='w-full min-w-0 max-w-full'>
			{readOnly ? (
				<h3 className='mb-1 truncate px-1 py-0.5 text-lg font-semibold'>
					{database.name || "Untitled database"}
				</h3>
			) : (
				<DatabaseTitle databaseId={database.id} name={database.name} />
			)}
			<div className='mb-1 flex items-center justify-between gap-2'>
				<div className='flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]'>
					{views.map((view) => (
						<DatabaseViewTab
							key={view.id}
							databaseId={database.id}
							view={view}
							active={view.id === activeView.id}
							onSelect={() => setActiveViewId(view.id)}
							readOnly={readOnly}
						/>
					))}

					{!readOnly && (
						<AddDatabaseViewPopover
							databaseId={database.id}
							views={views}
							onCreated={(view) => setActiveViewId(view.id)}
						/>
					)}
				</div>

				{!readOnly && (
				<div className='flex shrink-0 items-center gap-1'>
					{activeViewDetail && (
						<DatabaseViewFilterPopover
							databaseId={database.id}
							viewId={activeView.id}
							properties={database.properties}
							filters={activeViewDetail.filters ?? []}
						/>
					)}
					{activeViewDetail && (
						<DatabaseViewSortPopover
							databaseId={database.id}
							viewId={activeView.id}
							properties={database.properties}
							sorts={activeViewDetail.sorts ?? []}
						/>
					)}
					{activeViewDetail &&
						activeView.type !== DatabaseViewType.CALENDAR && (
							<DatabaseViewGroupPopover
								databaseId={database.id}
								viewId={activeView.id}
								viewType={activeView.type}
								properties={database.properties}
								groupBy={activeViewDetail.groupBy ?? null}
							/>
						)}
					{activeViewDetail && (
						<DatabaseViewPropertiesPopover
							databaseId={database.id}
							view={activeView}
							properties={database.properties}
							viewProperties={activeViewDetail.properties}
						/>
					)}
					{/* sau này */}
					{/* Search */}
					{/* Settings */}
					{/* New */}
				</div>
				)}
			</div>

			<DatabaseViewRenderer
				database={database}
				view={activeView}
				viewDetail={activeViewDetail}
				rows={visibleRows}
				readOnly={readOnly}
			/>
		</div>
		</DatabaseShareTokenContext.Provider>
	);
}
