"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";

import {
	AlertCircle,
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	ChevronRight,
	Database as DatabaseIcon,
	ListChecks,
	Loader2,
	Pencil,
	Plus,
	Trash2,
	Undo2,
} from "lucide-react";
import { toast } from "sonner";

import type {
	AiGeneration,
	AiModificationBlockInput,
	AiModificationOperation,
	AiModificationPlan,
} from "@/entities/ai-assistant/model/ai-assistant.types";

import { useUndoAiModificationPlan } from "@/entities/ai-assistant/model/ai-assistant.mutations";
import { useDatabase } from "@/entities/database/model/database.queries";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { AiDraftStatusBadge, type AiDraftStatus } from "./AiDraftStatusBadge";
import { getAiChatErrorMessage } from "../model/ai-chat-error";
import { formatPlanCounts, pluralize } from "../model/ai-plan-counts";
import { useAiChatStore } from "../model/use-ai-chat-store";

interface AiModificationPlanPreviewProps {
	generation: AiGeneration;
	previewOnly?: boolean;
	disabled?: boolean;
	onConfirm: (generationId: string, pageId: string) => void;
	onDiscard: (generationId: string) => void;
}

function getModificationPlan(
	generation: AiGeneration,
): AiModificationPlan | null {
	const output = generation.output_data;

	if (!output || typeof output !== "object" || Array.isArray(output)) {
		return null;
	}

	const candidate = output as Record<string, unknown>;

	if (
		candidate.type !== "AI_MODIFICATION_PLAN" ||
		candidate.schemaVersion !== 1 ||
		typeof candidate.pageId !== "string" ||
		typeof candidate.summary !== "string" ||
		!Array.isArray(candidate.operations)
	) {
		return null;
	}

	if (
		candidate.status !== "PLAN_READY" &&
		candidate.status !== "NEED_MORE_CONTEXT"
	) {
		return null;
	}

	if (
		candidate.status === "NEED_MORE_CONTEXT" &&
		!Array.isArray(candidate.contextRequests)
	) {
		return null;
	}

	return output as AiModificationPlan;
}

function renderFieldValue(value: unknown): ReactNode {
	if (value === null || value === undefined) {
		return <span className='italic text-muted-foreground'>Empty</span>;
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "string") {
		return value.length > 0 ? (
			<span className='whitespace-pre-wrap break-words'>{value}</span>
		) : (
			<span className='italic text-muted-foreground'>Empty</span>
		);
	}

	if (typeof value === "object") {
		return (
			<pre className='max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground'>
				{JSON.stringify(value, null, 2)}
			</pre>
		);
	}

	return String(value);
}

/**
 * Display plan fields.
 *
 * propertyNames is optional:
 * - INSERT_BLOCKS: use original content keys.
 * - CREATE_DATABASE_ROWS: map propertyId to propertyName.
 */
