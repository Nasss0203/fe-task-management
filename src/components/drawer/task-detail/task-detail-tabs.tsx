"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	useDeleteTask,
	useTaskStatus,
	useUpdateTask,
} from "@/features/task/hooks/useTask";
import { isTaskCompleted } from "@/lib/task-completion";
import { getTaskStatusKey } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import { ActivityResponseDto } from "@/services/activity/type";
import { generateTaskSubtasksApi } from "@/services/ai-assistant/ai-assistant.service";
import { type TaskCommentItem } from "@/services/comment/type";
import { type TaskItem, TASK_KEY } from "@/services/task/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AtSign,
	Calendar,
	Check,
	Link2,
	MessageSquareText,
	MoreHorizontal,
	Paperclip,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { TaskActivityFeed } from "./task-activity-feed";
import { getInitials } from "./task-detail-utils";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { PERMISSIONS } from "@/constants/permissions";

type TaskDetailTabsProps = {
	workspaceId: string;
	projectId: string;
	parentTaskId: string;
	subtasks: TaskItem[];
	subtaskDraft: string;
	onSubtaskDraftChange: (value: string) => void;
	onCreateSubtask: () => void | Promise<void>;
	isReadOnly?: boolean;
	isCreatingSubtask?: boolean;
	isLoadingSubtasks?: boolean;
	comments: TaskCommentItem[];
	currentUsername: string;
	currentUserAvatar?: string | null;
	currentUserId?: string;
	commentDraft: string;
	composerOpen: boolean;
	onComposerFocus: () => void;
	onCommentDraftChange: (value: string) => void;
	onCancelComment?: () => void;
	onSaveComment?: () => void;
	isSavingComment?: boolean;
	editingCommentId?: string | null;
	onEditComment?: (commentId: string, content: string) => void;
	onDeleteComment?: (commentId: string) => void;
	isUpdatingComment?: boolean;
	isDeletingComment?: boolean;
	activities?: ActivityResponseDto[];
	isLoadingActivities?: boolean;
};

