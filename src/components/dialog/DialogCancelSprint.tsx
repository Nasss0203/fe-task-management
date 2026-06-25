"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { cn } from "@/lib/utils";

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
						className="h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground text-orange-500 hover:text-orange-600"
					>
						Cancel sprint
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				aria-describedby={undefined}
				className={cn(
					"max-w-140 border border-border bg-popover p-0 text-foreground shadow-2xl",
					"sm:max-w-[400px]",
				)}
			>
				<div className='border-b border-border px-6 py-4'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold text-foreground'>
							Cancel sprint
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='space-y-4'>
						<p className='text-sm text-muted-foreground'>
							Are you sure you want to cancel the sprint{" "}
							<span className="font-semibold text-foreground">{sprintName}</span>?
							All open tasks will be moved back to the backlog.
						</p>
					</div>

					<div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => setOpen(false)}
							className='h-8 rounded-md px-4 text-xs font-semibold text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground'
						>
							Go back
						</Button>

						<Button
							type='button'
							onClick={handleCancel}
							disabled={cancelSprint.isPending}
							className='h-8 rounded-md bg-orange-600 px-4 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50'
						>
							{cancelSprint.isPending ? "Cancelling..." : "Cancel sprint"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
