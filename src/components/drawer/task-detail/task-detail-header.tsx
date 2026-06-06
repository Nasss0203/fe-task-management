"use client";

import { X } from "lucide-react";
import { DrawerClose } from "../../ui/drawer";

type TaskDetailHeaderProps = {
	taskLabel: string;
	title: string;
};

export function TaskDetailHeader({ taskLabel, title }: TaskDetailHeaderProps) {
	return (
		<div className='border-b border-border bg-background px-5 py-5 sm:px-6'>
			<div className='flex items-start justify-between gap-4'>
				<div className='min-w-0'>
					<div className='text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
						{taskLabel}
					</div>
					<h2 className='mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-[2.25rem]'>
						{title}
					</h2>
				</div>

				<div className='flex items-center gap-2'>
					<DrawerClose asChild>
						<button
							type='button'
							aria-label='Close task details'
							className='inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
						>
							<X className='size-4' />
						</button>
					</DrawerClose>
				</div>
			</div>
		</div>
	);
}
