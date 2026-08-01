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
import { Trash2 } from "lucide-react";

type DeleteSprintDialogProps = {
	sprintName?: string;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	trigger?: React.ReactNode;
};

export function DeleteSprintDialog({
	sprintName = "Sprint",
	workspaceId,
	projectId,
	sprintId,
	trigger,
}: DeleteSprintDialogProps) {
	const { deleteSprint } = useSprints({
		workspaceId,
		projectId,
	});

	const [open, setOpen] = useState(false);

	const handleDelete = () => {
		deleteSprint.mutate(
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
						className='h-8 rounded-lg border-red-500/30 bg-background text-[12px] font-semibold text-red-600 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
					>
						Xóa sprint
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
						<div className='mb-3 flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400'>
							<Trash2 className='size-5' />
						</div>
						<DialogTitle className='text-lg font-semibold text-foreground'>
							Xóa sprint
						</DialogTitle>
						<DialogDescription className='text-sm leading-6 text-muted-foreground'>
							Hành động này sẽ xóa sprint khỏi dự án và không thể hoàn tác.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3'>
						<p className='text-sm leading-6 text-foreground'>
							Bạn có chắc chắn muốn xóa sprint{" "}
							<span className='font-semibold text-foreground'>"{sprintName}"</span>
							?
						</p>
						<p className='mt-1 text-xs font-medium text-red-600 dark:text-red-400'>
							Vui lòng kiểm tra lại trước khi xác nhận.
						</p>
					</div>

					<div className='mt-5 flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={deleteSprint.isPending}
							className='h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-60'
						>
							Hủy
						</Button>

						<Button
							type='button'
							onClick={handleDelete}
							disabled={deleteSprint.isPending}
							className='h-9 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500'
						>
							{deleteSprint.isPending ? "Đang xóa..." : "Xóa sprint"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
