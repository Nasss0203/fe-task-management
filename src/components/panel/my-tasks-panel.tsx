"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriorityClass, getTaskBadgeClass } from "@/helpers/helpers";
import { MyTaskItem } from "@/types/type";
import { CalendarDays } from "lucide-react";

type Props = {
	items: MyTaskItem[];
};

export function MyTasksPanel({ items }: Props) {
	return (
		<Card className='shadow-sm'>
			<CardHeader>
				<CardTitle>Công việc của tôi</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Các task cần xử lý trong workspace
				</p>
			</CardHeader>

			<CardContent className='space-y-3'>
				{items.map((task) => (
					<div
						key={task.id}
						className='rounded-2xl border p-4 transition hover:shadow-sm'
					>
						<div className='space-y-3'>
							<div className='flex items-start justify-between gap-3'>
								<p className='line-clamp-2 text-sm font-medium leading-6'>
									{task.title}
								</p>

								<Badge
									variant='outline'
									className={getPriorityClass(task.priority)}
								>
									{task.priority}
								</Badge>
							</div>

							<div className='flex flex-wrap items-center gap-2'>
								<Badge
									variant='outline'
									className={getTaskBadgeClass(task.status)}
								>
									{task.status}
								</Badge>

								<div className='flex items-center gap-1 text-xs text-muted-foreground'>
									<CalendarDays className='h-3.5 w-3.5' />
									{task.due}
								</div>
							</div>
						</div>
					</div>
				))}

				<Button variant='outline' className='w-full'>
					Xem tất cả task của tôi
				</Button>
			</CardContent>
		</Card>
	);
}
