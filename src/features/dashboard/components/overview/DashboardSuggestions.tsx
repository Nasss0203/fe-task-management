import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import { clampPercent } from "@/features/dashboard/utils/task-style";
import type {
	DashboardStatsResponseDto,
	DashboardSuggestionResponseDto,
} from "@/services/dashboard/type";

type DashboardSuggestionsProps = {
	suggestions: DashboardSuggestionResponseDto[];
	stats: DashboardStatsResponseDto;
};

export function DashboardSuggestions({ suggestions, stats }: DashboardSuggestionsProps) {
	const weeklyGoal = useMemo(() => clampPercent(stats.weeklyGoalPercent), [stats.weeklyGoalPercent]);

	return (
		<Card className='lg:col-span-4'>
			<CardHeader>
				<CardTitle>Gợi ý hành động</CardTitle>
				<CardDescription>
					Những việc nhỏ giúp bảng của bạn gọn hơn.
				</CardDescription>
			</CardHeader>
			<CardContent className='flex flex-col gap-3'>
				{suggestions.length ? (
					suggestions.map((suggestion) => (
						<div
							key={`${suggestion.type}-${suggestion.message}`}
							className='flex items-start gap-3 rounded-lg border bg-background p-3'
						>
							<Activity className='mt-0.5 shrink-0 text-muted-foreground' />
							<p className='text-sm leading-6'>
								{suggestion.message}
							</p>
						</div>
					))
				) : (
					<EmptyState>Không có gợi ý mới.</EmptyState>
				)}

				<div className='rounded-lg border bg-muted/25 p-4'>
					<div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
						<span>Mục tiêu tuần</span>
						<span>{weeklyGoal}%</span>
					</div>
					<Progress value={weeklyGoal} className='h-2' />
				</div>
			</CardContent>
		</Card>
	);
}
