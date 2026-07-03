import { EmptyState } from "@/components/shared/EmptyState";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardTaskResponseDto } from "@/services/dashboard/type";
import dynamic from "next/dynamic";

const DashboardTaskItem = dynamic(
	() =>
		import("@/features/dashboard/components/overview/DashboardTaskItem").then(
			(mod) => mod.DashboardTaskItem,
		),
	{
		ssr: false,
		loading: () => <Skeleton className='h-[76px] w-full rounded-xl' />,
	},
);

type DashboardPriorityTasksProps = {
	priorityTasks: DashboardTaskResponseDto[];
};

export function DashboardPriorityTasks({
	priorityTasks,
}: DashboardPriorityTasksProps) {
	return (
		<Card id='priority-today' className='scroll-mt-4 lg:col-span-8'>
			<CardHeader>
				<CardTitle>Ưu tiên hôm nay</CardTitle>
				<CardDescription>
					Các task quan trọng nhất đang cần bạn giữ nhịp.
				</CardDescription>
			</CardHeader>
			<CardContent className='flex flex-col gap-3 [content-visibility:auto] [contain-intrinsic-size:1000px]'>
				{priorityTasks.length ? (
					priorityTasks.map((task) => (
						<DashboardTaskItem key={task.id} task={task} />
					))
				) : (
					<EmptyState>Chưa có task ưu tiên hôm nay.</EmptyState>
				)}
			</CardContent>
		</Card>
	);
}
