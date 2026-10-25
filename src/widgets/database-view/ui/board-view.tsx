"use client";

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCorners,
	pointerWithin,
	useDroppable,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanSquare, MoreHorizontal, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
	useAddDatabaseProperty,
	useAddPropertyOption,
	useMoveDatabaseRow,
	useSetDatabaseRowValue,
} from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type Database,
	type DatabaseProperty,
	type DatabaseRow,
	type DatabaseViewDetail,
	type PropertyOption,
} from "@/entities/database/model/database.types";
import {
	PropertyIcon,
	PropertyOptionBadge,
} from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	getRowValueMap,
	getTitleProperty,
	getUniqueName,
	getVisibleProperties,
} from "../lib/view-properties";
import { useQuickAddRow } from "../model/use-quick-add-row";
import { DatabaseViewEmptyGuide } from "./database-view-empty-guide";
import type { OpenRowHandler } from "./database-view-renderer";
import { PropertyOptionMenu } from "./property-option-menu";
import { RowActionsMenu } from "./row-actions-menu";
import { RowPropertySummary } from "./row-property-summary";
import { RenameRowButton, RowTitle } from "./row-title";

const NO_GROUP_ID = "__no_group__";

// Cards stay compact: only people, dates and option badges; the full row is in the side peek.
const CARD_PROPERTY_TYPES = new Set<PropertyType>([
	PropertyType.PERSON,
	PropertyType.DATE,
	PropertyType.STATUS,
	PropertyType.SELECT,
	PropertyType.MULTI_SELECT,
]);

// Prefer the card under the pointer, then its column; keyboard drags have no
// pointer, so fall back to the nearest target.
const collisionDetection: CollisionDetection = (args) => {
	const hits = pointerWithin(args);
	const cardHits = hits.filter(
		(hit) => hit.data?.droppableContainer?.data.current?.type === "card",
	);
	if (cardHits.length) return cardHits;
	return hits.length ? hits : closestCorners(args);
};

interface BoardViewProps {
	database: Database;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];
	onOpenRow: OpenRowHandler;
}

/** Status first (Notion's default board grouping), then Select. */
function getGroupCandidates(database: Database) {
	return [
		...database.properties.filter((p) => p.type === PropertyType.STATUS),
		...database.properties.filter((p) => p.type === PropertyType.SELECT),
	];
}

export function BoardView({
	database,
	viewDetail,
	rows,
	onOpenRow,
}: BoardViewProps) {
	const candidates = getGroupCandidates(database);
	const groupProperty =
		candidates.find((property) => property.id === viewDetail.groupBy) ??
		candidates[0];

	if (!groupProperty) {
		return <BoardSetupGuide database={database} />;
	}

	return (
		<BoardColumns
			key={groupProperty.id}
			database={database}
			viewDetail={viewDetail}
			rows={rows}
			onOpenRow={onOpenRow}
			groupProperty={groupProperty}
		/>
	);
}

function BoardSetupGuide({ database }: { database: Database }) {
	const addPropertyMutation = useAddDatabaseProperty(database.id);
	const names = database.properties.map((property) => property.name);

	const add = (type: PropertyType, base: string) =>
		addPropertyMutation.mutate(
			{ name: getUniqueName(base, names), type },
			{ onError: () => toast.error("Couldn't add property") },
		);

	return (
		<DatabaseViewEmptyGuide
			icon={KanbanSquare}
			title='Board needs a Status or Select property'
			description='Cards are grouped into columns by one of these properties. Add one to start using the board.'
		>
			<button
				type='button'
				disabled={addPropertyMutation.isPending}
				onClick={() => add(PropertyType.STATUS, "Status")}
				className='inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
			>
				<PropertyIcon type={PropertyType.STATUS} />
				Add Status property
			</button>
			<button
				type='button'
				disabled={addPropertyMutation.isPending}
				onClick={() => add(PropertyType.SELECT, "Select")}
				className='inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50'
			>
				<PropertyIcon type={PropertyType.SELECT} />
				Add Select property
			</button>
		</DatabaseViewEmptyGuide>
	);
}

interface BoardColumnsProps extends BoardViewProps {
	groupProperty: DatabaseProperty;
}

