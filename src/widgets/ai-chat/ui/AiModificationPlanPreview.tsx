"use client";

import type { ReactNode } from "react";

import {
	AlertCircle,
	Check,
	ChevronDown,
	Database as DatabaseIcon,
	FileText,
	ListChecks,
	Loader2,
	Trash2,
} from "lucide-react";

import type {
	AiGeneration,
	AiModificationOperation,
	AiModificationPlan,
} from "@/entities/ai-assistant/model/ai-assistant.types";

import { useDatabase } from "@/entities/database/model/database.queries";
import { Button } from "@/shared/ui/button";

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
		return <span className='italic text-muted-foreground'>Null</span>;
	}

	if (typeof value === "boolean") {
		return value ? "True" : "False";
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "string") {
		return value.length > 0 ? (
			<span className='whitespace-pre-wrap break-words'>{value}</span>
		) : (
			<span className='italic text-muted-foreground'>Empty string</span>
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
						className='grid grid-cols-[minmax(0,95px)_minmax(0,1fr)] gap-3 py-2 first:pt-0 last:pb-0'
					>
						<dt
							className='min-w-0 break-words text-xs text-muted-foreground'
							title={displayName !== key ? key : undefined}
						>
							{displayName}
						</dt>

						<dd className='min-w-0 text-xs font-medium leading-relaxed text-foreground'>
							{renderFieldValue(value)}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}

/**
 * INSERT_BLOCKS
 *
 * Keeps the original preview behavior.
 */
function InsertBlocksPreview({
	operation,
	index,
}: {
	operation: Extract<AiModificationOperation, { type: "INSERT_BLOCKS" }>;
	index: number;
}) {
	return (
		<details
			open
			className='group rounded-lg border border-border/60 bg-muted/20'
		>
			<summary className='flex cursor-pointer list-none items-center gap-2.5 px-3 py-3 [&::-webkit-details-marker]:hidden'>
				<FileText className='size-4 shrink-0 text-muted-foreground' />

				<div className='min-w-0 flex-1'>
					<p className='text-xs font-semibold text-foreground'>
						Insert blocks
					</p>

					<p className='mt-0.5 text-[11px] text-muted-foreground'>
						Operation {index + 1} ·{" "}
						{pluralize(operation.blocks.length, "block", "blocks")}
					</p>
				</div>

				<ChevronDown className='size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180' />
			</summary>

			<div className='space-y-3 border-t border-border/50 px-3 py-3'>
				<div className='space-y-1 rounded-md bg-muted/40 p-2.5 text-[11px]'>
					<div className='flex items-start gap-2'>
						<span className='w-20 shrink-0 text-muted-foreground'>
							Parent
						</span>

						<span className='min-w-0 break-all font-mono text-foreground'>
							{operation.parentBlockId ?? "Page root"}
						</span>
					</div>

					<div className='flex items-start gap-2'>
						<span className='w-20 shrink-0 text-muted-foreground'>
							After block
						</span>

						<span className='min-w-0 break-all font-mono text-foreground'>
							{operation.afterBlockId ?? "Not specified"}
						</span>
					</div>
				</div>

				{operation.blocks.map((block, blockIndex) => (
					<div
						key={blockIndex}
						className='rounded-lg border border-border/50 bg-card p-3'
					>
						<div className='mb-3 flex items-center justify-between gap-2'>
							<span className='text-xs font-medium text-foreground'>
								Block {blockIndex + 1}
							</span>

							<span className='rounded-md bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
								{block.type}
							</span>
						</div>

						<PlanDataFields
							values={block.content}
							emptyMessage='This block has no content fields.'
						/>
					</div>
				))}
			</div>
		</details>
	);
}

/**
 * CREATE_DATABASE_ROWS
 *
 * Fetches database metadata and maps property IDs
 * to their user-facing names.
 *
 * useDatabase is called at the top of this component,
 * not inside a map callback or conditional branch.
 */
function CreateDatabaseRowsPreview({
	operation,
	index,
}: {
	operation: Extract<
		AiModificationOperation,
		{ type: "CREATE_DATABASE_ROWS" }
	>;
	index: number;
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

	const databaseName = database?.name;

	return (
		<details
			open
			className='group rounded-lg border border-border/60 bg-muted/20'
		>
			<summary className='flex cursor-pointer list-none items-center gap-2.5 px-3 py-3 [&::-webkit-details-marker]:hidden'>
				<DatabaseIcon className='size-4 shrink-0 text-muted-foreground' />

				<div className='min-w-0 flex-1'>
					<p className='text-xs font-semibold text-foreground'>
						Create database rows
					</p>

					<p className='mt-0.5 text-[11px] text-muted-foreground'>
						Operation {index + 1} ·{" "}
						{pluralize(operation.rows.length, "row", "rows")}
						{databaseName && ` · ${databaseName}`}
					</p>
				</div>

				<ChevronDown className='size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180' />
			</summary>

			<div className='space-y-3 border-t border-border/50 px-3 py-3'>
				{/* Database information */}
				<div className='rounded-md bg-muted/40 p-2.5'>
					<div className='flex items-center justify-between gap-2'>
						<p className='text-[11px] text-muted-foreground'>
							Target database
						</p>

						{isDatabaseLoading && (
							<Loader2 className='size-3.5 animate-spin text-muted-foreground' />
						)}
					</div>

					{databaseName ? (
						<>
							<p className='mt-1 text-xs font-medium text-foreground'>
								{databaseName}
							</p>

							<p
								className='mt-1 truncate font-mono text-[10px] text-muted-foreground'
								title={operation.databaseId}
							>
								{operation.databaseId}
							</p>
						</>
					) : (
						<p className='mt-1 break-all font-mono text-[11px] text-foreground'>
							{operation.databaseId}
						</p>
					)}
				</div>

				{/* Metadata fetch failure */}
				{isDatabaseError && (
					<div className='flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5'>
						<AlertCircle className='mt-0.5 size-3.5 shrink-0 text-destructive' />

						<p className='text-[11px] leading-relaxed text-muted-foreground'>
							Unable to load database metadata. Property IDs are
							shown instead of names. Review the proposed values
							carefully.
						</p>
					</div>
				)}

				{/* Pending metadata */}
				{isDatabaseLoading && (
					<p className='text-[11px] text-muted-foreground'>
						Loading database properties...
					</p>
				)}

				{/* Planned rows */}
				{operation.rows.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className='rounded-lg border border-border/50 bg-card p-3'
					>
						<div className='mb-3 flex items-center gap-2'>
							<DatabaseIcon className='size-3.5 text-muted-foreground' />

							<p className='text-xs font-medium text-foreground'>
								Row {rowIndex + 1}
							</p>
						</div>

						<PlanDataFields
							values={row.values}
							propertyNames={propertyNames}
							emptyMessage='This row has no property values.'
						/>
					</div>
				))}
			</div>
		</details>
	);
}

