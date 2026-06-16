import { Button } from "@/components/ui/button";
import type { ProjectItems } from "@/services/project/type";
import type { TaskItem } from "@/services/task/type";
import { Lock, RotateCcw } from "lucide-react";
import { formatDeletedAt } from "./types";

interface SettingsDangerSectionProps {
	canDeleteWorkspace: boolean;
	canDeleteProject: boolean;
	canDeleteTask: boolean;
	deletedProjectItems: ProjectItems[];
	isDeletedProjectsLoading: boolean;
	deletedTaskItems: TaskItem[];
	isDeletedTasksLoading: boolean;
	isRestoringProject: boolean;
	isRestoringTask: boolean;
	onMoveToTrash: () => void;
	onRestoreProject: (projectId?: string) => void;
	onRestoreTask: (taskId?: string) => void;
}

export function SettingsDangerSection({
	canDeleteWorkspace,
	canDeleteProject,
	canDeleteTask,
	deletedProjectItems,
	isDeletedProjectsLoading,
	deletedTaskItems,
	isDeletedTasksLoading,
	isRestoringProject,
	isRestoringTask,
	onMoveToTrash,
	onRestoreProject,
	onRestoreTask,
}: SettingsDangerSectionProps) {
	return (
		<div className='max-w-3xl space-y-4'>
			{/* Danger zone header */}
			<div className='rounded-md border border-red-500/20 bg-red-500/5 p-5'>
				<div className='flex items-start gap-3'>
					<Lock className='mt-0.5 size-5 text-red-300' />
					<div className='min-w-0 flex-1'>
						<div className='text-sm font-semibold text-red-200'>
							Thùng rác workspace
						</div>
						<div className='mt-1 text-sm text-red-200/70'>
							Chuyển workspace này vào thùng rác.
							Việc xóa dự án có thể được xử lý sau.
						</div>
					</div>
					{canDeleteWorkspace ? (
						<button
							type='button'
							onClick={onMoveToTrash}
							className='rounded-md border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10'
						>
							Chuyển vào thùng rác
						</button>
					) : (
						<span className='text-xs text-neutral-600'>Chỉ Owner mới có thể xóa workspace.</span>
					)}
				</div>
			</div>

			{/* Deleted projects */}
			<div className='rounded-md border border-border bg-muted/50 p-5'>
				<div className='mb-4 flex items-start justify-between gap-4'>
					<div>
						<div className='text-sm font-semibold'>
							Dự án đã xóa
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Khôi phục các dự án đã xóa tạm thời trong workspace này.
						</div>
					</div>
					<div className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground'>
						{deletedProjectItems.length} mục
					</div>
				</div>

				{isDeletedProjectsLoading ? (
					<div className='text-sm text-muted-foreground'>
						Đang tải dự án đã xóa...
					</div>
				) : deletedProjectItems.length === 0 ? (
					<div className='rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground'>
						Chưa có dự án nào trong thùng rác của workspace này.
					</div>
				) : (
					<div className='grid gap-3'>
						{deletedProjectItems.map((project) => (
							<div
								key={project.id}
								className='flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3'
							>
								<div className='min-w-0'>
									<div className='truncate text-sm font-medium text-foreground'>
										{project.name ?? "Dự án chưa có tên"}
									</div>
									<div className='mt-1 text-xs text-muted-foreground'>
										Đã xóa lúc {formatDeletedAt(project.deleted_at)}
									</div>
								</div>

								{canDeleteProject && (
									<Button
										variant='outline'
										size='sm'
										onClick={() => onRestoreProject(project.id)}
										disabled={isRestoringProject}
										className='border-border bg-transparent text-foreground hover:hover:bg-accent hover:text-accent-foreground'
									>
										<RotateCcw className='mr-2 h-4 w-4' />
										Khôi phục
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Deleted tasks */}
			<div className='rounded-md border border-border bg-muted/50 p-5'>
				<div className='mb-4 flex items-start justify-between gap-4'>
					<div>
						<div className='text-sm font-semibold'>
							Tác vụ đã xóa
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Khôi phục các tác vụ đã xóa tạm thời
							trong workspace này.
						</div>
					</div>
					<div className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground'>
						{deletedTaskItems.length} mục
					</div>
				</div>

				{isDeletedTasksLoading ? (
					<div className='text-sm text-muted-foreground'>
						Đang tải tác vụ đã xóa...
					</div>
				) : deletedTaskItems.length === 0 ? (
					<div className='rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground'>
						Chưa có tác vụ nào trong thùng rác của
						workspace này.
					</div>
				) : (
					<div className='grid gap-3'>
						{deletedTaskItems.map((task) => (
							<div
								key={task.id}
								className='flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3'
							>
								<div className='min-w-0'>
									<div className='truncate text-sm font-medium text-foreground'>
										{task.title ??
											"Tác vụ chưa có tên"}
									</div>
									<div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
										<span>
											{task.projectSeq
												? `TM-${task.projectSeq}`
												: task.id.slice(
														0,
														8,
													)}
										</span>
										{task.statusName ? (
											<span>
												Trạng thái:{" "}
												{
													task.statusName
												}
											</span>
										) : null}
										{task.priorityName ? (
											<span>
												Mức độ ưu tiên:{" "}
												{
													task.priorityName
												}
											</span>
										) : null}
										<span>
											Đã xóa lúc{" "}
											{formatDeletedAt(
												task.deletedAt,
											)}
										</span>
									</div>
								</div>

								{canDeleteTask && (
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											onRestoreTask(
												task.id,
											)
										}
										disabled={
											isRestoringTask
										}
										className='border-border bg-transparent text-foreground hover:hover:bg-accent hover:text-accent-foreground'
									>
										<RotateCcw className='mr-2 h-4 w-4' />
										Khôi phục
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
