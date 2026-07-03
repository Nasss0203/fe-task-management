"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyTaskItem } from "@/types/type";
import { CalendarDays, ListChecks } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";

type Props = {
	items: MyTaskItem[];
};

function isPastDueDate(value: string) {
	const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

	if (!match) return false;

	const [, day, month, year] = match;
	const dueDate = new Date(Number(year), Number(month) - 1, Number(day));
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return dueDate < today;
}

export function MyTasksPanel({ items }: Props) {
	return (
		<Card className='rounded-2xl border-border bg-muted/50 shadow-sm'>
			<CardHeader className='pb-3 border-b border-border/50 bg-muted/50 rounded-t-2xl px-5'>
				<CardTitle className='flex items-center gap-2 text-base text-foreground'>
					<span className='flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground'>
						<ListChecks className='h-4 w-4' />
					</span>
					My Tasks
				</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Tasks requiring your attention
				</p>
			</CardHeader>

			<CardContent className='space-y-3 p-5'>
				{items.map((task) => {
					const isOverdue = isPastDueDate(task.due);

					return (
						<div
							key={task.id}
							className={`rounded-xl border border-border bg-muted/50 p-4 transition-all hover:hover:bg-muted/80 hover:border-border shadow-sm`}
						>
							<div className='space-y-3'>
								<div className='flex items-start justify-between gap-3'>
									<p className='line-clamp-2 text-[13px] font-medium leading-6 text-foreground'>
										{task.title || <span className="text-muted-foreground italic">Untitled</span>}
									</p>

									<PriorityBadge priorityName={task.priority} />
								</div>

								<div className='flex flex-wrap items-center gap-2'>
									<StatusBadge statusName={task.status} />

									{isOverdue ? (
										<div className='inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400'>
											Overdue
										</div>
									) : null}

									<div className='flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground'>
										<CalendarDays className='size-3.5' />
										{task.due}
									</div>
								</div>
							</div>
						</div>
					);
				})}

				<Button
					variant='outline'
					className='w-full border-border bg-muted/50 text-muted-foreground hover:hover:bg-accent hover:hover:text-foreground transition-colors h-10 rounded-xl mt-2'
				>
					View All
				</Button>
			</CardContent>
		</Card>
	);
}
