"use client";

import FullCalendar, {
	type CalendarRef,
	type DateSelectInfo,
	type DropInfo,
	type EventChangeInfo,
	type EventClickInfo,
	type EventDisplayInfo,
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
	CalendarX2,
	ChevronLeft,
	ChevronRight,
	Plus,
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
import { useDatabasePeople } from "@/entities/database/model/database.queries";
import {
	PropertyType,
	type Database,
	type DatabasePerson,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import {
	formatDatabaseDate,
	formatDatabaseValue,
	PropertyIcon,
} from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/shared/ui/popover";
import { TooltipProvider } from "@/shared/ui/tooltip";

import {
	getDateKey,
	getRowValueMap,
	getTitleProperty,
	getUniqueName,
	isEmptyValue,
} from "../lib/view-properties";
import {
	useQuickAddRow,
	type InitialRowValue,
} from "../model/use-quick-add-row";
import { useDatabaseShareToken } from "../model/share-token-context";
import {
	CalendarEventChip,
	StatusDot,
	type CalendarMetaField,
	type CalendarRowMeta,
} from "./calendar-event-chip";
import { DatabaseViewEmptyGuide } from "./database-view-empty-guide";
import { DateCell } from "./date-cell";
import type { OpenRowHandler } from "./database-view-renderer";

const DATE_KEY = "yyyy-MM-dd";
const COLLAPSED_UNDATED_COUNT = 8;
const UNSHOWN_META_TYPES = new Set<PropertyType>([
	PropertyType.TITLE,
	PropertyType.FILE,
	PropertyType.CREATED_BY,
	PropertyType.CREATED_TIME,
	PropertyType.UPDATED_TIME,
]);

type DateValue = { start: string; end?: string | null };

interface CalendarViewProps {
	database: Database;
	rows: DatabaseRow[];
	onOpenRow: OpenRowHandler;
	readOnly?: boolean;
}

export function CalendarView({
	database,
	rows,
	onOpenRow,
	readOnly = false,
}: CalendarViewProps) {
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
		return readOnly ? (
			<DatabaseViewEmptyGuide
				icon={CalendarDays}
				title='Calendar needs a Date property'
				description='Ask someone who can edit this page to add one.'
			/>
		) : (
			<CalendarSetupGuide database={database} />
		);
	}

	return (
		<CalendarMonth
			database={database}
			rows={rows}
			onOpenRow={onOpenRow}
			dateProperty={dateProperty}
			candidates={candidates}
			onDatePropertyChange={setDatePropertyId}
			readOnly={readOnly}
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
	meta: CalendarRowMeta,
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
		extendedProps: { meta },
	};
}

function toMetaField(
	property: DatabaseProperty,
	value: unknown,
	people: DatabasePerson[],
): CalendarMetaField {
	const field = { id: property.id, label: property.name, text: "" };
	const ids = Array.isArray(value) ? value : [value];
	switch (property.type) {
		case PropertyType.SELECT:
		case PropertyType.STATUS:
		case PropertyType.MULTI_SELECT:
			return {
				...field,
				options: property.options.filter((option) => ids.includes(option.id)),
			};
		case PropertyType.PERSON:
			return {
				...field,
				text: people
					.filter((person) => ids.includes(person.user_id))
					.map((person) => person.full_name)
					.join(", "),
			};
		default:
			return { ...field, text: formatDatabaseValue(value) };
	}
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
	readOnly = false,
}: CalendarMonthProps) {
	const calendarRef = useRef<CalendarRef>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const trayRef = useRef<HTMLDivElement>(null);
	const [title, setTitle] = useState("");
	const [trayExpanded, setTrayExpanded] = useState(false);
	const [draggingEvent, setDraggingEvent] = useState(false);
	// "New row" form for the selected dates, anchored to the first selected day.
	const [creator, setCreator] = useState<{
		value: DateValue;
		rect: DOMRect;
	} | null>(null);
	const titleProperty = getTitleProperty(database);
	const setValueMutation = useSetDatabaseRowValue(database.id);
	const { addRow, isPending } = useQuickAddRow(database);
	const statusProperty =
		database.properties.find(
			(property) => property.type === PropertyType.STATUS,
		) ??
		database.properties.find(
			(property) => property.type === PropertyType.SELECT,
		);
	const personProperty = database.properties.find(
		(property) => property.type === PropertyType.PERSON,
	);
	const { data: databasePeople = [] } = useDatabasePeople(
		database.id,
		useDatabaseShareToken(),
		Boolean(personProperty),
	);

	const titleOf = (row: DatabaseRow) =>
		(titleProperty &&
			(getRowValueMap(row).get(titleProperty.id) as string | undefined)) ||
		"Untitled";

	const metaOf = (row: DatabaseRow, value: DateValue | undefined): CalendarRowMeta => {
		const values = getRowValueMap(row);
		const statusId = statusProperty && values.get(statusProperty.id);
		const personIds = personProperty && values.get(personProperty.id);
		return {
			status: statusProperty
				? {
						label: statusProperty.name,
						option:
							statusProperty.options.find((option) => option.id === statusId) ??
							null,
					}
				: null,
			people: personProperty
				? {
						label: personProperty.name,
						list: Array.isArray(personIds)
							? databasePeople.filter((person) =>
									personIds.includes(person.user_id),
								)
							: [],
					}
				: null,
			date: { label: dateProperty.name, text: formatDatabaseDate(value) },
			fields: database.properties
				.filter(
					(property) =>
						!UNSHOWN_META_TYPES.has(property.type) &&
						property.id !== statusProperty?.id &&
						property.id !== personProperty?.id &&
						property.id !== dateProperty.id &&
						!isEmptyValue(values.get(property.id)),
				)
				.map((property) =>
					toMetaField(property, values.get(property.id), databasePeople),
				)
				.filter((field) => field.text || field.options?.length),
		};
	};

	const events: EventInput[] = [];
	const undated: DatabaseRow[] = [];
	for (const row of rows) {
		const value = getRowValueMap(row).get(dateProperty.id) as
			| DateValue
			| undefined;
		if (value && getDateKey(value)) {
			events.push(toEventInput(row, titleOf(row), value, metaOf(row, value)));
		} else {
			undated.push(row);
		}
	}

	// Rows without a date can be dragged from the tray onto a day.
	useEffect(() => {
		if (!trayRef.current || readOnly) return;
		const draggable = new Draggable(trayRef.current, {
			itemSelector: "[data-row-id]",
			eventData: (el) => ({
				title: el.getAttribute("data-title") ?? "",
				create: false,
			}),
		});
		return () => draggable.destroy();
	}, [readOnly]);

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
		setDraggingEvent(false);
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

	const handleCreate = async (name: string, value: DateValue) => {
		if (!creator) return;
		const initial: InitialRowValue[] = [
			{ propertyId: dateProperty.id, value },
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
		<TooltipProvider>
			<div className='w-full min-w-0'>
				<div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
					<div className='flex items-center gap-1'>
						<h3 className='mr-2 min-w-32 text-base font-semibold'>{title}</h3>
						<button
							type='button'
							aria-label='Previous month'
							onClick={() => api()?.prev()}
							className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground'
						>
							<ChevronLeft className='size-4' />
						</button>
						<button
							type='button'
							onClick={() => api()?.today()}
							className='h-7 rounded-md border border-input bg-background px-2.5 text-[13px] font-medium text-foreground shadow-xs hover:bg-accent'
						>
							Today
						</button>
						<button
							type='button'
							aria-label='Next month'
							onClick={() => api()?.next()}
							className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground'
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
									className='rounded-sm bg-transparent py-0.5 font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40'
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
					className={cn(
						"mb-2 flex min-h-9 gap-1.5 rounded-lg border px-1.5 py-1.5 transition-colors",
						trayExpanded ? "items-start" : "items-center",
						draggingEvent
							? "border-dashed border-ring bg-accent-soft"
							: "bg-card",
					)}
				>
					{draggingEvent ? (
						<span className='flex w-full items-center justify-center gap-1.5 text-xs text-ring'>
							<CalendarX2 className='size-3.5' aria-hidden />
							Drag an event here to clear its date
						</span>
					) : undated.length ? (
						<>
							<button
								type='button'
								aria-expanded={trayExpanded}
								onClick={() => setTrayExpanded((open) => !open)}
								className='flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
							>
								<ChevronRight
									className={cn(
										"size-3.5 transition-transform",
										trayExpanded && "rotate-90",
									)}
									aria-hidden
								/>
								<CalendarX2 className='size-3.5' aria-hidden />
								No date
								<span className='rounded bg-muted px-1 text-[11px] tabular-nums'>
									{undated.length}
								</span>
							</button>
							<span
								aria-hidden
								className={cn("h-4 w-px shrink-0 bg-border", trayExpanded && "mt-1")}
							/>
							<div
								className={cn(
									"flex min-w-0 flex-1 items-center gap-1.5",
									trayExpanded ? "flex-wrap" : "overflow-hidden",
								)}
							>
								{(trayExpanded
									? undated
									: undated.slice(0, COLLAPSED_UNDATED_COUNT)
								).map((row) => {
									const meta = metaOf(row, undefined);
									return (
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
												"flex h-6 max-w-48 shrink-0 items-center gap-1.5 rounded-md bg-muted/70 px-2 text-xs text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
												readOnly ? "cursor-pointer" : "cursor-grab",
											)}
										>
											{meta.status && <StatusDot option={meta.status.option} className='size-[7px]' />}
											<span
												className={cn(
													"truncate",
													titleOf(row) === "Untitled" &&
														"italic text-muted-foreground",
												)}
											>
												{titleOf(row)}
											</span>
										</button>
									);
								})}
							</div>
							{!trayExpanded && undated.length > COLLAPSED_UNDATED_COUNT && (
								<button
									type='button'
									onClick={() => setTrayExpanded(true)}
									className='h-6 shrink-0 rounded-md px-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground'
								>
									+{undated.length - COLLAPSED_UNDATED_COUNT} more
								</button>
							)}
						</>
					) : (
						<span className='flex items-center gap-1.5 px-1.5 text-xs text-faint'>
							<CalendarX2 className='size-3.5' aria-hidden />
							{readOnly
								? "No undated rows"
								: "Drag an event here to clear its date"}
						</span>
					)}
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
							eventClass='db-calendar-event'
							eventContent={(info: EventDisplayInfo) => (
								<CalendarEventChip
									title={info.event.title}
									meta={info.event.extendedProps.meta as CalendarRowMeta | undefined}
									isMirror={info.isMirror}
								/>
							)}
							editable={!readOnly}
							droppable={!readOnly}
							selectable={!readOnly}
							unselectAuto={false}
							datesSet={({ view }) => setTitle(view.title)}
							select={handleSelect}
							eventChange={handleEventChange}
							eventDragStart={() => setDraggingEvent(true)}
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
					<PopoverContent
						align='start'
						sideOffset={6}
						className='w-80 overflow-hidden rounded-[10px] p-0'
					>
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
		</TooltipProvider>
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
		<div className='mx-1.5 flex min-h-8 items-center gap-2 rounded-md px-1.5 text-[13px] hover:bg-accent/50'>
			<span className='flex w-24 shrink-0 items-center gap-1.5 text-muted-foreground'>
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
	onCreate: (name: string, value: DateValue) => void;
}

