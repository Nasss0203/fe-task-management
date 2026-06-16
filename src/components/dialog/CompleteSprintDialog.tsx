"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

type CompleteSprintDialogProps = {
	defaultSprintName?: string;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	completedWorkItemCount?: number;
	openWorkItemCount?: number;
	trigger?: React.ReactNode;
};

const BACKLOG_VALUE = "backlog";

export function CompleteSprintDialog({
	defaultSprintName = "Sprint",
	workspaceId,
	projectId,
	sprintId,
	completedWorkItemCount = 0,
	openWorkItemCount = 0,
	trigger,
}: CompleteSprintDialogProps) {
	const { completed, sprintsQuery } = useSprints({
		workspaceId,
		projectId,
	});

	const [open, setOpen] = useState(false);
	const [moveOpenItemsTo, setMoveOpenItemsTo] = useState(BACKLOG_VALUE);

	const sprints = sprintsQuery.data?.data ?? [];

	const sprintOptions = useMemo(() => {
		return sprints.filter((sprint: any) => {
			return sprint.id !== sprintId && sprint.status !== "COMPLETED";
		});
	}, [sprints, sprintId]);

	const router = useRouter();
	const { slug } = useParams();

	const handleComplete = () => {
		completed.mutate(
			{
				workspaceId,
				projectId,
				sprintId,
			},
			{
				onSuccess: () => {
					setOpen(false);
					router.push(`/dashboard/${slug}/projects/${projectId}`);
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
						className="h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground"
					>
						Complete
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				className={cn(
					"max-w-140 border border-border bg-popover p-0 text-foreground shadow-2xl",
					"sm:max-w-140",
				)}
			>
				<div className='border-b border-border px-6 py-4'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold text-foreground'>
							Complete {defaultSprintName}
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='space-y-4'>
						<p className='text-sm text-foreground'>
							This sprint contains{" "}
							<span className='font-semibold text-foreground'>
								{completedWorkItemCount}
							</span>{" "}
							completed work item
							{completedWorkItemCount > 1 ? "s" : ""} and{" "}
							<span className='font-semibold text-foreground'>
								{openWorkItemCount}
							</span>{" "}
							open work item{openWorkItemCount > 1 ? "s" : ""}.
						</p>

						<ul className='ml-5 list-disc space-y-2 text-sm text-muted-foreground'>
							<li>
								Completed work items include everything in the
								last column on the board.
							</li>
							<li>
								Open work items include everything from any
								other column on the board.
							</li>
						</ul>

						{openWorkItemCount > 0 && (
							<div className='space-y-1.5 pt-1'>
								<Label className='text-xs font-semibold text-foreground'>
									Move open work items to
								</Label>

								<Select
									value={moveOpenItemsTo}
									onValueChange={setMoveOpenItemsTo}
								>
									<SelectTrigger
										className={cn(
											"h-9 rounded-md border-border bg-background text-sm text-foreground",
											"focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
										)}
									>
										<SelectValue placeholder='Select destination' />
									</SelectTrigger>

									<SelectContent className='border-border bg-popover text-foreground'>
										<SelectItem
											value={BACKLOG_VALUE}
											className='focus:focus:bg-accent focus:text-accent-foreground'
										>
											Backlog
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => setOpen(false)}
							className='h-8 rounded-md px-4 text-xs font-semibold text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground'
						>
							Cancel
						</Button>

						<Button
							type='button'
							onClick={handleComplete}
							disabled={completed.isPending}
							className='h-8 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50'
						>
							{completed.isPending
								? "Completing..."
								: "Complete sprint"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
