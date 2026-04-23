"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, FileText, Plus } from "lucide-react";

import { WorkspaceSharePopover } from "../popover/workspace-share-popover";

type WorkspaceHeaderProps = {
	workspaceName?: string;
};

export function WorkspaceHeader({ workspaceName }: WorkspaceHeaderProps) {
	return (
		<Card className='border-0 shadow-sm'>
			<CardContent className='flex flex-col gap-6 px-6 py-4 lg:flex-row lg:items-center lg:justify-between'>
				<div className='space-y-3'>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
							<Briefcase className='h-6 w-6' />
						</div>

						<div>
							<div className='flex items-center gap-2'>
								<h1 className='text-2xl font-bold tracking-tight'>
									{workspaceName}
								</h1>
								<Badge variant='secondary'>Pro Plan</Badge>
							</div>

							<p className='text-sm text-muted-foreground'>
								Frontend Team Workspace • Tổng quan công việc,
								tiến độ và hoạt động gần đây
							</p>
						</div>
					</div>
				</div>

				<div className='flex flex-wrap gap-3'>
					<WorkspaceSharePopover />
					<Button variant='outline'>
						<FileText className='mr-2 h-4 w-4' />
						Tạo task
					</Button>
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						Tạo project
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
