"use client";

import { Share2, Zap } from "lucide-react";
import { WorkspaceMenu } from "./WorkspaceMenu";

type WorkspaceTopHeaderProps = {
	workspaceName?: string;
	workspaceId: string;
};

export const WorkspaceTopHeader = ({
	workspaceName = "Task management",
	workspaceId,
}: WorkspaceTopHeaderProps) => {
	return (
		<div className=' pt-4'>
			<div className='mb-3 flex items-center justify-between'>
				<div className='flex flex-col gap-2'>
					<div className='text-sm text-muted-foreground'>
						Workspaces
					</div>

					<div className='flex items-center gap-2'>
						<div className='flex size-6 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white'>
							T
						</div>

						<h1 className='text-2xl font-semibold text-foreground'>
							{workspaceName}
						</h1>

						<WorkspaceMenu
							workspaceId={workspaceId}
						></WorkspaceMenu>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<button className='rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground'>
						<Share2 size={16} />
					</button>

					<button className='rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground'>
						<Zap size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
