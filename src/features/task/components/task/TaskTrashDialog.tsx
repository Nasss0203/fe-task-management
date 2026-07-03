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
					? "Đã chuyển công việc vào thùng rác."
					: `Đã chuyển ${taskCount} công việc vào thùng rác.`,
			);
		} catch (error) {
			console.error("deleteTaskFromDialog failed", error);
			toast.error("Không thể chuyển công việc vào thùng rác.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				data-prevent-open-detail='true'
				onClick={(event) => event.stopPropagation()}
				onPointerDown={(event) => event.stopPropagation()}
				className='border-border bg-background text-foreground sm:max-w-md'
			>
				<DialogHeader>
					<DialogTitle>Chuyển task vào Thùng rác?</DialogTitle>
					<DialogDescription className='text-muted-foreground'>
						{taskCount === 1 ? (
							<>
								Task{" "}
								<span className='font-medium text-foreground'>
									{firstTaskTitle}
								</span>{" "}
								sẽ bị ẩn khỏi backlog và board. Bạn có thể khôi
								phục nó sau từ danh sách task đã xóa.
							</>
						) : (
							<>
								<span className='font-medium text-foreground'>
									{taskCount} task
								</span>{" "}
								sẽ bị ẩn khỏi backlog và board. Bạn có thể khôi
								phục chúng sau từ danh sách task đã xóa.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className='gap-2 sm:justify-end'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isDeletingTask}
					>
						Hủy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isDeletingTask || taskCount === 0}
						className='bg-red-600 text-white hover:bg-red-700'
					>
						{isDeletingTask ? "Đang chuyển..." : "Chuyển vào Thùng rác"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TaskTrashDialog;
