"use client";

import {
	DatabaseHeaderCell,
	DatabaseTableSurface,
	DatabaseValueCell,
	getDefaultColumnWidth,
} from "@/entities/database/ui/database-visuals";

import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import { PanelRightOpen, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useReorderViewProperties,
	useSetViewPropertyWidth,
} from "@/entities/database/model/database.mutations";

import {
	PropertyType,
	type Database,
	type DatabaseRow,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";

import { InteractionMode } from "@/shared/model/interaction-mode";
import { AddPropertyPopover } from "./add-property-popover";
import { ColumnResizeHandle } from "./column-resize-handle";
import { RowActionsMenu } from "./row-actions-menu";
import { moveViewProperty } from "../lib/reorder-properties";
import { getRowValueMap, getVisibleProperties } from "../lib/view-properties";
import { useQuickAddRow } from "../model/use-quick-add-row";
import type { OpenRowHandler } from "./database-view-renderer";
import { DatabaseCell } from "./database-cell";
import { DatabasePropertyHeader } from "./database-property-header";
import { SortableHeaderCell } from "./sortable-header-cell";

type DatabaseValueChangeInput = {
	databaseId: string;
	rowId: string;
	propertyId: string;
	value: unknown;
};

interface TableViewProps {
	database: Database;
	viewId: string;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];

	mode?: InteractionMode;
	/** Opens the row side peek (editable mode only). */
	onOpenRow?: OpenRowHandler;

	onDatabaseValueChange?: (input: DatabaseValueChangeInput) => void;
}

