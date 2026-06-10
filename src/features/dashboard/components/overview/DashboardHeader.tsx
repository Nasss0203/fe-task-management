import { Button } from "@/components/ui/button";
import { FolderKanban, ListTodo } from "lucide-react";
import Link from "next/link";
import { formatDashboardDate } from "@/features/dashboard/utils/date";
import type {
	DashboardGreetingResponseDto,
	DashboardTaskResponseDto,
	DashboardWorkspaceResponseDto,
} from "@/services/dashboard/type";

type DashboardHeaderProps = {
	greeting: DashboardGreetingResponseDto;
	priorityTasks: DashboardTaskResponseDto[];
	recentWorkspaces: DashboardWorkspaceResponseDto[];
};

export function DashboardHeader({
	greeting,
	priorityTasks,
	recentWorkspaces,
}: DashboardHeaderProps) {
	const primaryWorkspace = recentWorkspaces[0];

	return (
		<section className='mb-2 rounded-2xl border-none bg-gradient-to-br from-muted/50 to-background p-6 xl:p-8'>
			<div className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
				<div className='min-w-0'>
					<p className='text-[13px] font-bold tracking-widest text-primary uppercase'>
						Bảng điều khiển cá nhân
					</p>
					<h1 className='mt-2 text-3xl font-bold tracking-tight md:text-4xl'>
						Chào bạn, {greeting.displayName}
					</h1>
					<p className='mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground'>
						Bạn có <strong className='text-foreground font-semibold'>{greeting.todayPriorityCount} việc ưu tiên</strong> hôm nay. Dashboard đang gom deadline, nhịp
						làm việc, workspace gần đây và hoạt động mới nhất
						vào một màn hình.
					</p>
				</div>

				<div className='flex flex-wrap items-center gap-3'>
					<div className='rounded-full border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm'>
						{formatDashboardDate(greeting.date)}
					</div>
					<Button asChild variant='default' className='rounded-full shadow-sm'>
						<Link href='/dashboard/my-tasks'>
							<ListTodo className="mr-2 h-4 w-4" />
							<span>
								Xem {priorityTasks.length} task ưu tiên
							</span>
						</Link>
					</Button>
					{primaryWorkspace ? (
						<Button asChild variant='secondary' className='rounded-full max-w-[240px] shadow-sm'>
							<Link
								href={`/dashboard/${primaryWorkspace.slug}`}
							>
								<FolderKanban className="mr-2 h-4 w-4" />
								<span className='truncate'>
									Mở {primaryWorkspace.name}
								</span>
							</Link>
						</Button>
					) : (
						<Button disabled variant='secondary' className='rounded-full'>
							<FolderKanban className="mr-2 h-4 w-4" />
							Chưa có workspace
						</Button>
					)}
				</div>
			</div>
		</section>
	);
}