function SubtaskCard({
	item,
	workspaceId,
	projectId,
	parentTaskId,
	isReadOnly = false,
}: {
	item: TaskItem;
	workspaceId: string;
	projectId: string;
	parentTaskId: string;
	isReadOnly?: boolean;
}) {
	const queryClient = useQueryClient();
	const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask(
		workspaceId,
		projectId,
	);
	const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask(
		workspaceId,
		projectId,
	);
	const { data: statusData } = useTaskStatus(workspaceId, projectId);

	const statuses = React.useMemo(() => statusData?.data ?? [], [statusData]);

	const isDone = isTaskCompleted(item);

	const handleToggle = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isReadOnly || isUpdating || statuses.length === 0) return;

		const doneStatus =
			statuses.find(
				(s) =>
					s.isDone || getTaskStatusKey(s.name, s.isDone) === "done",
			) || statuses[statuses.length - 1];

		const todoStatus =
			statuses.find(
				(s) =>
					!s.isDone && getTaskStatusKey(s.name, s.isDone) === "todo",
			) ||
			statuses.find((s) => !s.isDone) ||
			statuses[0];

		const targetStatus = isDone ? todoStatus : doneStatus;

		try {
			await updateTask({
				id: item.id,
				statusId: targetStatus.id,
			});
			void queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK, parentTaskId],
			});
		} catch (err) {
			console.error("Failed to toggle subtask status:", err);
		}
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isReadOnly || isDeleting) return;

		try {
			await deleteTask({ taskId: item.id });
			void queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK, parentTaskId],
			});
		} catch (err) {
			console.error("Failed to delete subtask:", err);
		}
	};

	const isOverdue = React.useMemo(() => {
		if (!item.dueAt) return false;
		try {
			return new Date(item.dueAt) < new Date();
		} catch {
			return false;
		}
	}, [item.dueAt]);

	return (
		<div className='group flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card px-3 py-2 hover:bg-muted/30 transition-all duration-200'>
			<div className='flex items-center gap-2.5 min-w-0 flex-1'>
				<button
					type='button'
					onClick={handleToggle}
					disabled={isReadOnly || isUpdating}
					className={cn(
						"flex size-[18px] shrink-0 items-center justify-center rounded-full border cursor-pointer transition-all duration-200",
						isDone
							? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
							: "border-muted-foreground/30 bg-background text-transparent hover:border-primary/50",
					)}
				>
					<Check
						className={cn(
							"size-3 stroke-[3]",
							isDone
								? "opacity-100 scale-100"
								: "opacity-0 scale-50",
							"transition-all duration-200",
						)}
					/>
				</button>

				<div className='flex items-center gap-2 min-w-0 flex-1'>
					<span
						className={cn(
							"text-[13px] font-medium text-foreground transition-all duration-200 truncate",
							isDone && "text-muted-foreground/60 line-through",
						)}
					>
						{item.title || "Tác vụ con không tên"}
					</span>

					{item.dueAt && (
						<span
							className={cn(
								"inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0",
								isOverdue &&
									!isDone &&
									"bg-destructive/10 text-destructive dark:bg-destructive/20",
							)}
						>
							<Calendar className='size-2.5' />
							{format(new Date(item.dueAt), "dd/MM")}
						</span>
					)}
				</div>
			</div>

			<div className='flex items-center gap-2 shrink-0'>
				{item.assignees && item.assignees.length > 0 && (
					<div className='flex -space-x-1 items-center'>
						{item.assignees.slice(0, 3).map((assignee) => (
							<Avatar
								key={assignee.userId}
								className='size-[18px] border border-background'
							>
								<AvatarImage
									src={assignee.avatarUrl ?? undefined}
									alt={
										assignee.fullName ??
										assignee.username ??
										"Assignee"
									}
								/>
								<AvatarFallback className='bg-muted text-[8px] font-bold text-foreground flex items-center justify-center'>
									{getInitials(
										assignee.fullName ??
											assignee.username ??
											"?",
									)}
								</AvatarFallback>
							</Avatar>
						))}
						{item.assignees.length > 3 && (
							<span className='text-[9px] font-semibold text-muted-foreground pl-1'>
								+{item.assignees.length - 3}
							</span>
						)}
					</div>
				)}

				<RequirePermission
					workspaceId={workspaceId}
					code={PERMISSIONS.TASK_DELETE}
					mode="hide"
				>
					<button
						type='button'
						onClick={handleDelete}
						disabled={isReadOnly || isDeleting}
						className='opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-destructive transition-all cursor-pointer'
					>
						<X className='size-3.5' />
					</button>
				</RequirePermission>
			</div>
		</div>
	);
}

