"use client";

import { Check, FileText, Trash2 } from "lucide-react";

import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { AiDraftStatusBadge, type AiDraftStatus } from "./AiDraftStatusBadge";

interface AiPageCompositionPreviewProps {
  generation: AiGeneration;
  disabled?: boolean;
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

export function AiPageCompositionPreview({
  generation,
  disabled = false,
  onConfirm,
  onDiscard,
}: AiPageCompositionPreviewProps) {
  const preview = generation.preview;

  if (
    generation.capability !== "GENERATE_PAGE_COMPOSITION" ||
    !preview ||
    preview.type !== "PAGE_COMPOSITION"
  ) {
    return null;
  }

  const isCompleted = generation.status === "COMPLETED";
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
              disabled={disabled}
              onClick={() => onConfirm(generation.id)}
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
