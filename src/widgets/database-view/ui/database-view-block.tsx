"use client";

import { useEffect, useState } from "react";

import {
	useDatabase,
	useDatabaseView,
	useDatabaseRows,
	useDatabaseViews,
} from "@/entities/database/model/database.queries";

import { AddDatabaseViewPopover } from "./add-database-view-popover";
import { DatabaseViewRenderer } from "./database-view-renderer";
import { DatabaseViewPropertiesPopover } from "./database-view-properties-popover";
import { DatabaseViewTab } from "./database-view-tab";

interface DatabaseViewBlockProps {
	databaseId: string;
	viewId: string;
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
			<div className='mb-2 flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					{views.map((view) => (
						<DatabaseViewTab
							key={view.id}
							databaseId={database.id}
							view={view}
							active={view.id === activeView.id}
							onSelect={() => setActiveViewId(view.id)}
						/>
					))}

					<AddDatabaseViewPopover databaseId={database.id} />
				</div>

				<div className='flex items-center gap-1'>
					{activeViewDetail && (
						<DatabaseViewPropertiesPopover
							databaseId={database.id}
							viewId={activeView.id}
							properties={database.properties}
							viewProperties={activeViewDetail.properties}
						/>
					)}
					{/* sau này */}
					{/* Filter */}
					{/* Sort */}
					{/* Search */}
					{/* Settings */}
					{/* New */}
				</div>
			</div>

			<DatabaseViewRenderer
				database={database}
				view={activeView}
				viewDetail={activeViewDetail}
				rows={rows}
			/>
		</div>
	);
}
