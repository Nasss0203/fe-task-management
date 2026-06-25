import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	adminChipBaseClass,
	adminHeaderKickerClass,
	adminPageDescriptionClass,
	adminPageTitleClass,
	getAdminToneClass,
	type AdminTone,
} from "../shared/theme";

type AdminPageHeaderProps = {
	title: string;
	description: string;
	eyebrow?: string;
	eyebrowIcon?: LucideIcon;
	badge?: {
		label: string;
		icon?: LucideIcon;
		tone?: AdminTone;
	};
	actions?: ReactNode;
	withDivider?: boolean;
};

export function AdminPageHeader({
	title,
	description,
	eyebrow,
	eyebrowIcon: EyebrowIcon,
	badge,
	actions,
	withDivider = false,
}: AdminPageHeaderProps) {
	const BadgeIcon = badge?.icon;

	return (
		<div
			className={cn(
				"flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
				withDivider && "border-b border-border/70 pb-5",
			)}
		>
			<div className='space-y-2'>
				{eyebrow ? (
					<div className={adminHeaderKickerClass}>
						{EyebrowIcon ? <EyebrowIcon className='size-4' /> : null}
						{eyebrow}
					</div>
				) : null}
				<h1 className={adminPageTitleClass}>{title}</h1>
				<p className={adminPageDescriptionClass}>{description}</p>
			</div>

			{actions ? (
				<div className='flex flex-wrap items-center gap-2'>{actions}</div>
			) : badge ? (
				<div
					className={cn(
						adminChipBaseClass,
						getAdminToneClass(badge.tone ?? "brand"),
					)}
				>
					{BadgeIcon ? <BadgeIcon className='size-4' /> : null}
					{badge.label}
				</div>
			) : null}
		</div>
	);
}
