"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTask } from "@/features/task/hooks/useTask";
import type { TaskItem } from "@/services/task/type";
import { toast } from "sonner";

type TaskTrashDialogProps = {
	tasks: TaskItem[];
	workspaceId: string;
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted?: () => void;
};

const TaskTrashDialog = ({
	tasks,
	workspaceId,
	projectId,
	open,
	onOpenChange,
	onDeleted,
}: TaskTrashDialogProps) => {
	const {
		deleteTask: { mutateAsync: deleteTask, isPending: isDeletingTask },
	} = useTask(workspaceId, projectId);

	const taskCount = tasks.length;
	const firstTaskTitle = tasks[0]?.title ?? "Task";

	const handleConfirm = async () => {
		if (!taskCount) return;

		try {
			await Promise.all(tasks.map((task) => deleteTask({ taskId: task.id })));
			onOpenChange(false);
			onDeleted?.();

			toast.success(
				taskCount === 1
					? "Task da duoc chuyen vao thung rac."
					: `${taskCount} task da duoc chuyen vao thung rac.`,
			);
		} catch (error) {
			console.error("deleteTaskFromDialog failed", error);
			toast.error("Khong the chuyen task vao thung rac.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				data-prevent-open-detail='true'
				onClick={(event) => event.stopPropagation()}
				onPointerDown={(event) => event.stopPropagation()}
				className='border-neutral-800 bg-neutral-950 text-neutral-100 sm:max-w-md'
			>
				<DialogHeader>
					<DialogTitle>Chuyen task vao Thung rac?</DialogTitle>
					<DialogDescription className='text-neutral-400'>
						{taskCount === 1 ? (
							<>
								Task{" "}
								<span className='font-medium text-neutral-200'>
									{firstTaskTitle}
								</span>{" "}
								se bi an khoi backlog va board. Ban co the khoi
								phuc no sau tu danh sach deleted tasks.
							</>
						) : (
							<>
								<span className='font-medium text-neutral-200'>
									{taskCount} task
								</span>{" "}
								se bi an khoi backlog va board. Ban co the khoi
								phuc chung sau tu danh sach deleted tasks.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className='rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200/80'>
					Hanh dong nay la xoa mem, khong xoa vinh vien du lieu ngay
					lap tuc.
				</div>

				<DialogFooter className='gap-2 sm:justify-end'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isDeletingTask}
					>
						Huy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isDeletingTask || taskCount === 0}
						className='bg-red-600 text-white hover:bg-red-700'
					>
						{isDeletingTask ? "Dang chuyen..." : "Chuyen vao Thung rac"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TaskTrashDialog;
