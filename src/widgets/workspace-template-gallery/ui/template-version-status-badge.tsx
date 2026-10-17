import type { TemplateVersionStatus } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

export interface TemplateVersionStatusBadgeProps {
	status?: TemplateVersionStatus | null;
	versionNumber?: number;
	className?: string;
}

export function TemplateVersionStatusBadge({
	status,
	versionNumber,
	className,
}: TemplateVersionStatusBadgeProps) {
	const prefix = typeof versionNumber === "number" ? `v${versionNumber} ` : "";
	switch (status) {
		case "DRAFT":
			return (
				<Badge
					variant='outline'
					className={cn(
						"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-medium",
						className,
					)}
				>
					{prefix}Draft
				</Badge>
			);
		case "PUBLISHED":
			return (
				<Badge
					variant='secondary'
					className={cn(
						"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium",
						className,
					)}
				>
					{prefix}Published
				</Badge>
			);
		default:
			return null;
	}
}