function BoardColumns({
	database,
	viewDetail,
	rows,
	onOpenRow,
	groupProperty,
}: BoardColumnsProps) {
	const titleProperty = getTitleProperty(database);
	const cardProperties = getVisibleProperties(database, viewDetail).filter(
		(property) =>
			property.id !== groupProperty.id && CARD_PROPERTY_TYPES.has(property.type),
	);
	const setValueMutation = useSetDatabaseRowValue(database.id);
	const moveRowMutation = useMoveDatabaseRow(database.id);
	const manualOrder = (viewDetail.sorts?.length ?? 0) === 0;
	const { addRow, isPending } = useQuickAddRow(database);
	const [activeRowId, setActiveRowId] = useState<string | null>(null);
	// Card whose name is being edited inline (pencil button or a just-added card).
	const [editingRowId, setEditingRowId] = useState<string | null>(null);

	const sensors = useSensors(
		// Small distance so clicks still focus the title input inside a card;
		// touch needs a long-press so swiping still scrolls the board.
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
		// Space picks a card up; Enter is left free to open it.
		useSensor(KeyboardSensor, {
			keyboardCodes: {
				start: ["Space"],
				cancel: ["Escape"],
				end: ["Space", "Enter"],
			},
		}),
	);

	const options = [...groupProperty.options].sort(
		(a, b) => Number(a.position) - Number(b.position),
	);
	const optionIds = new Set(options.map((option) => option.id));

	const groupOf = (row: DatabaseRow) => {
		const value = getRowValueMap(row).get(groupProperty.id);
		return typeof value === "string" && optionIds.has(value)
			? value
			: NO_GROUP_ID;
	};

	const columns = [
		{ id: NO_GROUP_ID, name: `No ${groupProperty.name}`, color: null },
		...options,
	]
		.map((column) => ({
			...column,
			rows: rows.filter((row) => groupOf(row) === column.id),
		}))
		// Status always has a value for new rows, so "No Status" only shows
		// while older rows still lack one.
		.filter(
			(column) =>
				column.id !== NO_GROUP_ID ||
				groupProperty.type !== PropertyType.STATUS ||
				column.rows.length > 0,
		);

	const activeRow = rows.find((row) => row.id === activeRowId);

	const handleDragStart = (event: DragStartEvent) =>
		setActiveRowId(String(event.active.id));

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		setActiveRowId(null);
		const row = rows.find((item) => item.id === active.id);
		if (!row || !over) return;

		const overId = String(over.id);
		const overRow = rows.find((item) => item.id === overId);
		const targetColumn = overRow ? groupOf(overRow) : overId;
		if (!overRow && !columns.some((column) => column.id === overId)) return;

		const sourceColumn = groupOf(row);
		const sameColumn = sourceColumn === targetColumn;
		const sourceRows = rows.filter((item) => groupOf(item) === sourceColumn);
		const targetRows = rows.filter(
			(item) => item.id !== row.id && groupOf(item) === targetColumn,
		);

		let insertAt = targetRows.length;
		if (overRow && overRow.id !== row.id) {
			const overIndex = targetRows.findIndex((item) => item.id === overRow.id);
			const movingDown =
				sameColumn &&
				sourceRows.indexOf(row) < sourceRows.findIndex((item) => item.id === overRow.id);
			insertAt = movingDown ? overIndex + 1 : overIndex;
		} else if (sameColumn) {
			return;
		}

		const previousRowId = targetRows[insertAt - 1]?.id ?? null;
		const nextRowId = targetRows[insertAt]?.id ?? null;

		if (!sameColumn) {
			setValueMutation.mutate(
				{
					rowId: row.id,
					propertyId: groupProperty.id,
					value: targetColumn === NO_GROUP_ID ? null : targetColumn,
				},
				{ onError: () => toast.error("Couldn't move card") },
			);
		}

		const index = sourceRows.indexOf(row);
		const unchanged =
			sameColumn &&
			(sourceRows[index - 1]?.id ?? null) === previousRowId &&
			(sourceRows[index + 1]?.id ?? null) === nextRowId;

		if (manualOrder && !unchanged) {
			moveRowMutation.mutate(
				{ rowId: row.id, previousRowId, nextRowId },
				{ onError: () => toast.error("Couldn't save card order") },
			);
		}
	};

	return (
		<div className='w-full min-w-0'>
			<div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground'>
				<PropertyIcon type={groupProperty.type} className='size-3.5' />
				<span>
					Grouped by{" "}
					<span className='font-medium text-foreground'>
						{groupProperty.name}
					</span>
				</span>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={collisionDetection}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={() => setActiveRowId(null)}
			>
				<div className='flex items-start gap-2 overflow-x-auto pb-3'>
					{columns.map((column) => (
						<BoardColumn
							key={column.id}
							id={column.id}
							name={column.name}
							color={column.color}
							databaseId={database.id}
							property={groupProperty}
							option={groupProperty.options.find((item) => item.id === column.id)}
							count={column.rows.length}
							isPending={isPending}
							onAdd={async () => {
								const rowId = await addRow([
									{
										propertyId: groupProperty.id,
										value: column.id === NO_GROUP_ID ? undefined : column.id,
									},
								]);
								if (rowId) setEditingRowId(rowId);
							}}
						>
							<SortableContext
								items={column.rows.map((row) => row.id)}
								strategy={verticalListSortingStrategy}
							>
								{column.rows.map((row) => (
									<BoardCard
										key={row.id}
										row={row}
										database={database}
										titleProperty={titleProperty}
										cardProperties={cardProperties}
										onOpen={() => onOpenRow(row.id)}
										editing={row.id === editingRowId}
										onEditingChange={(editing) =>
											setEditingRowId(editing ? row.id : null)
										}
									/>
								))}
							</SortableContext>
						</BoardColumn>
					))}

					<NewGroupColumn
						databaseId={database.id}
						property={groupProperty}
					/>
				</div>

				<DragOverlay>
					{activeRow && (
						<div className='w-[248px] rotate-1 cursor-grabbing rounded-md border bg-card px-2 py-1.5 text-sm font-medium shadow-lg'>
							{(titleProperty &&
								(getRowValueMap(activeRow).get(titleProperty.id) as string)) ||
								"Untitled"}
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

interface BoardColumnProps {
	id: string;
	name: string;
	color: string | null;
	databaseId: string;
	property: DatabaseProperty;
	/** Missing for the "No …" column, which has no option to edit. */
	option?: PropertyOption;
	count: number;
	isPending: boolean;
	onAdd: () => void;
	children: ReactNode;
}

function BoardColumn({
	id,
	name,
	color,
	databaseId,
	property,
	option,
	count,
	isPending,
	onAdd,
	children,
}: BoardColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id });
	const noGroup = id === NO_GROUP_ID;
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<section
			ref={setNodeRef}
			aria-label={`${name} column`}
			style={
				!noGroup && color
					? { backgroundColor: `color-mix(in srgb, ${color} 11%, transparent)` }
					: undefined
			}
			className={cn(
				"group/column flex w-[260px] shrink-0 flex-col gap-1 rounded-lg p-1.5 transition-shadow",
				(noGroup || !color) && "bg-muted/30",
				isOver && "ring-2 ring-inset ring-primary/40",
			)}
		>
			<header className='flex h-7 items-center gap-1.5 px-1'>
				{noGroup || !option ? (
					<span className='truncate text-xs font-medium text-muted-foreground'>
						{name}
					</span>
				) : (
					<Popover open={menuOpen} onOpenChange={setMenuOpen}>
						<PopoverTrigger asChild>
							<button
								type='button'
								aria-label={`Edit ${name}`}
								className='min-w-0 rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
							>
								<PropertyOptionBadge name={name} color={color} />
							</button>
						</PopoverTrigger>
						<PopoverContent align='start' className='w-48 p-1.5'>
							<PropertyOptionMenu
								databaseId={databaseId}
								property={property}
								option={option}
								onDone={() => setMenuOpen(false)}
							/>
						</PopoverContent>
					</Popover>
				)}
				<span className='text-xs tabular-nums text-muted-foreground'>
					{count}
				</span>
				{option && (
					<button
						type='button'
						aria-label={`${name} options`}
						onClick={() => setMenuOpen(true)}
						className='flex size-6 items-center justify-center rounded-sm text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/column:opacity-100 [@media(hover:none)]:opacity-100'
					>
						<MoreHorizontal className='size-3.5' />
					</button>
				)}
				<button
					type='button'
					aria-label={`Add to ${name}`}
					disabled={isPending}
					onClick={onAdd}
					className='ml-auto flex size-6 items-center justify-center rounded-sm text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/column:opacity-100 disabled:opacity-50 [@media(hover:none)]:opacity-100'
				>
					<Plus className='size-3.5' />
				</button>
			</header>

			{children}

			<button
				type='button'
				disabled={isPending}
				onClick={onAdd}
				className='flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:opacity-50'
			>
				<Plus className='size-3.5' />
				New
			</button>
		</section>
	);
}

