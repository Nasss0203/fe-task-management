import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getProjectHealthMeta } from "../workspace-overview.mapper";
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
			<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center'>
				<p className='text-sm text-zinc-500'>Chưa có project nào</p>
			</div>
		);
	}

	return (
		<div className='h-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-white'>
					Dự án hoạt động
				</h3>
				<Link
					href={`/dashboard/${workspaceSlug}/projects`}
					className='text-xs font-medium text-zinc-400 hover:text-white transition-colors'
				>
					Xem tất cả
				</Link>
			</div>

			<div className='space-y-4'>
				{projects?.map((project) => {
					const healthMeta = getProjectHealthMeta(project.health);
					return (
						<div
							key={project.id}
							className='group flex flex-col gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/40'
						>
							<div className='flex items-start justify-between'>
								<div className='flex items-center gap-3'>
									<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 font-bold text-zinc-400'>
										{project.code}
									</div>
									<div>
										<h4 className='text-sm font-semibold text-white'>
											{project.name}
										</h4>
										<div className='mt-1 flex items-center gap-2'>
											<span
												className={cn(
													"rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
													healthMeta.className,
												)}
											>
												{healthMeta.label}
											</span>
											<span className='text-[10px] text-zinc-500'>
												Deadline:{" "}
												{formatDate(project.deadline)}
											</span>
										</div>
									</div>
								</div>
								<Link
									href={`/dashboard/${workspaceSlug}/projects/${project.id}`}
									className='rounded-md p-1.5 text-zinc-500 hover:bg-zinc-700/50 hover:text-white transition-all'
								>
									<ExternalLink size={16} />
								</Link>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between text-[11px]'>
									<span className='text-zinc-400 font-medium'>
										Tiến độ
									</span>
									<span className='text-white font-bold'>
										{project.progress}%
									</span>
								</div>
								<div className='h-1.5 w-full overflow-hidden rounded-full bg-zinc-800'>
									<div
										className='h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out'
										style={{
											width: `${project.progress}%`,
										}}
									/>
								</div>
							</div>

							<div className='flex items-center justify-between border-t border-zinc-800/50 pt-3'>
								<div className='flex items-center gap-4 text-[11px]'>
									<div className='flex flex-col'>
										<span className='text-zinc-500'>
											Đang mở
										</span>
										<span className='font-bold text-white'>
											{project.openTasks}
										</span>
									</div>
									<div className='flex flex-col'>
										<span className='text-zinc-500'>
											Hoàn thành
										</span>
										<span className='font-bold text-white'>
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
												className='h-6 w-6 rounded-full border-2 border-zinc-900 object-cover'
											/>
										))}
									{(project.members ?? []).length > 3 && (
										<div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-800 text-[8px] font-bold text-zinc-400'>
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