function ModificationOperationPreview({
	operation,
	index,
}: {
	operation: AiModificationOperation;
	index: number;
}) {
	switch (operation.type) {
		case "INSERT_BLOCKS":
			return <InsertBlocksPreview operation={operation} index={index} />;

		case "CREATE_DATABASE_ROWS":
			return (
				<CreateDatabaseRowsPreview
					operation={operation}
					index={index}
				/>
			);

		default:
			return null;
	}
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
	const isApplied = generation.status === "APPLIED";
	const isDiscarded = generation.status === "DISCARDED";

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

	return (
		<div className='min-w-0 rounded-xl border border-border/60 bg-card p-4'>
			{/* Header */}
			<div className='flex items-start gap-3'>
				<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted'>
					<ListChecks className='size-4 text-muted-foreground' />
				</div>

				<div className='min-w-0 flex-1'>
					<p className='text-sm font-medium text-foreground'>
						Page modification plan
					</p>

					<p className='mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground'>
						{plan.summary}
					</p>
				</div>
			</div>

			{/* Operation counts */}
			{plan.status === "PLAN_READY" && (
				<div className='mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
					{pluralize(
						plan.operations.length,
						"operation",
						"operations",
					)}
					{" · "}
					{pluralize(blockCount, "block", "blocks")}
					{" · "}
					{pluralize(rowCount, "row", "rows")}
				</div>
			)}

			{/* Proposed changes */}
			{plan.status === "PLAN_READY" && (
				<div className='mt-4 space-y-2.5'>
					<p className='text-xs font-semibold text-foreground'>
						Proposed changes
					</p>

					<div className='space-y-2'>
						{plan.operations.map((operation, index) => (
							<ModificationOperationPreview
								key={index}
								operation={operation}
								index={index}
							/>
						))}
					</div>

					{plan.operations.length === 0 && (
						<p className='rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground'>
							No operations were proposed.
						</p>
					)}
				</div>
			)}

			{/* More context required */}
			{plan.status === "NEED_MORE_CONTEXT" && (
				<div className='mt-4 space-y-2'>
					<div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
						<AlertCircle className='size-4' />
						More context is required
					</div>

					{plan.contextRequests.map((request, index) => (
						<div
							key={`${request.reason}-${index}`}
							className='rounded-lg bg-muted/40 px-3 py-2.5'
						>
							<p className='text-xs leading-relaxed text-foreground'>
								{request.description}
							</p>

							{request.question && (
								<p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
									{request.question}
								</p>
							)}

							<p className='mt-2 text-[10px] uppercase tracking-wide text-muted-foreground/80'>
								{request.reason.replaceAll("_", " ")}
							</p>
						</div>
					))}
				</div>
			)}

			{/* Actions */}
				{isCompleted && !previewOnly && (
				<div className='mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3'>
					{!previewOnly && plan.status === "PLAN_READY" && (
						<Button
							type='button'
							size='sm'
							disabled={disabled || plan.operations.length === 0}
							onClick={() =>
								onConfirm(generation.id, plan.pageId)
							}
						>
							<Check className='size-4' />
							Apply changes
						</Button>
					)}

						{!previewOnly && <Button
						type='button'
						size='sm'
						variant='outline'
						disabled={disabled}
						onClick={() => onDiscard(generation.id)}
					>
						<Trash2 className='size-4' />
						Discard
						</Button>}
				</div>
			)}

			{/* Applied */}
			{isApplied && (
				<div
					className='mt-4 flex items-center gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground'
					role='status'
				>
					<Check className='size-4' />
					Changes applied successfully.
				</div>
			)}

			{/* Discarded */}
			{isDiscarded && (
				<p className='mt-4 border-t border-border/50 pt-3 text-xs text-muted-foreground'>
					Draft discarded.
				</p>
			)}
		</div>
	);
}
