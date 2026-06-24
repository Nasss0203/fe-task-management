import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { DashboardTaskResponseDto } from "@/services/dashboard/type";

const DashboardTaskItem = dynamic(
	() =>
		import("@/features/dashboard/components/overview/DashboardTaskItem").then(
			(mod) => mod.DashboardTaskItem,
		),
	{ ssr: false, loading: () => <Skeleton className="h-[76px] w-full rounded-xl" /> },
);

type DashboardPriorityTasksProps = {
	priorityTasks: DashboardTaskResponseDto[];
};

export function DashboardPriorityTasks({ priorityTasks }: DashboardPriorityTasksProps) {
	return (
		<Card id='priority-today' className='scroll-mt-4 lg:col-span-8'>
			<CardHeader>
				<CardTitle>Ưu tiên hôm nay</CardTitle>
				<CardDescription>
					Các task quan trọng nhất đang cần bạn giữ nhịp.
				</CardDescription>
				<CardAction>
					<Button variant='ghost' size='sm' asChild>
						<Link href='#priority-today'>
							Xem danh sách này
							<ArrowRight />
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className='flex flex-col gap-3 [content-visibility:auto] [contain-intrinsic-size:1000px]'>
				{priorityTasks.length ? (
					priorityTasks.map((task) => (
						<DashboardTaskItem key={task.id} task={task} />
					))
				) : (
					<EmptyState>
						Chưa có task ưu tiên hôm nay.
					</EmptyState>
				)}
			</CardContent>
		</Card>
	);
}
