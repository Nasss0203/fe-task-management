"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import { assertModificationDraftTarget } from "../model/ai-modification-action";
import { getAiChatErrorMessage } from "../model/ai-chat-error";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface Action {
  kind: "apply" | "discard";
  generationId: string;
  pageId: string;
}

export function AiModificationActionDialog({ action, workspaceId, currentPageId, pending, onClose, onConfirm }: {
  action: Action | null;
  workspaceId: string | null;
  currentPageId?: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [state, setState] = useState<{ id: string; summary: string; operations: number; blocks: number; rows: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!action) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setState(null);
    void (async () => {
      try {
        const generation = await getAiGeneration(action.generationId);
        assertModificationDraftTarget(generation, action.pageId, workspaceId, currentPageId, action.kind === "discard");
        const plan = generation.output_data;
        const operations = plan.operations;
        if (!cancelled) setState({
          id: generation.id,
          summary: plan.summary,
          operations: operations.length,
          blocks: operations.reduce((sum, operation) => sum + (operation.type === "INSERT_BLOCKS" ? operation.blocks.length : 0), 0),
          rows: operations.reduce((sum, operation) => sum + (operation.type === "CREATE_DATABASE_ROWS" ? operation.rows.length : 0), 0),
        });
      } catch (cause) {
        if (!cancelled) setError(getAiChatErrorMessage(cause, "Unable to verify this draft. Refresh your chat and try again."));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [action, workspaceId, currentPageId]);

  return (
    <AlertDialog open={Boolean(action)} onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action?.kind === "apply" ? "Apply page changes?" : "Discard AI draft?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {action?.kind === "apply" ? "This action writes the proposed changes to the target Page. Review the target and operations before continuing." : "This discards the saved draft without changing the Page."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {action && <div className="space-y-2 rounded-md border p-3 text-sm">
          <div>Target Page: <Link href={`/page/${action.pageId}`} className="break-all text-primary underline">{action.pageId}</Link></div>
          {loading && <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Verifying draft...</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {state && <>
            <p className="whitespace-pre-wrap">{state.summary}</p>
            <p className="text-muted-foreground">{state.operations} operations · {state.blocks} blocks · {state.rows} rows</p>
          </>}
          {pending && <p role="status">Processing request...</p>}
        </div>}
        <AlertDialogFooter>
          <Button variant="outline" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button variant={action?.kind === "discard" ? "destructive" : "default"} disabled={!state || loading || pending || Boolean(error)} onClick={onConfirm}>
            {action?.kind === "apply" ? "Confirm apply" : "Confirm discard"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