interface BoardCardProps {
	row: DatabaseRow;
	database: Database;
	titleProperty?: DatabaseProperty;
	cardProperties: DatabaseProperty[];
	onOpen: () => void;
	editing: boolean;
	onEditingChange: (editing: boolean) => void;
}

function BoardCard({
	row,
	database,
	titleProperty,
	cardProperties,
	onOpen,
	editing,
	onEditingChange,
}: BoardCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: row.id,
		disabled: editing,
		data: { type: "card" },
	});
	const values = getRowValueMap(row);
	const title = titleProperty && (values.get(titleProperty.id) as string);

	return (
		<article
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			{...attributes}
			{...listeners}
			aria-roledescription='Draggable card'
			aria-label={title || "Untitled"}
			// A click without dragging (the sensors need 6px / a long-press) opens it.
			onClick={onOpen}
			onKeyDown={(event) => {
				listeners?.onKeyDown?.(event);
				if (event.key === "Enter") onOpen();
			}}
			className={cn(
				"group/row relative flex cursor-grab flex-col gap-1 rounded-md border border-border/70 bg-card px-2 py-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing dark:shadow-none",
				isDragging && "opacity-40",
			)}
		>
			<div className='flex min-w-0 pr-14'>
				<RowTitle
					database={database}
					row={row}
					titleProperty={titleProperty}
					editing={editing}
					onEditingChange={onEditingChange}
				/>
			</div>

			<div>
				<RowPropertySummary
					databaseId={database.id}
					pageId={database.pageId}
					rowId={row.id}
					properties={cardProperties}
					values={values}
					layout='stack'
				/>
			</div>

			{/* Opening the menu must not start a drag (Mouse/Touch sensors). */}
			<div
				className='absolute right-1 top-1 flex items-center gap-0.5 [&_button]:size-6'
				onMouseDown={(event) => event.stopPropagation()}
				onTouchStart={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				{titleProperty && !editing && (
					<RenameRowButton onClick={() => onEditingChange(true)} />
				)}
				<RowActionsMenu databaseId={database.id} rowId={row.id} />
			</div>
		</article>
	);
}

