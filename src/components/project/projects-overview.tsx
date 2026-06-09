"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectItem } from "@/types/type";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
	items: ProjectItem[];
};

const projectStatusLabel: Record<string, string> = {
	"On Track": "On Track",
	"At Risk": "At Risk",
	"Almost Done": "Almost Done",
};

function getProjectStatusStyle(status: string) {
	switch (status) {
		case "On Track":
			return { dot: "bg-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
		case "At Risk":
			return { dot: "bg-rose-400", badge: "bg-rose-500/10 border-rose-500/20 text-rose-400" };
		case "Almost Done":
			return { dot: "bg-blue-400", badge: "bg-blue-500/10 border-blue-500/20 text-blue-400" };
		default:
			return { dot: "bg-slate-400", badge: "bg-slate-500/10 border-slate-700 text-slate-300" };
	}
}

export function ProjectsOverview({ items }: Props) {
	return (
		<Card className='rounded-2xl border-neutral-800 bg-neutral-950/20 shadow-sm'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3 border-b border-neutral-800/50 bg-neutral-900/40 rounded-t-2xl px-5'>
				<div>
					<CardTitle className="text-base text-neutral-100">Project Overview</CardTitle>
					<p className='mt-1 text-[13px] text-neutral-500'>
						Active projects in this workspace
					</p>
				</div>

				<Button variant='ghost' size='sm' className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
					View All
					<ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</CardHeader>

			<CardContent className='space-y-4 p-5'>
				{items.map((project) => {
					const statusStyle = getProjectStatusStyle(project.status);
					return (
						<div
							key={project.id}
							className='rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-all hover:border-neutral-700 hover:bg-neutral-900/60 shadow-sm'
						>
							<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
								<div className='min-w-0 flex-1 space-y-4'>
									<div className='flex flex-wrap items-center gap-2.5'>
										<h3 className='truncate font-semibold text-[15px] text-neutral-200'>
											{project.name}
										</h3>
										<Badge variant='outline' className="bg-neutral-900 border-neutral-800 text-neutral-400 font-medium text-[11px]">
											{project.key}
										</Badge>
										<div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", statusStyle.badge)}>
											<span className={cn("size-1.5 rounded-full", statusStyle.dot)} />
											<span>{projectStatusLabel[project.status] ?? project.status}</span>
										</div>
									</div>

									<div className='space-y-2.5 max-w-md'>
										<div className='flex items-center justify-between text-[13px] font-medium'>
											<span className='text-neutral-500'>
												Progress
											</span>
											<span className='text-neutral-300'>
												{project.progress}%
											</span>
										</div>
										<Progress
											value={project.progress}
											className='h-1.5 bg-neutral-800'
										/>
									</div>

									<div className='flex flex-wrap gap-5 text-[12px] font-medium text-neutral-500'>
										<span>Open: <span className="text-neutral-300">{project.openTasks}</span></span>
										<span>Done: <span className="text-neutral-300">{project.doneTasks}</span></span>
										<span>Deadline: <span className="text-neutral-300">{project.deadline}</span></span>
									</div>
								</div>

								<div className='flex items-center gap-4 mt-2 lg:mt-0'>
									<div className='flex -space-x-2.5'>
										{project.members.map((member, index) => (
											<Avatar
												key={`${project.id}-${member}-${index}`}
												className='h-8 w-8 border-2 border-neutral-950 shadow-sm'
											>
												<AvatarImage src='' />
												<AvatarFallback className='text-[10px] font-semibold bg-neutral-800 text-neutral-300'>
													{member}
												</AvatarFallback>
											</Avatar>
										))}
									</div>

									<Button variant='outline' size='sm' className="border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors rounded-lg">
										Open Project
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
