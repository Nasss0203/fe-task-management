import type { TemplateVersionStatus } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";

export function TemplateVersionStatusBadge({
	status,
}: {
	status?: TemplateVersionStatus | null;
}) {
	switch (status) {
		case "DRAFT":
			return (
				<Badge
					variant='outline'
					className='bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-medium'
				>
					Draft
				</Badge>
			);
		case "PUBLISHED":
			return (
				<Badge
					variant='secondary'
					className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium'
				>
					Published
				</Badge>
			);
		default:
			return null;
	}
}
