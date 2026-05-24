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
import { useSprints } from "@/hooks/use-sprint";
import { cn } from "@/lib/utils";

type CompleteSprintDialogProps = {
	defaultSprintName?: string;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	completedWorkItemCount?: number;
	openWorkItemCount?: number;
};

const BACKLOG_VALUE = "backlog";

export function CompleteSprintDialog({
	defaultSprintName = "Sprint",
	workspaceId,
	projectId,
	sprintId,
	completedWorkItemCount = 0,
	openWorkItemCount = 0,
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
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className={cn(
						"h-8 rounded-md border border-neutral-700 bg-[#1c1c1c] px-4 text-xs font-semibold text-white",
						"hover:border-neutral-500 hover:bg-[#252525] hover:text-white",
					)}
				>
					Complete
				</Button>
			</DialogTrigger>

			<DialogContent
				className={cn(
					"max-w-140 border border-neutral-800 bg-[#171717] p-0 text-white shadow-2xl",
					"sm:max-w-140",
				)}
			>
				<div className='border-b border-neutral-800 px-6 py-4'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold text-white'>
							Complete {defaultSprintName}
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='space-y-4'>
						<p className='text-sm text-neutral-300'>
							This sprint contains{" "}
							<span className='font-semibold text-white'>
								{completedWorkItemCount}
							</span>{" "}
							completed work item
							{completedWorkItemCount > 1 ? "s" : ""} and{" "}
							<span className='font-semibold text-white'>
								{openWorkItemCount}
							</span>{" "}
							open work item{openWorkItemCount > 1 ? "s" : ""}.
						</p>

						<ul className='ml-5 list-disc space-y-2 text-sm text-neutral-400'>
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
								<Label className='text-xs font-semibold text-neutral-300'>
									Move open work items to
								</Label>

								<Select
									value={moveOpenItemsTo}
									onValueChange={setMoveOpenItemsTo}
								>
									<SelectTrigger
										className={cn(
											"h-9 rounded-md border-neutral-700 bg-[#101010] text-sm text-white",
											"focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
										)}
									>
										<SelectValue placeholder='Select destination' />
									</SelectTrigger>

									<SelectContent className='border-neutral-800 bg-[#171717] text-white'>
										<SelectItem
											value={BACKLOG_VALUE}
											className='focus:bg-[#252525] focus:text-white'
										>
											Backlog
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className='mt-6 flex justify-end gap-2 border-t border-neutral-800 pt-4'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => setOpen(false)}
							className='h-8 rounded-md px-4 text-xs font-semibold text-neutral-400 hover:bg-[#252525] hover:text-white'
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
