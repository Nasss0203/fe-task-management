"use client";

import { useEffect, useMemo, useState } from "react";

import {
	useDatabase,
	useDatabaseRows,
	useDatabaseView,
	useDatabaseViews,
} from "@/entities/database/model/database.queries";
import { DatabaseViewType } from "@/entities/database/model/database.types";

import { filterRows } from "../lib/filter-rows";
import { sortRows } from "../lib/sort-rows";
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
}

export function DatabaseViewBlock({
	databaseId,
	viewId,
}: DatabaseViewBlockProps) {
	const { data: database, isLoading: isDatabaseLoading } =
		useDatabase(databaseId);

	const { data: views = [], isLoading: isViewsLoading } =
		useDatabaseViews(databaseId);

	const { data: rows = [], isLoading: isRowsLoading } =
		useDatabaseRows(databaseId);

	const [activeViewId, setActiveViewId] = useState(viewId);

	useEffect(() => {
		setActiveViewId(viewId);
	}, [viewId]);

	const activeView =
		views.find((view) => view.id === activeViewId) ?? views[0];

	const { data: activeViewDetail } = useDatabaseView(
		database?.id,
		activeView?.id,
	);

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
		<div className='w-full min-w-0 max-w-full'>
			<DatabaseTitle databaseId={database.id} name={database.name} />
			<div className='mb-1 flex items-center justify-between gap-2'>
				<div className='flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]'>
					{views.map((view) => (
						<DatabaseViewTab
							key={view.id}
							databaseId={database.id}
							view={view}
							active={view.id === activeView.id}
							onSelect={() => setActiveViewId(view.id)}
						/>
					))}

					<AddDatabaseViewPopover
						databaseId={database.id}
						views={views}
						onCreated={(view) => setActiveViewId(view.id)}
					/>
				</div>

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
			</div>

			<DatabaseViewRenderer
				database={database}
				view={activeView}
				viewDetail={activeViewDetail}
				rows={visibleRows}
			/>
		</div>
	);
}
