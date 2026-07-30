import { PERMISSIONS } from "@/constants/permissions";
import AddBoard from "@/features/board/components/board/AddBoard";
import { BOARD_VIEW_CONFIG } from "@/features/board/components/board/view-board";
import { useBoards } from "@/features/board/hooks/useBoards";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { BoardItem, BoardViewType } from "@/services/board/type";
import type { TaskPositionContextInput } from "@/services/task/type";
import {
	Calendar,
	FolderKanban,
	Kanban,
	ListTodo,
	Plus,
	Table2,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import DialogAddTask from "../dialog/DialogAddTask";
import { ProjectTaskFilter } from "../filter/ProjectTaskFilter";
import { TabsListCustom, TabsTriggerCustom } from "../tabs";
import { Button } from "../ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../ui/context-menu";
import { Separator } from "../ui/separator";
import { Tabs } from "../ui/tabs";

export type AvailableTabItem = {
	icon: LucideIcon;
	type: string;
	value: BoardViewType;
	boardId?: string | null;
};

type ProjectBlockProps = {
	blockId?: string;
	title?: string;
	projectId: string;
	workspaceId: string;
	boards: BoardItem[];
	activeTab: BoardViewType;
	activeBoard?: BoardItem;
	availableTabs: AvailableTabItem[];
	isOpen?: boolean;
	context?: "project" | "workspace";
	setActiveTab: (value: BoardViewType) => void;
};

const ProjectBlock = ({
	blockId,
	boards,
	projectId,
	workspaceId,
	activeTab,
	activeBoard,
	availableTabs,
	isOpen,
	context = "workspace",
	setActiveTab,
}: ProjectBlockProps) => {
	const ActiveViewComponent = activeBoard
		? BOARD_VIEW_CONFIG[activeBoard.viewType]?.component
		: null;

	const { createBoard, deleteBoard, findBoard } = useBoards();

	const activePositionContext: TaskPositionContextInput | undefined =
		activeBoard?.viewType === BoardViewType.BOARD
			? {
					context: "kanban",
					contextId: activeBoard.id,
				}
			: activeBoard?.viewType === BoardViewType.TABLE ||
				  activeBoard?.viewType === BoardViewType.LIST
				? {
						context: "list",
						contextId: activeBoard.id,
					}
				: activeBoard?.viewType === BoardViewType.BACKLOG
					? {
							context: "backlog",
							contextId: projectId,
						}
					: undefined;

	const handleCreateBoard = async (
		viewType: BoardViewType,
		label: string,
	) => {
		try {
			await createBoard.mutateAsync({
				name: label.toLowerCase(),
				viewType,
				projectId,
				workspaceId,
				blockId,
			});
			await findBoard.refetch();
		} catch (error) {
			console.error("Failed to create board:", error);
			toast.error("Không thể tạo chế độ xem. Vui lòng thử lại.");
		}
	};

	const handleDeleteBoard = async (board: BoardItem) => {
		try {
			await deleteBoard.mutateAsync({
				boardId: board.id,
				projectId,
				workspaceId,
			});
			await findBoard.refetch();
			toast.success("Đã xóa chế độ xem.");
		} catch (error) {
			console.error("Failed to delete board:", error);
			toast.error("Không thể xóa chế độ xem. Vui lòng thử lại.");
		}
	};

	return (
		<div
			className={`mt-2 flex flex-col gap-2 ${context === "project" ? "" : "ml-16"}`}
		>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as BoardViewType)}
			>
				{boards.length > 0 && (
					<>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-1'>
								<TabsListCustom variant='none'>
									{availableTabs.map((item, index) => {
										const board = item.boardId
											? boards.find(
													(candidate) =>
														candidate.id ===
														item.boardId,
												)
											: undefined;

										return (
											<ContextMenu
												key={`${item.value}-${item.boardId ?? "tab"}-${index}`}
											>
												<ContextMenuTrigger asChild>
													<div>
														<TabsTriggerCustom
															value={item.value}
														>
															<div className='flex items-center gap-1'>
																<item.icon />
																<div className='text-sm font-medium'>
																	{item.type}
																</div>
															</div>
														</TabsTriggerCustom>
													</div>
												</ContextMenuTrigger>

												{board ? (
													<ContextMenuContent className='w-44'>
														<RequirePermission
															workspaceId={
																workspaceId
															}
															code={
																PERMISSIONS.BOARD_DELETE
															}
														>
															<ContextMenuItem
																variant='destructive'
																disabled={
																	deleteBoard.isPending
																}
																onSelect={() => {
																	void handleDeleteBoard(
																		board,
																	);
																}}
															>
																<Trash2 className='size-4' />
																<span>
																	Xóa view
																</span>
															</ContextMenuItem>
														</RequirePermission>
													</ContextMenuContent>
												) : null}
											</ContextMenu>
										);
									})}
								</TabsListCustom>

								<AddBoard
									blockId={blockId}
									boards={boards}
									projectId={projectId}
									workspaceId={workspaceId}
								/>
							</div>

							<div className='flex items-center gap-2'>
								<ProjectTaskFilter
									workspaceId={workspaceId}
									projectId={projectId}
								/>
								<DialogAddTask
									workspaceId={workspaceId}
									projectId={projectId}
									positionContext={activePositionContext}
									trigger={
										<Button
											size='sm'
											className='h-8 gap-1.5 rounded-md px-3 text-xs font-medium shadow-sm'
										>
											<Plus className='size-3.5' />
											<span>Tạo công việc</span>
										</Button>
									}
								/>
							</div>
						</div>
						<Separator />
					</>
				)}

				<div className={`mt-2 ${isOpen ? "mb-10" : ""}`}>
					{boards.length === 0 ? (
						context === "workspace" ? (
							<div className='ml-2 w-full max-w-3xl animate-in rounded-xl border border-dashed border-border/60 bg-background/30 p-4 fade-in duration-500'>
								<div className='mb-1.5 flex items-center gap-2'>
									<div className='rounded-md bg-muted/50 p-1.5'>
										<FolderKanban className='h-4 w-4 text-muted-foreground' />
									</div>
									<span className='text-sm font-medium'>
										Dự án trống
									</span>
								</div>
								<p className='mb-4 ml-8 text-xs text-muted-foreground'>
									Chọn một chế độ xem để bắt đầu hiển thị dữ
									liệu trên trang này.
								</p>

								<div className='ml-8 flex flex-wrap gap-2'>
									<button
										onClick={() =>
											handleCreateBoard(
												BoardViewType.BOARD,
												"Theo trạng thái",
											)
										}
										disabled={createBoard.isPending}
										className='flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
									>
										<Kanban
											size={14}
											className='text-amber-500'
										/>{" "}
										Board
									</button>
									<button
										onClick={() =>
											handleCreateBoard(
												BoardViewType.TABLE,
												"Bảng",
											)
										}
										disabled={createBoard.isPending}
										className='flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
									>
										<Table2
											size={14}
											className='text-blue-500'
										/>{" "}
										Table
									</button>
									<button
										onClick={() =>
											handleCreateBoard(
												BoardViewType.LIST,
												"Danh sách",
											)
										}
										disabled={createBoard.isPending}
										className='flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
									>
										<ListTodo
											size={14}
											className='text-emerald-500'
										/>{" "}
										List
									</button>
									<button
										onClick={() =>
											handleCreateBoard(
												BoardViewType.CALENDAR,
												"Lịch",
											)
										}
										disabled={createBoard.isPending}
										className='flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground'
									>
										<Calendar
											size={14}
											className='text-rose-500'
										/>{" "}
										Calendar
									</button>
								</div>
							</div>
						) : (
							<div className='mb-20 mt-20 animate-in slide-in-from-bottom-4 fade-in duration-700 text-center'>
								<div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/40 ring-8 ring-muted/10'>
									<FolderKanban
										className='h-10 w-10 text-muted-foreground/60'
										strokeWidth={1.5}
									/>
								</div>
								<h3 className='mb-3 text-2xl font-semibold tracking-tight'>
									Dự án của bạn đang trống
								</h3>

								<div className='w-full max-w-3xl rounded-2xl border border-border/60 bg-background/50 p-6 shadow-sm backdrop-blur-sm'>
									<h4 className='ml-1 mb-5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
										Chọn chế độ xem đầu tiên
									</h4>
									<div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
										<button
											onClick={() =>
												handleCreateBoard(
													BoardViewType.BOARD,
													"Theo trạng thái",
												)
											}
											disabled={createBoard.isPending}
											className='group flex flex-col items-start gap-3 rounded-xl border border-border/50 p-4 text-left text-sm text-foreground transition-all hover:border-amber-500/30 hover:bg-amber-500/5'
										>
											<div className='rounded-lg bg-amber-500/10 p-2.5 text-amber-500 transition-transform group-hover:scale-110'>
												<Kanban size={20} />
											</div>
											<div>
												<div className='mb-0.5 text-base font-semibold'>
													Board
												</div>
												<div className='text-xs text-muted-foreground'>
													Bảng Kanban
												</div>
											</div>
										</button>

										<button
											onClick={() =>
												handleCreateBoard(
													BoardViewType.TABLE,
													"Bảng",
												)
											}
											disabled={createBoard.isPending}
											className='group flex flex-col items-start gap-3 rounded-xl border border-border/50 p-4 text-left text-sm text-foreground transition-all hover:border-blue-500/30 hover:bg-blue-500/5'
										>
											<div className='rounded-lg bg-blue-500/10 p-2.5 text-blue-500 transition-transform group-hover:scale-110'>
												<Table2 size={20} />
											</div>
											<div>
												<div className='mb-0.5 text-base font-semibold'>
													Table
												</div>
												<div className='text-xs text-muted-foreground'>
													Dạng bảng lưới
												</div>
											</div>
										</button>

										<button
											onClick={() =>
												handleCreateBoard(
													BoardViewType.LIST,
													"Danh sách",
												)
											}
											disabled={createBoard.isPending}
											className='group flex flex-col items-start gap-3 rounded-xl border border-border/50 p-4 text-left text-sm text-foreground transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5'
										>
											<div className='rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500 transition-transform group-hover:scale-110'>
												<ListTodo size={20} />
											</div>
											<div>
												<div className='mb-0.5 text-base font-semibold'>
													List
												</div>
												<div className='text-xs text-muted-foreground'>
													Danh sách cơ bản
												</div>
											</div>
										</button>

										<button
											onClick={() =>
												handleCreateBoard(
													BoardViewType.CALENDAR,
													"Lịch",
												)
											}
											disabled={createBoard.isPending}
											className='group flex flex-col items-start gap-3 rounded-xl border border-border/50 p-4 text-left text-sm text-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/5'
										>
											<div className='rounded-lg bg-rose-500/10 p-2.5 text-rose-500 transition-transform group-hover:scale-110'>
												<Calendar size={20} />
											</div>
											<div>
												<div className='mb-0.5 text-base font-semibold'>
													Calendar
												</div>
												<div className='text-xs text-muted-foreground'>
													Theo lịch biểu
												</div>
											</div>
										</button>
									</div>
								</div>
							</div>
						)
					) : activeBoard && ActiveViewComponent ? (
						<ActiveViewComponent
							board={activeBoard}
							context={context}
						/>
					) : null}
				</div>
			</Tabs>
		</div>
	);
};

export default ProjectBlock;
