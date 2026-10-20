"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import {
	AlertCircle,
	ArrowUpRight,
	Check,
	ChevronDown,
	ChevronRight,
	Database as DatabaseIcon,
	ListChecks,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";

import type {
	AiGeneration,
	AiModificationBlockInput,
	AiModificationOperation,
	AiModificationPlan,
} from "@/entities/ai-assistant/model/ai-assistant.types";

import { useDatabase } from "@/entities/database/model/database.queries";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { AiDraftStatusBadge, type AiDraftStatus } from "./AiDraftStatusBadge";

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

function pluralize(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
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

function BlockContentPreview({ block }: { block: AiModificationBlockInput }) {
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
	if (generation.capability !== "GENERATE_PAGE_MODIFICATION_PLAN") {
		return null;
	}

	const plan = getModificationPlan(generation);

	if (!plan) {
		return null;
	}

	const isCompleted = generation.status === "COMPLETED";
	const status = getDraftStatus(generation, plan, previewOnly);
	// Changes awaiting a decision stay expanded; settled drafts collapse.
	const expandOperations = isCompleted;

	const blockCount = plan.operations.reduce(
		(total, operation) =>
			operation.type === "INSERT_BLOCKS"
				? total + operation.blocks.length
				: total,
		0,
	);

	const rowCount = plan.operations.reduce(
		(total, operation) =>
			operation.type === "CREATE_DATABASE_ROWS"
				? total + operation.rows.length
				: total,
		0,
	);

	const counts = [
		pluralize(plan.operations.length, "operation", "operations"),
		blockCount > 0 && pluralize(blockCount, "block", "blocks"),
		rowCount > 0 && pluralize(rowCount, "row", "rows"),
	]
		.filter(Boolean)
		.join(" · ");

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
						{plan.status === "PLAN_READY"
							? "Nothing changes until you apply."
							: "Reply below with the details, or discard this draft."}
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

						{plan.status === "PLAN_READY" && (
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

			{isCompleted && previewOnly && (
				<p className='border-t border-border/50 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground'>
					Preview only. No changes have been applied.
				</p>
			)}
		</div>
	);
}
