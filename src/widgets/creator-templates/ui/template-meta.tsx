import { Globe, LayoutTemplate, Lock, Users } from "lucide-react";

import type {
	PageTemplate,
	TemplateStatus,
	TemplateVisibility,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";

const STATUS: Record<TemplateStatus, { label: string; dot: string }> = {
	DRAFT: { label: "Draft", dot: "bg-amber-500" },
	PUBLISHED: { label: "Published", dot: "bg-emerald-500" },
	ARCHIVED: { label: "Archived", dot: "bg-muted-foreground/50" },
};

const VISIBILITY: Record<
	TemplateVisibility,
	{ label: string; icon: typeof Lock }
> = {
	PRIVATE: { label: "Private", icon: Lock },
	WORKSPACE: { label: "Workspace", icon: Users },
	PUBLIC: { label: "Public", icon: Globe },
};

/**
 * The backend never moves `template.status` to PUBLISHED (only versions and
 * listings are published), so it only tells us about ARCHIVED. Otherwise the
 * status is that of the newest version, matching what the list endpoint returns.
 */
export function getTemplateDisplayStatus(
	templateStatus: TemplateStatus,
	newestVersionPublished: boolean,
): TemplateStatus {
	if (templateStatus === "ARCHIVED") return "ARCHIVED";
	return newestVersionPublished ? "PUBLISHED" : "DRAFT";
}

export function TemplateStatusLabel({
	status,
	className,
}: {
	status: TemplateStatus;
	className?: string;
}) {
	const { label, dot } = STATUS[status];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 text-sm text-muted-foreground",
				className,
			)}
		>
			<span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
			{label}
		</span>
	);
}

export function TemplateVisibilityLabel({
	visibility,
	className,
}: {
	visibility: TemplateVisibility;
	className?: string;
}) {
	const { label, icon: Icon } = VISIBILITY[visibility];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 text-sm text-muted-foreground",
				className,
			)}
		>
			<Icon className='size-3.5 shrink-0' />
			{label}
		</span>
	);
}

export function TemplateIcon({
	template,
	className,
}: {
	template: Pick<PageTemplate, "icon">;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-base",
				className,
			)}
		>
			{template.icon || (
				<LayoutTemplate className='size-[45%] text-muted-foreground' />
			)}
		</span>
	);
}
