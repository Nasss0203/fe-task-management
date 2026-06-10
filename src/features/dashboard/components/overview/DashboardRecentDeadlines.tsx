import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CalendarClock } from "lucide-react";
import type { DashboardDeadlineResponseDto } from "@/services/dashboard/type";

type DashboardRecentDeadlinesProps = {
	recentDeadlines: DashboardDeadlineResponseDto[];
};

export function DashboardRecentDeadlines({ recentDeadlines }: DashboardRecentDeadlinesProps) {
	return (
		<Card className='xl:col-span-4'>
			<CardHeader>
				<CardTitle>Lịch gần nhất</CardTitle>
				<CardDescription>
					Các mốc nên xử lý trước
				</CardDescription>
				<CardAction>
					<CalendarClock className='text-muted-foreground' />
				</CardAction>
			</CardHeader>
			<CardContent className='flex flex-col gap-3'>
				{recentDeadlines.length ? (
					recentDeadlines.map((item) => (
						<div
							key={item.id}
							className='flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 shadow-sm transition-colors hover:bg-muted/40'
						>
							<div className='min-w-0'>
								<p className='truncate text-[14px] font-semibold text-foreground'>
									{item.title}
								</p>
								<p className='mt-1 truncate text-[12px] text-muted-foreground'>
									{item.workspaceName} /{" "}
									{item.projectName}
								</p>
							</div>
							{/* <Badge
								variant='outline'
								className='shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300'
							>
								{item.remainingLabel}
							</Badge> */}
						</div>
					))
				) : (
					<EmptyState>Không có deadline gần.</EmptyState>
				)}
			</CardContent>
		</Card>
	);
}
