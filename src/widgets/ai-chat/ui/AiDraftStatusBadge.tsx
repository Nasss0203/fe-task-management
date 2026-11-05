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
	review: {
		label: "Awaiting review",
		className:
			"bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/15 dark:text-indigo-300",
	},
	preview: { label: "Preview", className: "bg-muted text-muted-foreground" },
	"needs-info": {
		label: "Needs more info",
		className:
			"bg-[#fbf3db] text-[#b07b00] dark:bg-amber-500/15 dark:text-amber-300",
	},
	processing: {
		label: "Generating",
		className:
			"bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/15 dark:text-indigo-300",
	},
	stale: { label: "Outdated", className: "bg-muted text-muted-foreground" },
	applied: {
		label: "Applied",
		className:
			"bg-[#e9f6ec] text-[#2f9e44] dark:bg-emerald-500/15 dark:text-emerald-300",
	},
	discarded: { label: "Discarded", className: "bg-muted text-muted-foreground" },
	failed: {
		label: "Failed",
		className:
			"bg-[#fdecec] text-[#e5484d] dark:bg-red-500/15 dark:text-red-300",
	},
};

export function AiDraftStatusBadge({ status }: { status: AiDraftStatus }) {
	const { label, className } = STATUS[status];

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1 rounded-[10px] px-2 py-0.5 text-[11.5px] font-medium leading-[17px]",
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
