"use client";

import { Check, FileText, Table2, Trash2 } from "lucide-react";
import { useId, useState } from "react";

import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import type {
  PageCompositionBlock,
  PageCompositionDatabase,
  PageCompositionDraft,
  PageCompositionRowValue,
} from "@/entities/ai-assistant/model/page-composition.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { AiDraftStatusBadge, type AiDraftStatus } from "./AiDraftStatusBadge";
import { BlockContentPreview } from "./AiModificationPlanPreview";
import { isValidAiCompositionGeneration } from "../model/ai-ask-response-mapper";

interface AiPageCompositionPreviewProps {
  generation: AiGeneration;
  disabled?: boolean;
  requireContentReview?: boolean;
  onConfirm: (generationId: string) => void;
  onDiscard: (generationId: string) => void;
}

const STATUS: Record<AiGeneration["status"], AiDraftStatus> = {
  PROCESSING: "processing",
  COMPLETED: "review",
  APPLIED: "applied",
  DISCARDED: "discarded",
  FAILED: "failed",
};

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function formatRowValue(
  value: PageCompositionRowValue | undefined,
  database: PageCompositionDatabase,
  propertyRef: string,
): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "✓" : "";
  if (typeof value !== "object") return String(value);
  if ("optionRef" in value) {
    const property = database.properties.find((item) => item.ref === propertyRef);
    const option = property?.type === "SELECT"
      ? property.options.find((item) => item.ref === value.optionRef)
      : undefined;
    return option?.name ?? "";
  }
  return value.end ? `${value.start} → ${value.end}` : value.start;
}

function CompositionDatabaseTable({ database }: { database: PageCompositionDatabase }) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Table2 className="size-4 text-muted-foreground" aria-hidden="true" />
        {database.name}
      </p>
      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              {database.properties.map((property) => (
                <th key={property.ref} className="px-2 py-1.5 text-left font-medium">{property.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {database.rows.map((row, index) => (
              <tr key={row.ref ?? index} className="border-t border-border/40">
                {database.properties.map((property) => (
                  <td key={property.ref} className="whitespace-pre-wrap break-words px-2 py-1.5 text-foreground">
                    {formatRowValue(row.values[property.ref], database, property.ref)}
                  </td>
                ))}
              </tr>
            ))}
            {database.rows.length === 0 && (
              <tr className="border-t border-border/40">
                <td colSpan={database.properties.length} className="px-2 py-1.5 italic text-muted-foreground">No rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Read-only rendering of the draft as it will look on the page (no inputs, text escaped by React). */
function CompositionContent({ draft }: { draft: PageCompositionDraft }) {
  const byOrder = (a: PageCompositionBlock, b: PageCompositionBlock) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
  const childrenOf = (parentRef: string | null) =>
    draft.blocks.filter((block) => (block.parentRef ?? null) === parentRef).sort(byOrder);

  const renderBlocks = (parentRef: string | null) => childrenOf(parentRef).map((block) => {
    const children = childrenOf(block.ref);
    let body;
    if (block.type === "DATABASE_VIEW") {
      const database = draft.databases.find((item) => item.ref === block.databaseRef);
      body = database ? <CompositionDatabaseTable database={database} /> : null;
    } else {
      body = <BlockContentPreview block={block} />;
    }
    return (
      <div key={block.ref} className="space-y-2">
        {body}
        {children.length > 0 && <div className="space-y-2 border-l border-border/50 pl-4">{renderBlocks(block.ref)}</div>}
      </div>
    );
  });

  // Review must cover every database, including ones no view block places.
  const unplaced = draft.databases.filter((database) => !draft.blocks.some(
    (block) => block.type === "DATABASE_VIEW" && block.databaseRef === database.ref));

  return (
    <div className="space-y-2">
      <p className="text-lg font-semibold leading-snug text-foreground">
        {draft.page.icon && <span className="mr-1.5">{draft.page.icon}</span>}
        {draft.page.title}
      </p>
      {renderBlocks(null)}
      {unplaced.map((database) => <CompositionDatabaseTable key={database.ref} database={database} />)}
    </div>
  );
}

export function AiPageCompositionPreview({
  generation,
  disabled = false,
  requireContentReview = false,
  onConfirm,
  onDiscard,
}: AiPageCompositionPreviewProps) {
  const [openedContent, setOpenedContent] = useState<string | null>(null);
  const [approvedContent, setApprovedContent] = useState<string | null>(null);
  const reviewId = useId();
  const preview = generation.preview;

  if (
    generation.capability !== "GENERATE_PAGE_COMPOSITION" ||
    !preview ||
    preview.type !== "PAGE_COMPOSITION" ||
    (requireContentReview && !isValidAiCompositionGeneration(generation))
  ) {
    return null;
  }

  const isCompleted = generation.status === "COMPLETED";
  const content = requireContentReview ? JSON.stringify(generation.output_data, null, 2) : "";
  const reviewKey = `${generation.id}:${generation.updated_at}:${content}`;
  const canConfirm = !requireContentReview || openedContent === reviewKey && approvedContent === reviewKey;
  const { blocks, databases, database_rows: rows } = preview.summary;
  const counts = [
    plural(blocks, "block", "blocks"),
    databases > 0 && plural(databases, "database", "databases"),
    rows > 0 && plural(rows, "row", "rows"),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card",
        generation.status === "DISCARDED" && "opacity-75",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              New page draft
            </p>

            <AiDraftStatusBadge status={STATUS[generation.status]} />
          </div>

          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {preview.page.title}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">{counts}</p>
        </div>
      </div>

      {requireContentReview && (
        <div className="space-y-2 px-4 pb-4">
          <details className="rounded-lg border border-border/60 p-3"
            onToggle={(event) => { if (event.currentTarget.open) setOpenedContent(reviewKey); }}>
            <summary className="cursor-pointer text-xs font-medium">Review full generated content</summary>
            <p className="mt-2 text-xs text-muted-foreground">Read-only page content, including all blocks, databases and row values. Check any details AI may have inferred.</p>
            <div className="mt-3 max-h-80 overflow-auto rounded-md bg-background/40 p-3">
              <CompositionContent draft={generation.output_data as PageCompositionDraft} />
            </div>
          </details>
          {isCompleted && <label htmlFor={reviewId} className="flex items-start gap-2 text-xs text-muted-foreground">
            <input id={reviewId} type="checkbox" checked={approvedContent === reviewKey}
              disabled={disabled || openedContent !== reviewKey}
              onChange={(event) => setApprovedContent(event.target.checked ? reviewKey : null)} />
            I have reviewed the generated content and want to create this page.
          </label>}
        </div>
      )}
      {isCompleted && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/30 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            The page is created only after you confirm.
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => onDiscard(generation.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-4" />
              Discard
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={disabled || !canConfirm}
              onClick={() => { if (canConfirm) onConfirm(generation.id); }}
            >
              <Check className="size-4" />
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
