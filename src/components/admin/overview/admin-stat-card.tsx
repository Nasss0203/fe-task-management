import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	adminMetricCardClass,
	adminQuickStatClass,
	getAdminToneClass,
	type AdminTone,
} from "../shared/theme";

type AdminStatCardProps = {
	title: string;
	value: ReactNode;
	helper?: ReactNode;
	icon: LucideIcon;
	tone?: AdminTone;
};

export function AdminStatCard({
	title,
	value,
	helper,
	icon: Icon,
	tone = "neutral",
}: AdminStatCardProps) {
	return (
		<div className={adminMetricCardClass}>
			<div className='flex items-start justify-between gap-4'>
				<div className='space-y-2'>
					<p className='text-sm text-muted-foreground'>{title}</p>
					<h3 className='text-3xl font-semibold text-foreground'>
						{value}
					</h3>
					{helper ? (
						<p className='text-xs text-muted-foreground'>{helper}</p>
					) : null}
				</div>

				<div
					className={cn(
						"flex size-10 items-center justify-center rounded-xl border",
						getAdminToneClass(tone, "icon"),
					)}
				>
					<Icon className='size-5' />
				</div>
			</div>
		</div>
	);
}

type AdminQuickStatProps = {
	label: string;
	value: ReactNode;
	icon?: LucideIcon;
	tone?: AdminTone;
};

export function AdminQuickStat({
	label,
	value,
	icon: Icon,
	tone = "neutral",
}: AdminQuickStatProps) {
	return (
		<div className={adminQuickStatClass}>
			<div className='flex items-center gap-2'>
				{Icon ? (
					<Icon
						className={cn(
							"size-4",
							getAdminToneClass(tone, "text"),
						)}
					/>
				) : null}
				<p className='text-sm text-muted-foreground'>{label}</p>
			</div>
			<span className='text-sm font-semibold text-foreground'>{value}</span>
		</div>
	);
}
