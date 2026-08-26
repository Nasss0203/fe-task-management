import {
	DatabaseViewType,
	type Database,
	type DatabaseRow,
	type DatabaseView,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";
import { TableView } from "./table-view";

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
	switch (view.type) {
		case DatabaseViewType.TABLE:
			return viewDetail ? (
				<TableView
					database={database}
					viewId={view.id}
					viewDetail={viewDetail}
					rows={rows}
				/>
			) : (
				<div className='p-4 text-sm text-muted-foreground'>
					Loading view...
				</div>
			);

		case DatabaseViewType.BOARD:
			return <div className='p-4'>Board view</div>;

		case DatabaseViewType.CALENDAR:
			return <div className='p-4'>Calendar view</div>;

		case DatabaseViewType.LIST:
			return <div className='p-4'>List view</div>;

		default:
			return null;
	}
}
