"use client";

import { Check, ChevronDown, ListFilter, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useSetViewFilters } from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseViewFilter,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	FILTER_OPERATORS,
	MAX_FILTERS,
	OPERATOR_LABELS,
	VALUELESS_OPERATORS,
} from "../lib/filter-rows";
import { MenuItem, MenuPageHeader, MenuSeparator } from "./menu-item";
import { ToolbarCount, toolbarIconButtonClass } from "./toolbar-button";

const FIELD_CLASS =
	"h-7 min-w-0 rounded-md border border-input bg-transparent px-2 text-xs outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-input/30";

function FieldPicker({
	label,
	value,
	options,
	onChange,
	className,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	className?: string;
}) {
	const current = options.find((option) => option.value === value);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					aria-label={label}
					className={cn(
						FIELD_CLASS,
						"flex items-center justify-between gap-1 text-left",
						className,
					)}
				>
					<span className='truncate'>{current?.label ?? "Select…"}</span>
					<ChevronDown className='size-3 shrink-0 text-muted-foreground' />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='min-w-40'>
				{options.length === 0 ? (
					<div className='px-2 py-1.5 text-xs text-muted-foreground'>
						No options
					</div>
				) : (
					options.map((option) => (
						<DropdownMenuItem
							key={option.value}
							onSelect={() => onChange(option.value)}
							className='text-xs'
						>
							<span className='flex-1 truncate'>{option.label}</span>
							{option.value === value && <Check className='size-3.5' />}
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const OPTION_TYPES: ReadonlySet<PropertyType> = new Set([
	PropertyType.SELECT,
	PropertyType.STATUS,
	PropertyType.MULTI_SELECT,
]);

interface DatabaseViewFilterPopoverProps {
	databaseId: string;
	viewId: string;
	properties: DatabaseProperty[];
	filters: DatabaseViewFilter[];
}

export function DatabaseViewFilterPopover({
	databaseId,
	viewId,
	properties,
	filters,
}: DatabaseViewFilterPopoverProps) {
	const [open, setOpen] = useState(false);
	const [picking, setPicking] = useState(false);
	const filtersMutation = useSetViewFilters(databaseId, viewId);

	const propertyById = new Map(properties.map((property) => [property.id, property]));
	const activeFilters = filters.filter((filter) => propertyById.has(filter.propertyId));
	const candidates = [...properties]
		.filter((property) => FILTER_OPERATORS[property.type])
		.sort((a, b) => Number(a.position) - Number(b.position));

	const save = (next: DatabaseViewFilter[]) =>
		filtersMutation.mutate(next, {
			onError: () => toast.error("Couldn't update filters"),
		});

	const addFilter = (property: DatabaseProperty) => {
		const operator = FILTER_OPERATORS[property.type]![0];
		const value = VALUELESS_OPERATORS.has(operator)
			? null
			: OPTION_TYPES.has(property.type)
				? (property.options[0]?.id ?? null)
				: null;

		save([...activeFilters, { propertyId: property.id, operator, value }]);
		setPicking(false);
	};

	const updateFilter = (index: number, patch: Partial<DatabaseViewFilter>) =>
		save(
			activeFilters.map((filter, current) =>
				current === index ? { ...filter, ...patch } : filter,
			),
		);

	const removeFilter = (index: number) =>
		save(activeFilters.filter((_, current) => current !== index));

	const showPicker = picking || activeFilters.length === 0;

	const picker = (
		<div>
			{activeFilters.length > 0 ? (
				<MenuPageHeader title='Filter by' onBack={() => setPicking(false)} />
			) : (
				<div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
					Filter by
				</div>
			)}
			{candidates.length === 0 ? (
				<p className='px-2 py-2 text-sm text-muted-foreground'>
					No properties can be filtered.
				</p>
			) : (
				<div className='max-h-72 overflow-y-auto'>
					{candidates.map((property) => (
						<button
							key={property.id}
							type='button'
							onClick={() => addFilter(property)}
							className='flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted'
						>
							<PropertyIcon
								type={property.type}
								className='size-3.5 text-muted-foreground'
							/>
							<span className='min-w-0 flex-1 truncate'>{property.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);

	const list = (
		<div>
			<div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
				Show rows where all conditions match
			</div>
			<div className='space-y-1'>
				{activeFilters.map((filter, index) => {
					const property = propertyById.get(filter.propertyId)!;
					const operators = FILTER_OPERATORS[property.type] ?? [];

					return (
						<div
							key={`${filter.propertyId}-${index}`}
							className='flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-muted/60'
						>
							<PropertyIcon
								type={property.type}
								className='size-3.5 shrink-0 text-muted-foreground'
							/>
							<span className='w-20 shrink-0 truncate text-xs' title={property.name}>
								{property.name}
							</span>
							<FieldPicker
								label={`Condition for ${property.name}`}
								value={filter.operator}
								options={operators.map((operator) => ({
									value: operator,
									label: OPERATOR_LABELS[operator] ?? operator,
								}))}
								className='w-28 shrink-0'
								onChange={(operator) => {
									updateFilter(index, {
										operator,
										value: VALUELESS_OPERATORS.has(operator)
											? null
											: VALUELESS_OPERATORS.has(filter.operator)
												? OPTION_TYPES.has(property.type)
													? (property.options[0]?.id ?? null)
													: null
												: filter.value,
									});
								}}
							/>
							{!VALUELESS_OPERATORS.has(filter.operator) && (
								<FilterValueInput
									key={`${filter.operator}-${String(filter.value)}`}
									property={property}
									value={filter.value}
									onChange={(value) => updateFilter(index, { value })}
								/>
							)}
							<button
								type='button'
								onClick={() => removeFilter(index)}
								aria-label={`Remove filter on ${property.name}`}
								className='ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground'
							>
								<X className='size-3.5' />
							</button>
						</div>
					);
				})}
			</div>
			<MenuSeparator />
			<MenuItem
				icon={Plus}
				disabled={activeFilters.length >= MAX_FILTERS}
				onClick={() => setPicking(true)}
			>
				Add filter
			</MenuItem>
			<MenuItem icon={Trash2} destructive onClick={() => save([])}>
				Delete filters
			</MenuItem>
		</div>
	);

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setPicking(false);
			}}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={
						activeFilters.length > 0
							? `Filter (${activeFilters.length} active)`
							: "Filter"
					}
					title='Filter'
					className={toolbarIconButtonClass(activeFilters.length > 0)}
				>
					<ListFilter className='size-4' />
					<ToolbarCount count={activeFilters.length} />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-[26rem] p-1'>
				{showPicker ? picker : list}
			</PopoverContent>
		</Popover>
	);
}

function FilterValueInput({
	property,
	value,
	onChange,
}: {
	property: DatabaseProperty;
	value: DatabaseViewFilter["value"];
	onChange: (value: string | number | null) => void;
}) {
	const [draft, setDraft] = useState(value == null ? "" : String(value));

	if (OPTION_TYPES.has(property.type)) {
		return (
			<FieldPicker
				label={`Value for ${property.name}`}
				value={typeof value === "string" ? value : ""}
				options={[...property.options]
					.sort((a, b) => Number(a.position) - Number(b.position))
					.map((option) => ({ value: option.id, label: option.name }))}
				onChange={(next) => onChange(next || null)}
				className='flex-1'
			/>
		);
	}

	const isNumber = property.type === PropertyType.NUMBER;
	const isDate = property.type === PropertyType.DATE;

	const commit = () => {
		if (isNumber) {
			const parsed = draft.trim() === "" ? null : Number(draft);
			if (parsed === null || Number.isFinite(parsed)) {
				if (parsed !== value) onChange(parsed);
			}
			return;
		}
		if (draft !== (value ?? "")) onChange(draft === "" ? null : draft);
	};

	return (
		<input
			aria-label={`Value for ${property.name}`}
			type={isNumber ? "number" : isDate ? "date" : "text"}
			value={draft}
			placeholder={isNumber ? "Number" : "Value"}
			onChange={(event) => {
				setDraft(event.target.value);
				if (isDate && event.target.value) onChange(event.target.value);
			}}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
			}}
			className={cn(FIELD_CLASS, "min-w-0 flex-1")}
		/>
	);
}
