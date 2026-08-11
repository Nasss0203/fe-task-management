import type { TaskItem } from "@/services/task/type";

type TaskCompletionState = Pick<TaskItem, "completedAt">;

export const isTaskCompleted = (task: TaskCompletionState) =>
	Boolean(task.completedAt);

export const isTaskVisible = (task: TaskCompletionState) =>
	!isTaskCompleted(task);
