import { cn } from "@/lib/utils";
import type { DashboardActivityResponseDto } from "@/services/dashboard/type";
import { formatRelativeTime } from "../../utils/date";
import { getActivityTone } from "../../utils/task-style";

export function DashboardActivityItem({
	activity,
	isLast,
}: {
	activity: DashboardActivityResponseDto;
	isLast: boolean;
}) {
	return (
		<div className='flex gap-3'>
			<div className='flex flex-col items-center'>
				<div
					className={cn(
						"mt-1 size-2.5 rounded-full",
						getActivityTone(activity.action),
					)}
				/>
				{isLast ? null : <div className='mt-2 h-full w-px bg-border' />}
			</div>
			<div className='min-w-0 pb-4'>
				<p className='text-sm font-medium leading-6'>
					{activity.message}
				</p>
				<p className='text-xs text-muted-foreground'>
					{formatRelativeTime(activity.createdAt)}
				</p>
			</div>
		</div>
	);
}
