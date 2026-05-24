"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStatusBadgeVariant } from "@/helpers/helpers";
import { ProjectItem } from "@/types/type";
import { ArrowRight } from "lucide-react";

type Props = {
	items: ProjectItem[];
};

export function ProjectsOverview({ items }: Props) {
	return (
		<Card className='shadow-sm'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0'>
				<div>
					<CardTitle>Projects Overview</CardTitle>
					<p className='mt-1 text-sm text-muted-foreground'>
						Các project chính trong workspace
					</p>
				</div>

				<Button variant='ghost' size='sm'>
					Xem tất cả
					<ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</CardHeader>

			<CardContent className='space-y-4'>
				{items.map((project) => (
					<div
						key={project.id}
						className='rounded-2xl border bg-background p-4 transition hover:shadow-sm'
					>
						<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
							<div className='min-w-0 flex-1 space-y-3'>
								<div className='flex flex-wrap items-center gap-2'>
									<h3 className='truncate font-semibold'>
										{project.name}
									</h3>
									<Badge variant='outline'>
										{project.key}
									</Badge>
									<Badge
										variant={getStatusBadgeVariant(
											project.status,
										)}
									>
										{project.status}
									</Badge>
								</div>

								<div className='space-y-2'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											Tiến độ
										</span>
										<span className='font-medium'>
											{project.progress}%
										</span>
									</div>
									<Progress
										value={project.progress}
										className='h-2'
									/>
								</div>

								<div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
									<span>Open: {project.openTasks}</span>
									<span>Done: {project.doneTasks}</span>
									<span>Deadline: {project.deadline}</span>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<div className='flex -space-x-3'>
									{project.members.map((member, index) => (
										<Avatar
											key={`${project.id}-${member}-${index}`}
											className='h-9 w-9 border-2 border-background'
										>
											<AvatarImage src='' />
											<AvatarFallback className='text-xs'>
												{member}
											</AvatarFallback>
										</Avatar>
									))}
								</div>

								<Button variant='outline' size='sm'>
									Mở project
								</Button>
							</div>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