function PlanDataFields({
	values,
	propertyNames,
	emptyMessage = "No fields provided.",
}: {
	values: Record<string, unknown>;
	propertyNames?: ReadonlyMap<string, string>;
	emptyMessage?: string;
}) {
	const entries = Object.entries(values);

	if (entries.length === 0) {
		return (
			<p className='text-xs italic text-muted-foreground'>
				{emptyMessage}
			</p>
		);
	}

	return (
		<dl className='divide-y divide-border/40'>
			{entries.map(([key, value]) => {
				const displayName = propertyNames?.get(key) ?? key;

				return (
					<div
						key={key}
						className='grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3 py-1.5 first:pt-0 last:pb-0'
					>
						<dt
							className='min-w-0 truncate text-xs text-muted-foreground'
							title={displayName !== key ? key : displayName}
						>
							{displayName}
						</dt>

						<dd className='min-w-0 text-xs leading-relaxed text-foreground'>
							{renderFieldValue(value)}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}

const BLOCK_TYPE_LABELS: Record<AiModificationBlockInput["type"], string> = {
	TEXT: "Text",
	HEADER: "Heading",
	QUOTE: "Quote",
	TODO: "To-do",
	TOGGLE: "Toggle",
};

function textOf(content: unknown): string | null {
	return content &&
		typeof content === "object" &&
		"text" in content &&
		typeof content.text === "string"
		? content.text
		: null;
}

function truncate(text: string, max = 40): string {
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Names an existing block by its text, since raw IDs mean nothing to users. */
function ExistingBlockName({
	pageId,
	blockId,
}: {
	pageId: string;
	blockId: string;
}) {
	const { data: blocks } = usePageBlocks(pageId);
	const text = textOf(blocks?.find((block) => block.id === blockId)?.content);

	return text?.trim() ? (
		<span className='font-medium text-foreground' title={text}>
			“{truncate(text.trim())}”
		</span>
	) : (
		<span title={blockId}>an existing block</span>
	);
}

function InsertLocation({
	pageId,
	operation,
}: {
	pageId: string;
	operation: Extract<AiModificationOperation, { type: "INSERT_BLOCKS" }>;
}) {
	const { parentBlockId, afterBlockId } = operation;
	const after = afterBlockId && (
		<ExistingBlockName pageId={pageId} blockId={afterBlockId} />
	);
	const parent = parentBlockId && (
		<ExistingBlockName pageId={pageId} blockId={parentBlockId} />
	);

	// null afterBlockId appends to the end of the sibling group (see backend plan types).
	if (parent)
		return after ? (
			<>Inside {parent}, after {after}</>
		) : (
			<>At the end of {parent}</>
		);

	return after ? <>After {after}</> : <>At the end of the page</>;
}

export function BlockContentPreview({ block }: { block: AiModificationBlockInput }) {
	const text = textOf(block.content);

	if (text === null) {
		return (
			<PlanDataFields
				values={block.content}
				emptyMessage='This block has no content fields.'
			/>
		);
	}

	const body = text.trim() ? (
		<span className='whitespace-pre-wrap break-words'>{text}</span>
	) : (
		<span className='italic text-muted-foreground'>Empty block</span>
	);

	switch (block.type) {
		case "HEADER": {
			const level = (block as { styleConfig?: { level?: unknown } })
				.styleConfig?.level;

			return (
				<p
					className={cn(
						"font-semibold leading-snug text-foreground",
						level === 1
							? "text-lg"
							: level === 3
								? "text-sm"
								: "text-base",
					)}
				>
					{body}
				</p>
			);
		}

		case "TODO": {
			const checked = block.content.checked === true;

			return (
				<div className='flex items-start gap-2 text-sm'>
					<TodoCheckbox checked={checked} />

					<span className='sr-only'>
						{checked ? "Checked:" : "Not checked:"}
					</span>

					<span
						className={cn(
							"min-w-0 leading-relaxed",
							checked
								? "text-muted-foreground line-through"
								: "text-foreground",
						)}
					>
						{body}
					</span>
				</div>
			);
		}

		case "QUOTE":
			return (
				<p className='border-l-2 border-foreground/30 pl-3 text-sm leading-relaxed text-foreground'>
					{body}
				</p>
			);

		case "TOGGLE":
			return (
				<div className='flex items-start gap-1.5 text-sm text-foreground'>
					<ChevronRight
						className='mt-0.5 size-4 shrink-0 text-muted-foreground'
						aria-hidden='true'
					/>
					<span className='min-w-0 leading-relaxed'>{body}</span>
				</div>
			);

		default:
			return (
				<p className='text-sm leading-relaxed text-foreground'>{body}</p>
			);
	}
}

function TodoCheckbox({ checked }: { checked: boolean }) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
				checked
					? "border-primary bg-primary text-primary-foreground"
					: "border-muted-foreground/50",
			)}
		>
			{checked && <Check className='size-3' />}
		</span>
	);
}

function OperationSection({
	icon,
	title,
	subtitle,
	defaultOpen,
	children,
}: {
	icon: ReactNode;
	title: ReactNode;
	subtitle: ReactNode;
	defaultOpen: boolean;
	children: ReactNode;
}) {
	return (
		<details
			open={defaultOpen}
			className='group overflow-hidden rounded-lg border border-border/60'
		>
			<summary className='flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 [&::-webkit-details-marker]:hidden'>
				<span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
					{icon}
				</span>

				<span className='min-w-0 flex-1'>
					<span className='block text-xs font-medium text-foreground'>
						{title}
					</span>
					<span className='mt-0.5 block truncate text-[11px] text-muted-foreground'>
						{subtitle}
					</span>
				</span>

				<ChevronDown className='size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180' />
			</summary>

			<div className='border-t border-border/50 bg-background/40'>
				{children}
			</div>
		</details>
	);
}

/** INSERT_BLOCKS: blocks render roughly as they will appear on the page. */
function InsertBlocksPreview({
	pageId,
	operation,
	defaultOpen,
}: {
	pageId: string;
	operation: Extract<AiModificationOperation, { type: "INSERT_BLOCKS" }>;
	defaultOpen: boolean;
}) {
	return (
		<OperationSection
			icon={<Plus className='size-3.5' />}
			title={`Add ${pluralize(operation.blocks.length, "block", "blocks")}`}
			subtitle={<InsertLocation pageId={pageId} operation={operation} />}
			defaultOpen={defaultOpen}
		>
			<ul className='divide-y divide-border/40'>
				{operation.blocks.map((block, blockIndex) => (
					<li
						key={blockIndex}
						className='flex items-start gap-2.5 px-3 py-2.5'
					>
						<span
							aria-hidden='true'
							className='mt-0.5 w-3 shrink-0 text-center font-mono text-xs font-semibold text-success'
						>
							+
						</span>

						<div className='min-w-0 flex-1'>
							<BlockContentPreview block={block} />
						</div>

						<span className='mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80'>
							{BLOCK_TYPE_LABELS[block.type] ?? block.type}
						</span>
					</li>
				))}
			</ul>
		</OperationSection>
	);
}

/**
 * CREATE_DATABASE_ROWS
 *
 * Fetches database metadata and maps property IDs
 * to their user-facing names.
 */
function CreateDatabaseRowsPreview({
	operation,
	defaultOpen,
}: {
	operation: Extract<
		AiModificationOperation,
		{ type: "CREATE_DATABASE_ROWS" }
	>;
	defaultOpen: boolean;
}) {
	const {
		data: database,
		isPending: isDatabaseLoading,
		isError: isDatabaseError,
	} = useDatabase(operation.databaseId);

	const propertyNames = new Map<string, string>(
		database?.properties.map((property) => [property.id, property.name]) ??
			[],
	);

	return (
		<OperationSection
			icon={<DatabaseIcon className='size-3.5' />}
			title={`Add ${pluralize(operation.rows.length, "row", "rows")}`}
			subtitle={
				database?.name ? (
					<>
						To database{" "}
						<span className='font-medium text-foreground'>
							{database.name}
						</span>
					</>
				) : isDatabaseLoading ? (
					"Loading database..."
				) : (
					<span title={operation.databaseId}>To a database</span>
				)
			}
			defaultOpen={defaultOpen}
		>
			{isDatabaseError && (
				<div className='flex items-start gap-2 border-b border-border/40 bg-destructive/5 px-3 py-2'>
					<AlertCircle className='mt-0.5 size-3.5 shrink-0 text-destructive' />

					<p className='text-[11px] leading-relaxed text-muted-foreground'>
						Unable to load database metadata. Property IDs are
						shown instead of names. Review the proposed values
						carefully.
					</p>
				</div>
			)}

			{isDatabaseLoading && (
				<p className='flex items-center gap-2 border-b border-border/40 px-3 py-2 text-[11px] text-muted-foreground'>
					<Loader2 className='size-3.5 animate-spin' />
					Loading database properties...
				</p>
			)}

			<ul className='divide-y divide-border/40'>
				{operation.rows.map((row, rowIndex) => (
					<li key={rowIndex} className='flex items-start gap-2.5 px-3 py-2.5'>
						<span
							aria-hidden='true'
							className='mt-0.5 w-3 shrink-0 text-center font-mono text-xs font-semibold text-success'
						>
							+
						</span>

						<div className='min-w-0 flex-1'>
							<p className='mb-1.5 text-[11px] font-medium text-muted-foreground'>
								Row {rowIndex + 1}
							</p>

							<PlanDataFields
								values={row.values}
								propertyNames={propertyNames}
								emptyMessage='This row has no property values.'
							/>
						</div>
					</li>
				))}
			</ul>
		</OperationSection>
	);
}

type BlockDeleteOperation = Extract<
	AiModificationOperation,
	{ type: "DELETE_BLOCK" }
>;

const LISTED_NESTED_BLOCKS = 5;
// The server refuses an undo after this (kế hoạch xoá block, D5).
const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The texts of the blocks nested in a deleted block, read from the page. */
function NestedBlocks({
	pageId,
	operation,
}: {
	pageId: string;
	operation: BlockDeleteOperation;
}) {
	const { data: blocks } = usePageBlocks(pageId);
	const nested: string[] = [];
	const pending = [operation.blockId];
	while (pending.length > 0) {
		const parentId = pending.shift();
		for (const block of blocks ?? []) {
			if (block.parent_block_id === parentId) {
				nested.push(textOf(block.content)?.trim() || "Untitled block");
				pending.push(block.id);
			}
		}
	}

	return (
		<div className='mt-1 text-xs text-muted-foreground'>
			<p>+ {pluralize(operation.childCount, "nested block", "nested blocks")}</p>
			{nested.length > 0 && (
				<ul className='mt-0.5 list-inside list-disc'>
					{nested.slice(0, LISTED_NESTED_BLOCKS).map((text, index) => (
						<li key={index} className='truncate'>
							{text}
						</li>
					))}
					{nested.length > LISTED_NESTED_BLOCKS && (
						<li>and {nested.length - LISTED_NESTED_BLOCKS} more</li>
					)}
				</ul>
			)}
		</div>
	);
}

/** DELETE_BLOCK: the block and everything nested in it are removed. */
function BlockDeletePreview({
	pageId,
	operations,
	defaultOpen,
}: {
	pageId: string;
	operations: BlockDeleteOperation[];
	defaultOpen: boolean;
}) {
	return (
		<OperationSection
			icon={<Trash2 className='size-3.5 text-destructive' />}
			title={`Delete ${pluralize(operations.length, "block", "blocks")}`}
			subtitle='Removed from the page; can be undone for 24 hours'
			defaultOpen={defaultOpen}
		>
			<ul className='divide-y divide-border/40'>
				{operations.map((operation) => (
					<li
						key={operation.blockId}
						className='flex items-start gap-2.5 px-3 py-2.5'
					>
						<span
							aria-hidden='true'
							className='mt-0.5 w-3 shrink-0 text-center font-mono text-xs font-semibold text-destructive'
						>
							−
						</span>

						<div className='min-w-0 flex-1 text-sm leading-relaxed'>
							<del className='block whitespace-pre-wrap break-words text-muted-foreground'>
								{operation.text}
							</del>
							{operation.childCount > 0 && (
								<NestedBlocks pageId={pageId} operation={operation} />
							)}
						</div>

						<span className='mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-wide text-destructive/80'>
							Delete
						</span>
					</li>
				))}
			</ul>
		</OperationSection>
	);
}

/** Restores what an applied AI delete removed (kế hoạch xoá block, D5). */
function UndoDeleteFooter({
	generationId,
	pageId,
	appliedAt,
}: {
	generationId: string;
	pageId: string;
	appliedAt: string;
}) {
	const undo = useUndoAiModificationPlan();
	// Read the clock once; the server enforces the window anyway.
	const [openedAt] = useState(() => Date.now());
	if (!(openedAt - Date.parse(appliedAt) < UNDO_WINDOW_MS)) return null;

	return (
		<div className='flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/30 px-4 py-2.5'>
			<p className='text-xs text-muted-foreground'>
				Deleted blocks can be restored for 24 hours.
			</p>
			<Button
				type='button'
				size='sm'
				variant='outline'
				disabled={undo.isPending || undo.isSuccess}
				onClick={() =>
					undo.mutate(
						{ generationId, pageId },
						{
							onSuccess: ({ restoredBlockIds }) =>
								restoredBlockIds.length > 0
									? toast.success(
										`Restored ${pluralize(restoredBlockIds.length, "block", "blocks")}.`,
									)
									: toast.info("Nothing to restore: these blocks are already back."),
							onError: (error) =>
								toast.error(getAiChatErrorMessage(error, "Unable to undo these changes.")),
						},
					)
				}
			>
				{undo.isPending ? (
					<Loader2 className='size-4 animate-spin' />
				) : (
					<Undo2 className='size-4' />
				)}
				{undo.isSuccess ? "Undone" : "Undo"}
			</Button>
		</div>
	);
}

type BlockTextOperation = Extract<
	AiModificationOperation,
	{ type: "SET_BLOCK_TEXT" }
>;

/** SET_BLOCK_TEXT: only the text of an existing block changes. */
function BlockTextPreview({
	operations,
	defaultOpen,
}: {
	operations: BlockTextOperation[];
	defaultOpen: boolean;
}) {
	return (
		<OperationSection
			icon={<Pencil className='size-3.5' />}
			title={`Edit ${pluralize(operations.length, "block", "blocks")}`}
			subtitle='Only the text changes'
			defaultOpen={defaultOpen}
		>
			<ul className='divide-y divide-border/40'>
				{operations.map((operation) => (
					<li
						key={operation.blockId}
						className='flex items-start gap-2.5 px-3 py-2.5'
					>
						<div className='min-w-0 flex-1 space-y-1 text-sm leading-relaxed'>
							<del className='block whitespace-pre-wrap break-words text-muted-foreground'>
								{operation.oldText}
							</del>
							<ins className='block whitespace-pre-wrap break-words text-foreground no-underline'>
								{operation.newText}
							</ins>
						</div>

						<span className='mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80'>
							Edit
						</span>
					</li>
				))}
			</ul>
		</OperationSection>
	);
}

type TodoTickOperation = Extract<
	AiModificationOperation,
	{ type: "SET_TODO_CHECKED" }
>;

/** SET_TODO_CHECKED: only the checkbox of an existing to-do changes. */
function TodoTicksPreview({
	operations,
	defaultOpen,
}: {
	operations: TodoTickOperation[];
	defaultOpen: boolean;
}) {
	return (
		<OperationSection
			icon={<ListChecks className='size-3.5' />}
			title={`Update ${pluralize(operations.length, "to-do", "to-dos")}`}
			subtitle='Only the checkbox changes'
			defaultOpen={defaultOpen}
		>
			<ul className='divide-y divide-border/40'>
				{operations.map((operation) => (
					<li
						key={operation.blockId}
						className='flex items-start gap-2.5 px-3 py-2.5'
					>
						<span
							role='img'
							aria-label={
								operation.checked
									? "Not done → Done"
									: "Done → Not done"
							}
							className='flex shrink-0 items-center gap-1 text-muted-foreground'
						>
							<TodoCheckbox checked={!operation.checked} />
							<ArrowRight className='mt-0.5 size-3' />
							<TodoCheckbox checked={operation.checked} />
						</span>

						<span
							className={cn(
								"min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed",
								operation.checked
									? "text-muted-foreground line-through"
									: "text-foreground",
							)}
						>
							{operation.text}
						</span>

						<span className='mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80'>
							{operation.checked ? "Check" : "Uncheck"}
						</span>
					</li>
				))}
			</ul>
		</OperationSection>
	);
}

function getDraftStatus(
	generation: AiGeneration,
	plan: AiModificationPlan,
	previewOnly: boolean,
): AiDraftStatus {
	switch (generation.status) {
		case "APPLIED":
			return "applied";
		case "DISCARDED":
			return "discarded";
		case "FAILED":
			return "failed";
		case "PROCESSING":
			return "processing";
	}

	if (plan.status === "NEED_MORE_CONTEXT") return "needs-info";

	return previewOnly ? "preview" : "review";
}

export function AiModificationPlanPreview({
	generation,
	previewOnly = false,
	disabled = false,
	onConfirm,
	onDiscard,
}: AiModificationPlanPreviewProps) {
	const isStale = useAiChatStore((state) => Boolean(state.staleGenerationIds[generation.id]));

	if (generation.capability !== "GENERATE_PAGE_MODIFICATION_PLAN") {
		return null;
	}

	const plan = getModificationPlan(generation);

	if (!plan) {
		return null;
	}

	const isCompleted = generation.status === "COMPLETED";
	const status = isCompleted && isStale ? "stale" : getDraftStatus(generation, plan, previewOnly);
	// Changes awaiting a decision stay expanded; settled drafts collapse.
	const expandOperations = isCompleted;

	const operations: AiModificationOperation[] = plan.operations;
	const todoTicks = operations.filter(
		(operation): operation is TodoTickOperation =>
			operation.type === "SET_TODO_CHECKED",
	);

	const textEdits = operations.filter(
		(operation): operation is BlockTextOperation =>
			operation.type === "SET_BLOCK_TEXT",
	);

	const blockDeletes = operations.filter(
		(operation): operation is BlockDeleteOperation =>
			operation.type === "DELETE_BLOCK",
	);
	const canUndo =
		generation.status === "APPLIED" &&
		blockDeletes.length > 0 &&
		Boolean(generation.applied_at);

	const counts = formatPlanCounts(operations);

	return (
		<div
			className={cn(
				"min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card",
				status === "discarded" && "opacity-75",
			)}
		>
			{/* Header */}
			<div className='flex items-start gap-3 p-4'>
				<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
					<ListChecks className='size-4' />
				</div>

				<div className='min-w-0 flex-1'>
					<div className='flex items-center justify-between gap-2'>
						<p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
							Page modification plan
						</p>

						<AiDraftStatusBadge status={status} />
					</div>

					<p className='mt-1 whitespace-pre-wrap break-words text-sm font-medium leading-snug text-foreground'>
						{plan.summary}
					</p>

					<div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
						{plan.status === "PLAN_READY" && (
							<p className='text-xs text-muted-foreground'>{counts}</p>
						)}

						<Link
							href={`/page/${plan.pageId}`}
							className='inline-flex items-center gap-0.5 rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
						>
							Open page
							<ArrowUpRight className='size-3.5' />
						</Link>
					</div>
				</div>
			</div>

			{/* Proposed changes */}
			{plan.status === "PLAN_READY" && (
				<div className='space-y-2 px-4 pb-4'>
					<p className='text-xs font-medium text-muted-foreground'>
						Proposed changes
					</p>

					{plan.operations.map((operation, index) =>
						operation.type === "INSERT_BLOCKS" ? (
							<InsertBlocksPreview
								key={index}
								pageId={plan.pageId}
								operation={operation}
								defaultOpen={expandOperations}
							/>
						) : operation.type === "CREATE_DATABASE_ROWS" ? (
							<CreateDatabaseRowsPreview
								key={index}
								operation={operation}
								defaultOpen={expandOperations}
							/>
						) : null,
					)}

					{blockDeletes.length > 0 && (
						<BlockDeletePreview
							pageId={plan.pageId}
							operations={blockDeletes}
							defaultOpen={expandOperations}
						/>
					)}

					{textEdits.length > 0 && (
						<BlockTextPreview
							operations={textEdits}
							defaultOpen={expandOperations}
						/>
					)}

					{todoTicks.length > 0 && (
						<TodoTicksPreview
							operations={todoTicks}
							defaultOpen={expandOperations}
						/>
					)}

					{plan.operations.length === 0 && (
						<p className='rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground'>
							No operations were proposed.
						</p>
					)}
				</div>
			)}

			{/* More context required */}
			{plan.status === "NEED_MORE_CONTEXT" && (
				<div className='px-4 pb-4'>
					<div className='space-y-3 rounded-lg border border-warning/30 bg-warning/5 p-3'>
						<p className='flex items-center gap-2 text-xs font-medium text-foreground'>
							<AlertCircle className='size-4 text-warning' />
							AI needs more information to continue
						</p>

						{plan.contextRequests.map((request, index) => (
							<div
								key={`${request.reason}-${index}`}
								className='space-y-1 border-t border-warning/20 pt-2 first:border-t-0 first:pt-0'
							>
								<p className='text-xs leading-relaxed text-muted-foreground'>
									{request.description}
								</p>

								{request.question && (
									<p className='text-sm leading-relaxed text-foreground'>
										{request.question}
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Footer */}
			{isCompleted && !previewOnly && (
				<div className='flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/30 px-4 py-2.5'>
					<p className='text-xs text-muted-foreground'>
						{isStale
							? "The page changed after this draft was created. Send your request again to get a new draft."
							: plan.status === "PLAN_READY"
								? "Nothing changes until you apply."
								: "Or discard this draft."}
					</p>

					<div className='flex items-center gap-2'>
						<Button
							type='button'
							size='sm'
							variant='ghost'
							disabled={disabled}
							onClick={() => onDiscard(generation.id)}
							className='text-muted-foreground hover:text-foreground'
						>
							<Trash2 className='size-4' />
							Discard
						</Button>

						{plan.status === "PLAN_READY" && !isStale && (
							<Button
								type='button'
								size='sm'
								disabled={disabled || plan.operations.length === 0}
								onClick={() => onConfirm(generation.id, plan.pageId)}
							>
								<Check className='size-4' />
								Apply changes
							</Button>
						)}
					</div>
				</div>
			)}

			{canUndo && !previewOnly && (
				<UndoDeleteFooter
					generationId={generation.id}
					pageId={plan.pageId}
					appliedAt={generation.applied_at ?? ""}
				/>
			)}

			{isCompleted && previewOnly && (
				<p className='border-t border-border/50 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground'>
					Preview only. No changes have been applied.
				</p>
			)}
		</div>
	);
}