export function TableView({
	database,
	viewId,
	viewDetail,
	rows,
	mode = "editable",
	onOpenRow,
	onDatabaseValueChange,
}: TableViewProps) {
	const editable = mode === "editable";
	const setWidthMutation = useSetViewPropertyWidth(database.id, viewId);
	const reorderMutation = useReorderViewProperties(database.id, viewId);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);
	// Widths being dragged or saved; shown until the view detail catches up.
	const { addRow, focusRowId, isPending: isAddingRow } = useQuickAddRow(database);
	const [draftWidths, setDraftWidths] = useState<
		Record<string, number | null>
	>({});

	const viewPropertiesByPropertyId = new Map(
		viewDetail.properties.map((viewProperty) => [
			viewProperty.propertyId,
			viewProperty,
		]),
	);

	const visibleProperties = getVisibleProperties(database, viewDetail);
	const storedWidth = (property: (typeof visibleProperties)[number]) =>
		property.id in draftWidths
			? draftWidths[property.id]
			: (viewPropertiesByPropertyId.get(property.id)?.width ?? null);

	const clearDraft = (propertyId: string) =>
		setDraftWidths((current) => {
			const next = { ...current };
			delete next[propertyId];
			return next;
		});

	const commitWidth = (propertyId: string, width: number | null) => {
		setDraftWidths((current) => ({ ...current, [propertyId]: width }));
		setWidthMutation.mutate(
			{ propertyId, width },
			{
				onSuccess: () => clearDraft(propertyId),
				onError: () => {
					clearDraft(propertyId);
					toast.error("Couldn't save column width");
				},
			},
		);
	};

	const handleColumnDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over) return;
		const next = moveViewProperty(
			viewDetail.properties,
			String(active.id),
			String(over.id),
		);
		if (!next) return;
		reorderMutation.mutate(next, {
			onError: () => toast.error("Couldn't move column"),
		});
	};

	const resizeHandle = (propertyId: string, label: string) => (
		<ColumnResizeHandle
			label={label}
			onResize={(width) =>
				setDraftWidths((current) => ({
					...current,
					[propertyId]: width,
				}))
			}
			onCommit={(width) => commitWidth(propertyId, width)}
		/>
	);

	// When every column has a fixed width, the trailing "+" column takes the
	// leftover space instead of the browser stretching the fixed columns.
	const allColumnsFixed = visibleProperties.every(
		(property) => storedWidth(property) !== null,
	);

	// Columns without a stored width share the free space evenly; the table only
	// scrolls once it is narrower than the per-type minimums.
	const minTableWidth =
		visibleProperties.reduce(
			(total, property) =>
				total +
				(storedWidth(property) ?? getDefaultColumnWidth(property.type)),
			0,
		) + (editable ? 40 : 0);

	return (
		<div className='w-full min-w-0 max-w-full'>
			{/* Chỉ table được scroll ngang */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToHorizontalAxis]}
				onDragEnd={handleColumnDragEnd}
			>
			<DatabaseTableSurface
				tableClassName='w-full'
				tableStyle={{ minWidth: minTableWidth }}
			>
				<colgroup>
					{visibleProperties.map((property) => {
						const width = storedWidth(property);

						return (
							<col
								key={property.id}
								style={width ? { width } : undefined}
							/>
						);
					})}
					{editable && (
						<col style={allColumnsFixed ? undefined : { width: 40 }} />
					)}
				</colgroup>

				<thead>
					<tr>
						{editable ? (
							<SortableContext
								items={visibleProperties.map((property) => property.id)}
								strategy={horizontalListSortingStrategy}
							>
								{visibleProperties.map((property) => (
									<SortableHeaderCell
										key={property.id}
										id={property.id}
										label={property.name}
										resizeHandle={resizeHandle(property.id, property.name)}
									>
										<DatabasePropertyHeader
											databaseId={database.id}
											viewId={viewId}
											property={property}
											mode={mode}
										/>
									</SortableHeaderCell>
								))}
							</SortableContext>
						) : (
							visibleProperties.map((property) => (
								<DatabaseHeaderCell key={property.id}>
									<DatabasePropertyHeader
										databaseId={database.id}
										viewId={viewId}
										property={property}
										mode={mode}
									/>
								</DatabaseHeaderCell>
							))
						)}

						{editable && (
							<DatabaseHeaderCell className='min-w-10 p-0'>
								<AddPropertyPopover
									databaseId={database.id}
									properties={database.properties}
								/>
							</DatabaseHeaderCell>
						)}
					</tr>
				</thead>

				<tbody>
					{rows.map((row) => {
						const valueMap = getRowValueMap(row);

						return (
							<tr
								key={row.id}
								className='group/row transition-colors hover:bg-muted/40'
							>
								{visibleProperties.map((property) => (
									<DatabaseValueCell
										key={property.id}
										// Notion-style "selected cell" ring while editing.
										className='relative focus-within:shadow-[inset_0_0_0_2px_var(--ring)]'
									>
										{onOpenRow &&
											property.type === PropertyType.TITLE && (
												<button
													type='button'
													onClick={() => onOpenRow(row.id)}
													className='absolute right-1 top-1/2 z-10 flex h-6 -translate-y-1/2 items-center gap-1 rounded-sm border bg-background px-1.5 text-xs font-medium text-muted-foreground opacity-0 shadow-xs hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100 [@media(hover:none)]:opacity-100'
												>
													<PanelRightOpen className='size-3.5' />
													Open
												</button>
											)}
										<DatabaseCell
											databaseId={database.id}
											pageId={database.pageId}
											rowId={row.id}
											property={property}
											value={valueMap.get(property.id)}
											mode={mode}
											autoFocus={
												row.id === focusRowId &&
												property.type === PropertyType.TITLE
											}
											onValueChange={
												mode === "preview"
													? onDatabaseValueChange
													: undefined
											}
										/>
									</DatabaseValueCell>
								))}

								{editable && (
									<DatabaseValueCell className='min-w-10'>
										<RowActionsMenu
											databaseId={database.id}
											rowId={row.id}
										/>
									</DatabaseValueCell>
								)}
							</tr>
						);
					})}

					{rows.length === 0 && (
						<tr>
							<td
								colSpan={visibleProperties.length + (editable ? 1 : 0)}
								className='h-16 border-b border-border px-2 text-sm text-muted-foreground'
							>
								No rows yet
							</td>
						</tr>
					)}
				</tbody>
			</DatabaseTableSurface>
			</DndContext>
			{editable && (
				<button
					type='button'
					disabled={isAddingRow}
					onClick={() => addRow()}
					className='flex h-9 w-full items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50'
				>
					<Plus className='size-4' />

					{isAddingRow ? "Adding..." : "New row"}
				</button>
			)}
		</div>
	);
}
