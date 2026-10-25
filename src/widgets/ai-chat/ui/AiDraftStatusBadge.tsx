"use client";

import { Check, Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type AiDraftStatus =
	| "review"
	| "preview"
	| "needs-info"
	| "processing"
	| "stale"
	| "applied"
	| "discarded"
	| "failed";

const STATUS: Record<AiDraftStatus, { label: string; className: string }> = {
	review: { label: "Awaiting review", className: "bg-primary/10 text-primary" },
	preview: { label: "Preview", className: "bg-muted text-muted-foreground" },
	"needs-info": { label: "Needs more info", className: "bg-warning/10 text-warning" },
	processing: { label: "Generating", className: "bg-muted text-muted-foreground" },
	stale: { label: "Outdated", className: "bg-warning/10 text-warning" },
	applied: { label: "Applied", className: "bg-success/10 text-success" },
	discarded: { label: "Discarded", className: "bg-muted text-muted-foreground" },
	failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
};

export function AiDraftStatusBadge({ status }: { status: AiDraftStatus }) {
	const { label, className } = STATUS[status];

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
				className,
			)}
		>
			{status === "applied" && <Check className='size-3' aria-hidden='true' />}
			{status === "processing" && (
				<Loader2 className='size-3 animate-spin' aria-hidden='true' />
			)}
			{label}
		</span>
	);
}
