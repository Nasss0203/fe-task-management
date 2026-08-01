import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { WorkspaceOverviewProject } from "../workspace-overview.types";
import { formatDate } from "../workspace-overview.utils";

interface ProjectOverviewProps {
	workspaceSlug: string;
	projects: WorkspaceOverviewProject[];
}

export function ProjectOverview({
	workspaceSlug,
	projects,
}: ProjectOverviewProps) {
	if (projects?.length === 0) {
		return (
			<div className='rounded-xl border border-border bg-muted/50 p-6 text-center'>
				<p className='text-sm text-muted-foreground'>Chưa có project nào</p>
			</div>
		);
	}

	return (
		<div className='h-full rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-foreground'>
					Dự án hoạt động
				</h3>

			</div>

			<div className='space-y-4'>
				{projects?.map((project) => {
					return (
						<div
							key={project.id}
							className='group flex flex-col gap-4 rounded-xl border border-border/50 bg-background/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
						>
							<div className='flex items-start justify-between'>
								<div className='flex items-center gap-3'>
									<div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted p-1 font-bold text-muted-foreground shadow-sm'>
										<span className="truncate text-xs">{project.code}</span>
									</div>
									<div>
										<h4 className='text-sm font-semibold text-foreground'>
											{project.name}
										</h4>
										<div className='mt-1 flex items-center gap-2'>
											<span className='text-[10px] text-muted-foreground'>
												Deadline:{" "}
												{formatDate(project.deadline)}
											</span>
										</div>
									</div>
								</div>
								<Link
									href={`/dashboard/${workspaceSlug}/projects/${project.id}`}
									className='rounded-md p-1.5 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground transition-all'
								>
									<ExternalLink size={16} />
								</Link>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between text-[11px]'>
									<span className='text-muted-foreground font-medium'>
										Tiến độ
									</span>
									<span className='text-foreground font-bold'>
										{project.progress}%
									</span>
								</div>
								<div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
									<div
										className='h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-out'
										style={{
											width: `${project.progress}%`,
										}}
									/>
								</div>
							</div>

							<div className='flex items-center justify-between border-t border-border/50 pt-3'>
								<div className='flex items-center gap-4 text-[11px]'>
									<div className='flex flex-col'>
										<span className='text-muted-foreground'>
											Đang mở
										</span>
										<span className='font-bold text-foreground'>
											{project.openTasks}
										</span>
									</div>
									<div className='flex flex-col'>
										<span className='text-muted-foreground'>
											Hoàn thành
										</span>
										<span className='font-bold text-foreground'>
											{project.doneTasks}
										</span>
									</div>
								</div>

								<div className='flex -space-x-2'>
									{(project.members ?? [])
										.slice(0, 3)
										.map((member, index) => (
											<img
												key={
													member.id ??
													`${project.id}-member-${index}`
												}
												src={
													member.avatarUrl ||
													`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=random`
												}
												alt={member.name || "Member"}
												title={member.name || "Member"}
												className='h-6 w-6 rounded-full border-2 border-border object-cover'
											/>
										))}
									{(project.members ?? []).length > 3 && (
										<div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-muted text-[8px] font-bold text-muted-foreground'>
											+
											{(project.members ?? []).length - 3}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
