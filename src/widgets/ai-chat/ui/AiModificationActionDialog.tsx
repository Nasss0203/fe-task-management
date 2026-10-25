"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import { getAiAccessIdentity } from "@/entities/ai-assistant/model/ai-assistant.access";
import { usePage } from "@/entities/page/model/page.queries";
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

export function AiModificationActionDialog({ action, workspaceId, currentPageId, shareToken, pending, onClose, onConfirm, onAccessError }: {
  action: Action | null;
  workspaceId: string | null;
  currentPageId?: string;
  shareToken?: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAccessError?: (error: unknown, generationId: string) => void;
}) {
  const accessId = getAiAccessIdentity(shareToken);
  const [state, setState] = useState<{ id: string; accessId?: string; workspaceId: string | null; pageId?: string; kind: Action["kind"]; target: string; summary: string; operations: number; blocks: number; rows: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!action) { setState(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setState(null);
    void (async () => {
      try {
        const generation = await getAiGeneration(action.generationId, controller.signal, ...(shareToken ? [shareToken] as const : [] as const));
        assertModificationDraftTarget(generation, action.pageId, workspaceId, currentPageId, action.kind === "discard");
        const plan = generation.output_data;
        const operations = plan.operations;
        if (!cancelled) setState({
          id: generation.id,
          accessId, workspaceId, pageId: currentPageId, kind: action.kind, target: action.pageId,
          summary: plan.summary,
          operations: operations.length,
          blocks: operations.reduce((sum, operation) => sum + (operation.type === "INSERT_BLOCKS" ? operation.blocks.length : 0), 0),
          rows: operations.reduce((sum, operation) => sum + (operation.type === "CREATE_DATABASE_ROWS" ? operation.rows.length : 0), 0),
        });
      } catch (cause) {
        if (!cancelled) onAccessError?.(cause, action.generationId);
        if (!cancelled) setError(getAiChatErrorMessage(cause, "Unable to verify this draft. Refresh your chat and try again."));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [action, workspaceId, currentPageId, onAccessError, shareToken, accessId]);

  // Users recognise Pages by title; a share-token view cannot read the Page directly.
  const targetPage = usePage(action?.pageId, !shareToken);
  const targetPageName = targetPage.data?.id === action?.pageId && targetPage.data?.title?.trim()
    ? targetPage.data.title
    : targetPage.isPending && !shareToken ? "Loading…" : "Untitled page";

  const visibleState = action && state?.id === action.generationId && state.accessId === accessId &&
    state.workspaceId === workspaceId && state.pageId === currentPageId && state.kind === action.kind && state.target === action.pageId ? state : null;

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
          <div>Target Page: <Link href={`/page/${action.pageId}`} className="break-all text-primary underline">{targetPageName}</Link></div>
          {loading && <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Verifying draft...</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {visibleState && <>
            <p className="whitespace-pre-wrap">{visibleState.summary}</p>
            <p className="text-muted-foreground">{visibleState.operations} operations · {visibleState.blocks} blocks · {visibleState.rows} rows</p>
          </>}
          {pending && <p role="status">Processing request...</p>}
        </div>}
        <AlertDialogFooter>
          <Button variant="outline" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button variant={action?.kind === "discard" ? "destructive" : "default"} disabled={!visibleState || loading || pending || Boolean(error)} onClick={onConfirm}>
            {action?.kind === "apply" ? "Confirm apply" : "Confirm discard"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
