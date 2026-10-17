"use client";

import {
	AlignLeft,
	CheckSquare,
	ChevronRight,
	Code,
	Database,
	FileText,
	Heading,
	Image as ImageIcon,
	Link2,
	Lock,
	Minus,
	Plus,
	Quote,
	Table,
	type LucideIcon,
} from "lucide-react";

import type {
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import {
	BLOCK_TYPE_LABELS,
	describeBlock,
	getDatabaseViewRef,
	PRIVATE_DEMO_BLOCK_TYPES,
	PRIVATE_DEMO_PROPERTY_TYPES,
} from "../../model/demo-visibility";
import { DEMO_MAX_ROWS, type DemoDatabaseRules } from "../../model/listing-form";
import { FieldMessage } from "./listing-primitives";
import type { DemoSelectionApi } from "./use-demo-selection";

const BLOCK_ICONS: Record<string, LucideIcon> = {
	HEADER: Heading,
	TEXT: AlignLeft,
	QUOTE: Quote,
	CODE: Code,
	TODO: CheckSquare,
	IMAGE: ImageIcon,
	VIDEO: ImageIcon,
	FILE: FileText,
	BOOKMARK: Link2,
	EMBED: Link2,
	DATABASE_VIEW: Database,
	TABLE_SIMPLE: Table,
	TOGGLE: ChevronRight,
};

interface ListingDemoVisibilityProps {
	blocks: TemplateBlock[];
	databases: TemplateDatabaseSnapshot[];
	api: DemoSelectionApi;
	disabled?: boolean;
	/** Scrolls the canvas to a block when its name is clicked. */
	onLocate?: (blockId: string) => void;
}

/** Outline of the template: tick exactly what visitors may see. */
export function ListingDemoVisibility({
	blocks,
	databases,
	api,
	disabled,
	onLocate,
}: ListingDemoVisibilityProps) {
	const selectable = blocks.filter((block) => !PRIVATE_DEMO_BLOCK_TYPES.has(block.type));

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex items-center justify-between gap-2'>
				<p className='text-xs text-muted-foreground'>
					<span className='font-medium text-foreground'>{api.selected.size}</span>{" "}
					of {selectable.length} blocks shown
				</p>
				<div className='flex gap-1'>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='h-7 px-2 text-xs'
						disabled={disabled}
						onClick={api.selectAll}
					>
						Select all
					</Button>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='h-7 px-2 text-xs'
						disabled={disabled || api.selected.size === 0}
						onClick={api.clear}
					>
						Clear
					</Button>
				</div>
			</div>
			<FieldMessage message={api.error} />

			{blocks.length === 0 ? (
				<p className='rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
					This version has no content yet.
				</p>
			) : (
				<ul aria-label='Demo content' className='flex flex-col gap-0.5'>
					{orderTree(blocks).map(({ block, depth }) => {
						const parentHidden = Boolean(
							block.parent_block_id && !api.selected.has(block.parent_block_id),
						);
						const isPrivate = PRIVATE_DEMO_BLOCK_TYPES.has(block.type);
						const checked = api.selected.has(block.id);
						const ref = getDatabaseViewRef(block);
						const database = ref
							? databases.find((db) => db.id === ref.databaseId)
							: undefined;
						const Icon = BLOCK_ICONS[block.type] ?? AlignLeft;
						const locked = isPrivate || parentHidden || disabled;

						return (
							<li key={block.id}>
								<div
									className={cn(
										"group flex items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors",
										checked ? "bg-primary/5" : "hover:bg-muted/60",
									)}
									style={{ paddingLeft: `${8 + depth * 16}px` }}
								>
									<input
										type='checkbox'
										aria-label={`Show ${ref ? database?.name ?? "database" : describeBlock(block)}`}
										className='size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed'
										checked={checked}
										disabled={locked}
										onChange={(event) => api.toggle(block.id, event.target.checked)}
									/>
									<Icon
										aria-label={BLOCK_TYPE_LABELS[block.type] ?? block.type}
										className='size-3.5 shrink-0 text-muted-foreground'
									/>
									<button
										type='button'
										onClick={() => onLocate?.(block.id)}
										className={cn(
											"min-w-0 flex-1 truncate text-left",
											checked ? "text-foreground" : "text-muted-foreground",
											locked && "opacity-60",
										)}
									>
										{ref ? database?.name ?? "Database" : describeBlock(block)}
									</button>
									{isPrivate && (
										<span className='inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground'>
											<Lock className='size-3' />
											Private
										</span>
									)}
								</div>

								{ref && checked && database && api.databases[ref.databaseId] && (
									<DatabaseRulesEditor
										database={database}
										rules={api.databases[ref.databaseId]}
										disabled={disabled}
										onChange={(patch) => api.updateDatabase(ref.databaseId, patch)}
										indent={30 + depth * 16}
									/>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

function DatabaseRulesEditor({
	database,
	rules,
	disabled,
	onChange,
	indent,
}: {
	database: TemplateDatabaseSnapshot;
	rules: DemoDatabaseRules;
	disabled?: boolean;
	onChange: (patch: Partial<DemoDatabaseRules>) => void;
	indent: number;
}) {
	const rowValue = rules.row_ids ? rules.row_ids.length : (rules.row_limit ?? 0);
	// Title is always shown and private columns never are, so only the rest toggle.
	const toggleableIds = database.properties
		.filter(
			(property) =>
				property.type !== "TITLE" && !PRIVATE_DEMO_PROPERTY_TYPES.has(property.type),
		)
		.map((property) => property.id);
	const allColumnsOn = toggleableIds.every((id) => rules.property_ids.includes(id));
	const setRows = (value: number) =>
		// Editing switches explicit row picks to "first N rows".
		onChange({
			row_limit: Math.max(0, Math.min(DEMO_MAX_ROWS, Math.min(value, database.rows.length))),
			row_ids: undefined,
		});

	return (
		<div
			className='mb-2 mt-1 flex flex-col gap-3 rounded-md border bg-muted/30 p-3'
			style={{ marginLeft: `${indent}px` }}
		>
			<div className='flex flex-col gap-1.5'>
				<div className='flex items-center justify-between gap-2'>
					<span className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
						Columns
					</span>
					{toggleableIds.length > 0 && (
						<button
							type='button'
							disabled={disabled}
							aria-label={allColumnsOn ? "Clear columns" : "Select all columns"}
							onClick={() =>
								onChange({ property_ids: allColumnsOn ? [] : toggleableIds })
							}
							className='text-xs font-medium text-primary hover:underline disabled:opacity-50'
						>
							{allColumnsOn ? "Clear" : "Select all"}
						</button>
					)}
				</div>
				<div className='flex flex-wrap gap-1.5'>
					{database.properties.map((property) => {
						const isTitle = property.type === "TITLE";
						const isPrivate = PRIVATE_DEMO_PROPERTY_TYPES.has(property.type);
						const on = isTitle || (!isPrivate && rules.property_ids.includes(property.id));
						return (
							<button
								key={property.id}
								type='button'
								aria-pressed={on}
								disabled={isTitle || isPrivate || disabled}
								title={
									isPrivate
										? "People and files are never public"
										: isTitle
											? "The title column is always shown"
											: undefined
								}
								onClick={() =>
									onChange({
										property_ids: on
											? rules.property_ids.filter((id) => id !== property.id)
											: [...rules.property_ids, property.id],
									})
								}
								className={cn(
									"inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs transition-colors disabled:cursor-not-allowed",
									on
										? "border-primary/40 bg-primary/10 text-foreground"
										: "text-muted-foreground hover:bg-muted",
									(isTitle || isPrivate) && "opacity-70",
								)}
							>
								{isPrivate && <Lock className='size-3' />}
								{property.name}
							</button>
						);
					})}
				</div>
			</div>

			<div className='flex items-center justify-between gap-3'>
				<span className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
					Rows
				</span>
				<div className='flex items-center gap-1'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-7'
						aria-label='Fewer rows'
						disabled={disabled || rowValue <= 0}
						onClick={() => setRows(rowValue - 1)}
					>
						<Minus className='size-3.5' />
					</Button>
					<span
						aria-label='Rows shown'
						className='w-14 text-center text-sm tabular-nums'
					>
						{rowValue} / {database.rows.length}
					</span>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-7'
						aria-label='More rows'
						disabled={
							disabled ||
							rowValue >= Math.min(DEMO_MAX_ROWS, database.rows.length)
						}
						onClick={() => setRows(rowValue + 1)}
					>
						<Plus className='size-3.5' />
					</Button>
				</div>
			</div>
		</div>
	);
}

/** Depth-first order with depth, so nested blocks render under their parent. */
function orderTree(blocks: TemplateBlock[]) {
	const ids = new Set(blocks.map((block) => block.id));
	const childrenOf = new Map<string | null, TemplateBlock[]>();
	for (const block of blocks) {
		const parent =
			block.parent_block_id && ids.has(block.parent_block_id)
				? block.parent_block_id
				: null;
		const siblings = childrenOf.get(parent) ?? [];
		siblings.push(block);
		childrenOf.set(parent, siblings);
	}
	const result: { block: TemplateBlock; depth: number }[] = [];
	const visit = (parent: string | null, depth: number) => {
		const siblings = (childrenOf.get(parent) ?? []).sort(
			(a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
		);
		for (const block of siblings) {
			result.push({ block, depth });
			visit(block.id, depth + 1);
		}
	};
	visit(null, 0);
	return result;
}
