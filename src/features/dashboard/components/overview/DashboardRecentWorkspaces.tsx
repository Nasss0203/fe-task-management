import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChevronRight, FolderKanban } from "lucide-react";
import Link from "next/link";
import type { DashboardWorkspaceResponseDto } from "@/services/dashboard/type";

type DashboardRecentWorkspacesProps = {
	recentWorkspaces: DashboardWorkspaceResponseDto[];
};

export function DashboardRecentWorkspaces({ recentWorkspaces }: DashboardRecentWorkspacesProps) {
	return (
		<Card className='lg:col-span-4'>
			<CardHeader>
				<CardTitle>Workspace gần đây</CardTitle>
				<CardDescription>
					Không gian bạn vừa làm việc
				</CardDescription>
			</CardHeader>
			<CardContent className='flex flex-col gap-3 [content-visibility:auto] [contain-intrinsic-size:300px]'>
				{recentWorkspaces.length ? (
					recentWorkspaces.map((workspace) => (
						<Link
							key={workspace.id}
							href={`/dashboard/${workspace.slug}`}
							className='group flex items-center justify-between gap-3 rounded-lg border bg-background p-4 transition hover:border-primary/30 hover:bg-muted/30'
						>
							<div className='flex min-w-0 items-center gap-3'>
								<div className='flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/45'>
									<FolderKanban className='text-muted-foreground' />
								</div>
								<div className='min-w-0'>
									<p className='truncate text-sm font-semibold'>
										{workspace.name}
									</p>
									<p className='mt-1 truncate text-xs text-muted-foreground'>
										{workspace.projectCount} dự án /{" "}
										{workspace.openTaskCount} task
										mở
									</p>
								</div>
							</div>
							<ChevronRight className='shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground' />
						</Link>
					))
				) : (
					<EmptyState>Chưa có workspace gần đây.</EmptyState>
				)}
			</CardContent>
		</Card>
	);
}
