"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type CancelSprintDialogProps = {
	sprintName?: string;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	trigger?: React.ReactNode;
};

export function CancelSprintDialog({
	sprintName = "Sprint",
	workspaceId,
	projectId,
	sprintId,
	trigger,
}: CancelSprintDialogProps) {
	const { cancelSprint } = useSprints({
		workspaceId,
		projectId,
	});

	const [open, setOpen] = useState(false);

	const handleCancel = () => {
		cancelSprint.mutate(
			{
				workspaceId,
				projectId,
				sprintId,
			},
			{
				onSuccess: () => {
					setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ? (
					trigger
				) : (
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='h-8 rounded-lg border-orange-500/30 bg-background text-[12px] font-semibold text-orange-600 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
					>
						Hủy sprint
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				className={cn(
					"max-w-140 overflow-hidden border border-border bg-background p-0 text-foreground shadow-2xl",
					"sm:max-w-[420px]",
				)}
			>
				<div className='border-b border-border px-6 py-5'>
					<DialogHeader className='pr-8'>
						<div className='mb-3 flex size-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400'>
							<AlertTriangle className='size-5' />
						</div>
						<DialogTitle className='text-lg font-semibold text-foreground'>
							Hủy sprint
						</DialogTitle>
						<DialogDescription className='text-sm leading-6 text-muted-foreground'>
							Hành động này sẽ hủy sprint đang chạy và đưa các công việc chưa hoàn thành về backlog.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='rounded-lg border border-orange-500/20 bg-orange-500/10 px-4 py-3'>
						<p className='text-sm leading-6 text-foreground'>
							Bạn có chắc chắn muốn hủy sprint{" "}
							<span className='font-semibold text-foreground'>"{sprintName}"</span>
							?
						</p>
						<p className='mt-1 text-xs font-medium text-orange-600 dark:text-orange-400'>
							Các công việc chưa hoàn thành sẽ được chuyển về backlog.
						</p>
					</div>

					<div className='mt-5 flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={cancelSprint.isPending}
							className='h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-60'
						>
							Quay lại
						</Button>

						<Button
							type='button'
							onClick={handleCancel}
							disabled={cancelSprint.isPending}
							className='h-9 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60 dark:bg-orange-600 dark:hover:bg-orange-500'
						>
							{cancelSprint.isPending ? "Đang hủy..." : "Hủy sprint"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
