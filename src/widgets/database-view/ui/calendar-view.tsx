"use client";

import FullCalendar, {
	type CalendarRef,
	type DateSelectInfo,
	type DropInfo,
	type EventChangeInfo,
	type EventClickInfo,
	type EventDragStopInfo,
	type EventInput,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/react/interaction";
import formaTheme from "@fullcalendar/react/themes/forma";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/forma/theme.css";
import "./calendar-view.css";

import { addDays, format, parseISO } from "date-fns";
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import {
	useEffect,
	useRef,
	useState,
	type FormEvent,
	type ReactNode,
} from "react";
import { toast } from "sonner";

import {
	useAddDatabaseProperty,
	useSetDatabaseRowValue,
} from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type Database,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import {
	PropertyIcon,
	formatDatabaseDate,
} from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/shared/ui/popover";

import {
	getDateKey,
	getRowValueMap,
	getTitleProperty,
	getUniqueName,
} from "../lib/view-properties";
import {
	useQuickAddRow,
	type InitialRowValue,
} from "../model/use-quick-add-row";
import { DatabaseViewEmptyGuide } from "./database-view-empty-guide";
import type { OpenRowHandler } from "./database-view-renderer";

const DATE_KEY = "yyyy-MM-dd";

type DateValue = { start: string; end?: string | null };

interface CalendarViewProps {
	database: Database;
	rows: DatabaseRow[];
	onOpenRow: OpenRowHandler;
}

export function CalendarView({ database, rows, onOpenRow }: CalendarViewProps) {
	const candidates = database.properties.filter(
		(property) => property.type === PropertyType.DATE,
	);
	// shortcut: the backend has no per-view date-property setting, so the choice
	// lives in component state; persist it once views get a config field.
	const [datePropertyId, setDatePropertyId] = useState<string | null>(null);
	const dateProperty =
		candidates.find((property) => property.id === datePropertyId) ??
		candidates[0];

	if (!dateProperty) {
		return <CalendarSetupGuide database={database} />;
	}

	return (
		<CalendarMonth
			database={database}
			rows={rows}
			onOpenRow={onOpenRow}
			dateProperty={dateProperty}
			candidates={candidates}
			onDatePropertyChange={setDatePropertyId}
		/>
	);
}

function CalendarSetupGuide({ database }: { database: Database }) {
	const addPropertyMutation = useAddDatabaseProperty(database.id);

	return (
		<DatabaseViewEmptyGuide
			icon={CalendarDays}
			title='Calendar needs a Date property'
			description='Rows are placed on the calendar by a Date property. Add one to start scheduling.'
		>
			<button
				type='button'
				disabled={addPropertyMutation.isPending}
				onClick={() =>
					addPropertyMutation.mutate(
						{
							name: getUniqueName(
								"Date",
								database.properties.map((property) => property.name),
							),
							type: PropertyType.DATE,
						},
						{ onError: () => toast.error("Couldn't add property") },
					)
				}
				className='inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
			>
				<PropertyIcon type={PropertyType.DATE} />
				Add Date property
			</button>
		</DatabaseViewEmptyGuide>
	);
}

/** FullCalendar all-day ends are exclusive; the database stores inclusive ends. */
function toEventInput(
	row: DatabaseRow,
	title: string,
	value: DateValue,
): EventInput {
	const start = value.start.slice(0, 10);
	const end = value.end ? value.end.slice(0, 10) : null;
	return {
		id: row.id,
		title,
		start,
		end:
			end && end > start
				? format(addDays(parseISO(end), 1), DATE_KEY)
				: undefined,
		allDay: true,
	};
}

/** Inclusive "yyyy-MM-dd" range from FullCalendar's exclusive all-day end. */
function fromExclusiveRange(startStr: string, endStr: string): DateValue {
	const start = startStr.slice(0, 10);
	const end = endStr
		? format(addDays(parseISO(endStr.slice(0, 10)), -1), DATE_KEY)
		: null;
	return end && end > start ? { start, end } : { start };
}

interface CalendarMonthProps extends CalendarViewProps {
	dateProperty: DatabaseProperty;
	candidates: DatabaseProperty[];
	onDatePropertyChange: (propertyId: string) => void;
}

function CalendarMonth({
	database,
	rows,
	onOpenRow,
	dateProperty,
	candidates,
	onDatePropertyChange,
}: CalendarMonthProps) {
	const calendarRef = useRef<CalendarRef>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const trayRef = useRef<HTMLDivElement>(null);
	const [title, setTitle] = useState("");
	// "New row" form for the selected dates, anchored to the first selected day.
	const [creator, setCreator] = useState<{
		value: DateValue;
		rect: DOMRect;
	} | null>(null);
	const titleProperty = getTitleProperty(database);
	const setValueMutation = useSetDatabaseRowValue(database.id);
	const { addRow, isPending } = useQuickAddRow(database);

	const titleOf = (row: DatabaseRow) =>
		(titleProperty &&
			(getRowValueMap(row).get(titleProperty.id) as string | undefined)) ||
		"Untitled";

	const events: EventInput[] = [];
	const undated: DatabaseRow[] = [];
	for (const row of rows) {
		const value = getRowValueMap(row).get(dateProperty.id) as
			| DateValue
			| undefined;
		if (value && getDateKey(value)) {
			events.push(toEventInput(row, titleOf(row), value));
		} else {
			undated.push(row);
		}
	}

	// Rows without a date can be dragged from the tray onto a day.
	useEffect(() => {
		if (!trayRef.current) return;
		const draggable = new Draggable(trayRef.current, {
			itemSelector: "[data-row-id]",
			eventData: (el) => ({
				title: el.getAttribute("data-title") ?? "",
				create: false,
			}),
		});
		return () => draggable.destroy();
	}, []);

	const api = () => calendarRef.current?.getApi();

	const saveDate = (
		rowId: string,
		value: DateValue | null,
		revert?: () => void,
	) =>
		setValueMutation.mutate(
			{ rowId, propertyId: dateProperty.id, value },
			{
				onError: () => {
					revert?.();
					toast.error("Couldn't update date");
				},
			},
		);

	// Fires for both moving and resizing (stretching a range) an event.
	const handleEventChange = ({ event, revert }: EventChangeInfo) =>
		saveDate(event.id, fromExclusiveRange(event.startStr, event.endStr), revert);

	// Dragging an event back onto the "No date" tray clears its date.
	const handleEventDragStop = ({ event, jsEvent }: EventDragStopInfo) => {
		const tray = trayRef.current?.getBoundingClientRect();
		const { clientX, clientY } = jsEvent as MouseEvent;
		if (
			tray &&
			clientX >= tray.left &&
			clientX <= tray.right &&
			clientY >= tray.top &&
			clientY <= tray.bottom
		) {
			saveDate(event.id, null);
		}
	};

	const handleDrop = ({ dateStr, draggedEl }: DropInfo) => {
		const rowId = draggedEl.getAttribute("data-row-id");
		if (rowId) saveDate(rowId, { start: dateStr.slice(0, 10) });
	};

	// Clicking a day (or dragging across days) only opens the form; nothing is
	// created until the user confirms.
	const handleSelect = ({ startStr, endStr }: DateSelectInfo) => {
		const value = fromExclusiveRange(startStr, endStr);
		const cell = gridRef.current?.querySelector(`[data-date="${value.start}"]`);
		if (!cell) return;
		setCreator({ value, rect: cell.getBoundingClientRect() });
	};

	const closeCreator = () => {
		setCreator(null);
		api()?.unselect();
	};

	const handleCreate = async (name: string) => {
		if (!creator) return;
		const initial: InitialRowValue[] = [
			{ propertyId: dateProperty.id, value: creator.value },
		];
		if (name && titleProperty) {
			initial.push({ propertyId: titleProperty.id, value: name });
		}
		const rowId = await addRow(initial);
		if (rowId) closeCreator();
	};

	const handleEventClick = ({ event, jsEvent }: EventClickInfo) => {
		jsEvent.preventDefault();
		closeCreator();
		onOpenRow(event.id);
	};

	return (
		<div className='w-full min-w-0'>
			<div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
				<div className='flex items-center gap-1'>
					<h3 className='mr-2 min-w-32 text-base font-semibold'>{title}</h3>
					<button
						type='button'
						aria-label='Previous month'
						onClick={() => api()?.prev()}
						className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						<ChevronLeft className='size-4' />
					</button>
					<button
						type='button'
						onClick={() => api()?.today()}
						className='h-7 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						Today
					</button>
					<button
						type='button'
						aria-label='Next month'
						onClick={() => api()?.next()}
						className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						<ChevronRight className='size-4' />
					</button>
				</div>

				<div className='flex items-center gap-1 text-xs text-muted-foreground'>
					<PropertyIcon type={PropertyType.DATE} className='size-3.5' />
					{candidates.length > 1 ? (
						<label className='flex items-center gap-1'>
							By
							<select
								value={dateProperty.id}
								onChange={(event) =>
									onDatePropertyChange(event.target.value)
								}
								className='rounded-sm bg-transparent py-0.5 font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40'
							>
								{candidates.map((property) => (
									<option key={property.id} value={property.id}>
										{property.name}
									</option>
								))}
							</select>
						</label>
					) : (
						<span>
							By{" "}
							<span className='font-medium text-foreground'>
								{dateProperty.name}
							</span>
						</span>
					)}
				</div>
			</div>

			<div
				ref={trayRef}
				className='mb-2 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-dashed px-2 py-1.5'
			>
				<span className='mr-1 text-xs text-muted-foreground'>
					{undated.length
						? `No date · ${undated.length}`
						: "Drag an event here to clear its date"}
				</span>
				{undated.map((row) => (
					<button
						key={row.id}
						type='button'
						data-row-id={row.id}
						data-title={titleOf(row)}
						onClick={() => {
							closeCreator();
							onOpenRow(row.id);
						}}
						className={cn(
							"max-w-48 cursor-grab truncate rounded-sm border bg-card px-1.5 py-0.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
							titleOf(row) === "Untitled" && "text-muted-foreground",
						)}
					>
						{titleOf(row)}
					</button>
				))}
			</div>

			<div className='overflow-x-auto'>
				<div ref={gridRef} className='min-w-[640px]'>
					<FullCalendar
						ref={calendarRef}
						plugins={[formaTheme, dayGridPlugin, interactionPlugin]}
						className='db-calendar'
						initialView='dayGridMonth'
						firstDay={1}
						fixedWeekCount={false}
						height='auto'
						dayMaxEvents={3}
						events={events}
						editable
						droppable
						selectable
						unselectAuto={false}
						datesSet={({ view }) => setTitle(view.title)}
						select={handleSelect}
						eventChange={handleEventChange}
						eventDragStop={handleEventDragStop}
						drop={handleDrop}
						eventClick={handleEventClick}
					/>
				</div>
			</div>

			<Popover
				open={Boolean(creator)}
				onOpenChange={(open) => !open && closeCreator()}
			>
				{creator && (
					<PopoverAnchor
						virtualRef={{
							current: { getBoundingClientRect: () => creator.rect },
						}}
					/>
				)}
				<PopoverContent align='start' sideOffset={6} className='w-80 p-0'>
					{creator && (
						<CreateRowForm
							dateProperty={dateProperty}
							value={creator.value}
							isPending={isPending}
							onCancel={closeCreator}
							onCreate={handleCreate}
						/>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}

function PropertyRow({
	property,
	children,
}: {
	property: DatabaseProperty;
	children: ReactNode;
}) {
	return (
		<div className='flex min-h-9 items-center gap-2 px-3 text-sm'>
			<span className='flex w-28 shrink-0 items-center gap-1.5 text-muted-foreground'>
				<PropertyIcon type={property.type} className='size-3.5' />
				<span className='truncate'>{property.name}</span>
			</span>
			<div className='min-w-0 flex-1'>{children}</div>
		</div>
	);
}

interface CreateRowFormProps {
	dateProperty: DatabaseProperty;
	value: DateValue;
	isPending: boolean;
	onCancel: () => void;
	onCreate: (name: string) => void;
}

function CreateRowForm({
	dateProperty,
	value,
	isPending,
	onCancel,
	onCreate,
}: CreateRowFormProps) {
	const [name, setName] = useState("");

	const submit = (event: FormEvent) => {
		event.preventDefault();
		onCreate(name.trim());
	};

	return (
		<form onSubmit={submit}>
			<div className='px-3 pt-3'>
				<div className='text-xs font-medium text-muted-foreground'>New row</div>
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder='Untitled'
					aria-label='Name'
					autoFocus
					className='h-9 w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/60'
				/>
			</div>

			<PropertyRow property={dateProperty}>
				<span className='px-1'>{formatDatabaseDate(value)}</span>
			</PropertyRow>

			<div className='mt-2 flex justify-end gap-2 border-t px-3 py-2'>
				<button
					type='button'
					onClick={onCancel}
					className='h-8 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					Cancel
				</button>
				<button
					type='submit'
					disabled={isPending}
					className='h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
				>
					{isPending ? "Creating..." : "Create"}
				</button>
			</div>
		</form>
	);
}