export function TaskDetailTabs({
	workspaceId,
	projectId,
	parentTaskId,
	subtasks,
	subtaskDraft,
	onSubtaskDraftChange,
	onCreateSubtask,
	isReadOnly = false,
	isCreatingSubtask = false,
	isLoadingSubtasks = false,
	comments,
	currentUsername,
	currentUserAvatar,
	currentUserId,
	commentDraft,
	composerOpen,
	onComposerFocus,
	onCommentDraftChange,
	onCancelComment,
	onSaveComment,
	isSavingComment,
	editingCommentId,
	onEditComment,
	onDeleteComment,
	isUpdatingComment,
	isDeletingComment,
	activities = [],
	isLoadingActivities = false,
}: TaskDetailTabsProps) {
	const queryClient = useQueryClient();
	const completedCount = React.useMemo(() => {
		return subtasks.filter(isTaskCompleted).length;
	}, [subtasks]);

	const totalCount = subtasks.length;
	const completionPercentage =
		totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	const { mutate: generateSubtasks, isPending: isGenerating } = useMutation({
		mutationFn: () => generateTaskSubtasksApi(parentTaskId),
		onSuccess: () => {
			toast.success("Đã tạo các tác vụ con bằng AI thành công!");
			void queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK, parentTaskId],
			});
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Tạo tác vụ con thất bại",
			);
		},
	});

	const handleSubtaskSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isReadOnly || !subtaskDraft.trim() || isCreatingSubtask) {
			return;
		}

		void onCreateSubtask();
	};

	if (!comments) return null;

	return (
		<Tabs defaultValue='subtasks' className='gap-0'>
			<TabsList
				variant='line'
				className='w-full justify-start gap-8 rounded-none  p-0 text-muted-foreground'
			>
				<TabsTrigger
					value='subtasks'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Tác vụ con
				</TabsTrigger>
				<TabsTrigger
					value='comments'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Comments
					<span className='inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
						{comments.length}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value='activities'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Hoạt động
					{activities.length > 0 && (
						<span className='ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
							{activities.length}
						</span>
					)}
				</TabsTrigger>
			</TabsList>

			<TabsContent value='subtasks' className='pt-6'>
				<div className='space-y-4'>
					<div className='flex justify-between items-center text-xs text-muted-foreground mb-1'>
						{totalCount > 0 ? (
							<span className='font-medium text-foreground'>
								{completedCount}/{totalCount} hoàn thành
							</span>
						) : (
							<span className='font-medium text-foreground'>
								Tác vụ con ({totalCount})
							</span>
						)}
						<div className='flex items-center gap-2'>
							{totalCount > 0 && (
								<span className='font-semibold'>
									{Math.round(completionPercentage)}%
								</span>
							)}
							{/* <Button
								type="button"
								variant="ghost"
								onClick={() => generateSubtasks()}
								disabled={isGenerating}
								className="h-7 gap-1.5 px-2.5 text-primary hover:text-primary hover:bg-primary/10 text-xs rounded-md border border-primary/20 bg-primary/5 font-medium transition-all duration-200"
							>
								{isGenerating ? (
									<>
										<Loader2 className="size-3.5 animate-spin" />
										Đang tạo...
									</>
								) : (
									<>
										<Sparkles className="size-3.5 text-primary" />
										Gợi ý bằng AI
									</>
								)}
							</Button> */}
						</div>
					</div>

					{totalCount > 0 && (
						<div className='h-1 w-full bg-muted rounded-full overflow-hidden mb-4'>
							<div
								className='h-full bg-primary rounded-full transition-all duration-300 ease-out'
								style={{ width: `${completionPercentage}%` }}
							/>
						</div>
					)}

					<form
						onSubmit={handleSubtaskSubmit}
						className='flex items-center gap-2 border-b border-border/40 py-1.5 focus-within:border-primary/50 transition-colors'
					>
						<Plus className='size-4 text-muted-foreground/60 shrink-0' />
						<Input
							value={subtaskDraft}
							onChange={(event) =>
								onSubtaskDraftChange(event.target.value)
							}
							placeholder='Thêm tác vụ con...'
							disabled={isReadOnly || isCreatingSubtask}
							className='h-8 w-full border-none bg-transparent p-0 shadow-none focus-visible:ring-0 text-[13px] placeholder:text-muted-foreground/50 placeholder:px-3'
						/>
					</form>

					{isLoadingSubtasks ? (
						<div className='py-8 text-center text-xs text-muted-foreground/75 font-medium'>
							Đang tải tác vụ con...
						</div>
					) : subtasks.length ? (
						<div className='space-y-1.5'>
							{subtasks.map((subtask) => (
								<SubtaskCard
									key={subtask.id}
									item={subtask}
									workspaceId={workspaceId}
									projectId={projectId}
									parentTaskId={parentTaskId}
									isReadOnly={isReadOnly}
								/>
							))}
						</div>
					) : (
						<div className='py-8 text-center text-xs text-muted-foreground/75 font-medium'>
							Chưa có tác vụ con.
						</div>
					)}
				</div>
			</TabsContent>

			<TabsContent value='comments' className='pt-6'>
				<div className='space-y-5'>
					<div className='text-2xl font-bold tracking-tight text-foreground'>
						Bình luận
					</div>

					{comments.length ? (
						<div className='space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
							{comments.map((comment) => (
								<div key={comment.id} className='flex gap-3'>
									<Avatar className='size-10 border border-border'>
										<AvatarImage
											src={
												comment.authorAvatarUrl ??
												undefined
											}
											alt={
												comment.authorName ??
												"Unknown User"
											}
										/>
										<AvatarFallback className='bg-muted text-xs font-semibold text-foreground'>
											{getInitials(
												comment.authorName ?? "Unknown",
											)}
										</AvatarFallback>
									</Avatar>

									<div className='min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 py-4 shadow-xs relative group'>
										<div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
											<div className='flex items-center gap-2'>
												<span className='font-semibold text-foreground'>
													{comment.authorName ??
														"Unknown User"}
												</span>
												<span className='text-muted-foreground'>
													{format(
														new Date(
															comment.createdAt,
														),
														"dd/MM/yyyy HH:mm",
													)}
												</span>
												{comment.isEdited && (
													<span className='text-muted-foreground text-xs italic'>
														(đã chỉnh sửa)
													</span>
												)}
											</div>
											{!isReadOnly &&
												currentUserId === comment.authorId && (
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<Button
															variant='ghost'
															size='icon'
															className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2'
														>
															<MoreHorizontal className='h-4 w-4 text-muted-foreground' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align='end'
														className='w-40'
													>
														<DropdownMenuItem
															onClick={() =>
																onEditComment?.(
																	comment.id,
																	comment.content,
																)
															}
														>
															<Pencil className='mr-2 h-4 w-4' />
															Chỉnh sửa
														</DropdownMenuItem>
														<DropdownMenuItem
															className='text-destructive focus:bg-destructive/10 focus:text-destructive'
															onClick={() =>
																onDeleteComment?.(
																	comment.id,
																)
															}
															disabled={
																isDeletingComment
															}
														>
															<Trash2 className='mr-2 h-4 w-4' />
															Xóa
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>

										<p
											className={cn(
												"mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground",
												editingCommentId ===
													comment.id && "opacity-50",
											)}
										>
											{comment.content}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-sm text-muted-foreground'>
							Chưa có bình luận. Hãy thêm bình luận ở dưới.
						</div>
					)}

					<div className='flex gap-3'>
						<Avatar className='size-10 border border-border'>
							<AvatarImage
								src={currentUserAvatar ?? undefined}
								alt={currentUsername}
							/>
							<AvatarFallback className='bg-muted text-xs font-semibold text-foreground'>
								{getInitials(currentUsername)}
							</AvatarFallback>
						</Avatar>

						<div className='min-w-0 flex-1 rounded-2xl border border-border bg-card shadow-xs'>
							{composerOpen ? (
								<div className='flex items-center gap-1 border-b border-border px-3 py-2'>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										disabled={isReadOnly}
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<Paperclip className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										disabled={isReadOnly}
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<AtSign className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										disabled={isReadOnly}
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<Link2 className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										disabled={isReadOnly}
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<MessageSquareText className='size-3.5' />
									</Button>
								</div>
							) : null}

							<Textarea
								id='comment-composer'
								value={commentDraft}
								onFocus={onComposerFocus}
								onChange={(event) =>
									onCommentDraftChange(event.target.value)
								}
								placeholder='Nhập nội dung cập nhật hoặc ghi chú tại đây...'
								disabled={isReadOnly}
								className='min-h-[120px] resize-none border-0 bg-transparent px-4 py-4 text-sm text-foreground shadow-none focus-visible:ring-0'
							/>

							{composerOpen ? (
								<div className='flex items-center justify-between gap-3 border-t border-border px-4 py-3'>
									<div className='text-xs text-muted-foreground'></div>
									<div className='flex items-center gap-2'>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={onCancelComment}
											className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
										>
											Hủy
										</Button>
										<Button
											type='button'
											size='sm'
											onClick={onSaveComment}
											disabled={
												isReadOnly ||
												!commentDraft.trim() ||
												isSavingComment ||
												isUpdatingComment
											}
											className='rounded-xl'
										>
											{editingCommentId
												? isUpdatingComment
													? "Đang cập nhật..."
													: "Cập nhật"
												: isSavingComment
													? "Đang lưu..."
													: "Lưu"}
										</Button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</TabsContent>

			<TabsContent value='activities' className='pt-6'>
				<TaskActivityFeed
					activities={activities}
					isLoading={isLoadingActivities}
				/>
			</TabsContent>
		</Tabs>
	);
}