function NewGroupColumn({
	databaseId,
	property,
}: {
	databaseId: string;
	property: DatabaseProperty;
}) {
	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const addOptionMutation = useAddPropertyOption(databaseId, property.id);

	const save = () => {
		const trimmed = name.trim();
		if (!trimmed) {
			setAdding(false);
			return;
		}
		if (
			property.options.some(
				(option) => option.name.toLowerCase() === trimmed.toLowerCase(),
			)
		) {
			toast.error(`"${trimmed}" already exists`);
			return;
		}
		addOptionMutation.mutate(
			{ name: trimmed },
			{
				onSuccess: () => {
					setName("");
					setAdding(false);
				},
				onError: () => toast.error("Couldn't add group"),
			},
		);
	};

	if (!adding) {
		return (
			<button
				type='button'
				onClick={() => setAdding(true)}
				className='flex h-9 w-48 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground'
			>
				<Plus className='size-4' />
				New group
			</button>
		);
	}

	return (
		<div className='w-56 shrink-0 rounded-lg bg-muted/40 p-2'>
			<input
				value={name}
				onChange={(event) => setName(event.target.value)}
				onBlur={save}
				onKeyDown={(event) => {
					if (event.key === "Enter") save();
					if (event.key === "Escape") {
						setName("");
						setAdding(false);
					}
				}}
				disabled={addOptionMutation.isPending}
				placeholder={`New ${property.name} option`}
				aria-label={`New ${property.name} option`}
				autoFocus
				className='h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
			/>
		</div>
	);
}
