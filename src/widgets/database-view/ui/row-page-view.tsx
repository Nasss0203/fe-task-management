"use client";

import { isAxiosError } from "axios";
import { ChevronRight, PanelRightOpen, Table2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
	useDatabase,
	useDatabaseRow,
	useDatabaseRows,
} from "@/entities/database/model/database.queries";
import type { DatabaseRow } from "@/entities/database/model/database.types";
import { usePage } from "@/entities/page/model/page.queries";
import { PageSkeleton } from "@/entities/page/ui/page-surface";
import { PageUnavailable } from "@/entities/page/ui/page-unavailable";

import { getRowValueMap, getTitleProperty } from "../lib/view-properties";
import { RowDetailBody } from "./row-detail-body";
import { rowPageHref } from "./row-detail-sheet";

interface RowPageViewProps {
	pageId: string;
	rowId: string;
}

/** A task opened full page: the side peek's content with room for long writing. */
export function RowPageView({ pageId, rowId }: RowPageViewProps) {
	const router = useRouter();
	const pageQuery = usePage(pageId);
	const rowQuery = useDatabaseRow(rowId);
	const databaseId = rowQuery.data?.databaseId;
	const { data: database, isLoading: isDatabaseLoading } =
		useDatabase(databaseId);
	// The list query (not the single row) so edits made here refresh like in the views.
	const { data: rows = [], isLoading: isRowsLoading } =
		useDatabaseRows(databaseId);

	const failed = pageQuery.error ?? rowQuery.error;
	if (failed) {
		const forbidden =
			isAxiosError(failed) && failed.response?.status === 403;
		return (
			<PageUnavailable reason={forbidden ? "no-access" : "not-found"} />
		);
	}

	const row = rows.find((item) => item.id === rowId);
	const page = pageQuery.data;

	if (
		pageQuery.isLoading ||
		rowQuery.isLoading ||
		isDatabaseLoading ||
		isRowsLoading
	) {
		return <PageSkeleton />;
	}

	// A link to a task of another page, or a task deleted since: nothing to show here.
	if (!page || !database || !row || database.pageId !== pageId) {
		return <PageUnavailable reason='not-found' />;
	}

	const titleProperty = getTitleProperty(database);
	const rowTitle = (target: DatabaseRow) =>
		(titleProperty &&
			(getRowValueMap(target).get(titleProperty.id) as string)) ||
		"Untitled";
	const parentRow = rows.find((item) => item.id === row.parentRowId);
	const openRow = (id: string) => router.push(rowPageHref(pageId, id));

	return (
		<div className='mx-auto flex min-h-[70vh] w-full min-w-0 max-w-5xl flex-col px-12 pb-16 pt-10 md:px-16 lg:px-24'>
			<nav
				aria-label='Breadcrumb'
				className='-ml-1 mb-4 flex min-w-0 flex-wrap items-center gap-1 text-sm text-muted-foreground'
			>
				<Link
					href={`/page/${pageId}`}
					className='flex min-w-0 items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-muted hover:text-foreground'
				>
					<Table2 className='size-4 shrink-0' />
					<span className='truncate'>{database.name}</span>
				</Link>
				{parentRow && (
					<>
						<ChevronRight className='size-3.5 shrink-0' />
						<Link
							href={rowPageHref(pageId, parentRow.id)}
							className='truncate rounded-sm px-1 py-0.5 hover:bg-muted hover:text-foreground'
						>
							{rowTitle(parentRow)}
						</Link>
					</>
				)}
				{/* Back to the database with this task in the side peek. */}
				<Link
					href={`/page/${pageId}?row=${rowId}`}
					aria-label='Open in side peek'
					title='Open in side peek'
					className='ml-1 flex size-6 shrink-0 items-center justify-center rounded-sm hover:bg-muted hover:text-foreground'
				>
					<PanelRightOpen className='size-3.5' />
				</Link>
			</nav>

			<RowDetailBody
				database={database}
				row={row}
				allRows={rows}
				readOnly={!page.canEdit}
				onOpenRow={openRow}
				onDeleted={() => router.push(`/page/${pageId}`)}
				variant='page'
			/>
		</div>
	);
}