function CreateRowForm({
	dateProperty,
	value,
	isPending,
	onCancel,
	onCreate,
}: CreateRowFormProps) {
	const [name, setName] = useState("");
	const [date, setDate] = useState(value);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		onCreate(name.trim(), date);
	};

	return (
		<form onSubmit={submit}>
			<div className='px-3 pt-3 pb-1'>
				<div className='flex items-center gap-1 text-[11px] font-medium text-faint'>
					<Plus className='size-3' aria-hidden />
					New row
				</div>
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder='Untitled'
					aria-label='Name'
					autoFocus
					className='h-8 w-full bg-transparent text-base font-semibold outline-none placeholder:text-faint'
				/>
			</div>

			<PropertyRow property={dateProperty}>
				<DateCell
					name={dateProperty.name}
					value={date}
					interactive
					onChange={(next) => next && setDate(next)}
				/>
			</PropertyRow>

			<div className='mt-2 flex items-center justify-between gap-2 border-t px-3 py-2'>
				<span className='text-[11px] text-faint'>Enter to create · Esc to cancel</span>
				<div className='flex gap-1.5'>
					<button
						type='button'
						onClick={onCancel}
						className='h-7 rounded-md px-2.5 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isPending}
						className='h-7 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
					>
						{isPending ? "Creating..." : "Create"}
					</button>
				</div>
			</div>
		</form>
	);
}
