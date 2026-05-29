"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriorityClass, getTaskBadgeClass } from "@/helpers/helpers";
import { MyTaskItem } from "@/types/type";
import { CalendarDays, ListChecks } from "lucide-react";

type Props = {
	items: MyTaskItem[];
};

const taskStatusLabel: Record<string, string> = {
	Todo: "Cần làm",
	"In Progress": "Đang làm",
	Review: "Review",
};

const priorityLabel: Record<string, string> = {
	High: "Cao",
	Medium: "Trung bình",
	Low: "Thấp",
};

const taskTone: Record<string, string> = {
	High: "border-l-red-500/80",
	Medium: "border-l-yellow-500/80",
	Low: "border-l-emerald-500/80",
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
		<Card className='border-border/60 bg-card/80 shadow-sm'>
			<CardHeader className='pb-3'>
				<CardTitle className='flex items-center gap-2 text-base'>
					<span className='flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary'>
						<ListChecks className='h-4 w-4' />
					</span>
					Công việc của tôi
				</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Các task cần xử lý trong workspace
				</p>
			</CardHeader>

			<CardContent className='space-y-3'>
				{items.map((task) => {
					const isOverdue = isPastDueDate(task.due);

					return (
						<div
							key={task.id}
							className={`rounded-xl border border-border/55 border-l-2 bg-background/45 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-transparent transition hover:bg-background/70 hover:ring-border/60 ${
								isOverdue
									? "border-l-red-500/80"
									: taskTone[task.priority] ??
									  "border-l-border"
							}`}
						>
							<div className='space-y-3'>
								<div className='flex items-start justify-between gap-3'>
									<p className='line-clamp-2 text-sm font-medium leading-6'>
										{task.title}
									</p>

									<Badge
										variant='outline'
										className={getPriorityClass(
											task.priority,
										)}
									>
										{priorityLabel[task.priority] ??
											task.priority}
									</Badge>
								</div>

								<div className='flex flex-wrap items-center gap-2'>
									<Badge
										variant='outline'
										className={getTaskBadgeClass(
											task.status,
										)}
									>
										{taskStatusLabel[task.status] ??
											task.status}
									</Badge>

									{isOverdue ? (
										<Badge
											variant='outline'
											className='border-red-500/35 bg-red-500/10 text-red-500'
										>
											Quá hạn
										</Badge>
									) : null}

									<div className='flex items-center gap-1 text-xs text-muted-foreground'>
										<CalendarDays className='h-3.5 w-3.5' />
										{task.due}
									</div>
								</div>
							</div>
						</div>
					);
				})}

				<Button
					variant='outline'
					className='w-full border-border/60 bg-background/40 hover:bg-background/70'
				>
					Xem tất cả
				</Button>
			</CardContent>
		</Card>
	);
}
