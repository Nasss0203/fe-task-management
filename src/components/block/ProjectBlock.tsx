import { BoardItem, BoardViewType } from "@/services/board/type";
import { type LucideIcon, Kanban, Table2, ListTodo, Calendar, Presentation, Image as ImageIcon, FolderKanban, ListFilter, ArrowDown } from "lucide-react";
import AddBoard from "@/features/board/components/board/AddBoard";
import { BOARD_VIEW_CONFIG } from "@/features/board/components/board/view-board";
import { TabsListCustom, TabsTriggerCustom } from "../tabs";
import { Separator } from "../ui/separator";
import { Tabs } from "../ui/tabs"; import { useBoards } from "@/features/board/hooks/useBoards";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ProjectTaskFilter } from "../filter/ProjectTaskFilter";

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

	const { createBoard, findBoard } = useBoards();

	const handleCreateBoard = async (viewType: BoardViewType, label: string) => {
		if (!blockId) return;
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

	return (
		<div className={`flex flex-col gap-2 mt-2 ${context === 'project' ? '' : 'ml-16'}`}>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as BoardViewType)}
			>
				{boards.length > 0 && (
					<>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-1  '>
								<TabsListCustom variant='none'>
									{availableTabs.map((item, index) => {
										return (
											<TabsTriggerCustom
												value={item.value}
												key={`${item.value}-${item.boardId ?? "tab"}-${index}`}
											>
												<div className='flex items-center gap-1'>
													<item.icon />
													<div className='text-sm font-medium'>
														{item.type}
													</div>
												</div>
											</TabsTriggerCustom>
										);
									})}
								</TabsListCustom>

								{blockId && (
									<AddBoard
										blockId={blockId}
										boards={boards}
										projectId={projectId}
										workspaceId={workspaceId}
									/>
								)}
							</div>

							<ProjectTaskFilter workspaceId={workspaceId} projectId={projectId} />
						</div>
						<Separator />
					</>
				)}

				<div className={`mt-2 ${isOpen ? "mb-10" : ""}`}>
					{boards.length === 0 ? (
						context === 'workspace' ? (
							<div className="flex flex-col items-start p-4 border border-dashed border-border/60 rounded-xl bg-background/30 w-full max-w-3xl ml-2 animate-in fade-in duration-500">
								<div className="flex items-center gap-2 mb-1.5">
									<div className="p-1.5 rounded-md bg-muted/50">
										<FolderKanban className="w-4 h-4 text-muted-foreground" />
									</div>
									<span className="text-sm font-medium">Dự án trống</span>
								</div>
								<p className="text-xs text-muted-foreground mb-4 ml-8">
									Chọn một chế độ xem để bắt đầu hiển thị dữ liệu trên trang này.
								</p>

								{blockId && (
									<div className="flex flex-wrap gap-2 ml-8">
										<button onClick={() => handleCreateBoard(BoardViewType.BOARD, 'Theo trạng thái')} disabled={createBoard.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
											<Kanban size={14} className="text-amber-500" /> Board
										</button>
										<button onClick={() => handleCreateBoard(BoardViewType.TABLE, 'Bảng tính')} disabled={createBoard.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
											<Table2 size={14} className="text-blue-500" /> Table
										</button>
										<button onClick={() => handleCreateBoard(BoardViewType.LIST, 'Danh sách')} disabled={createBoard.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
											<ListTodo size={14} className="text-emerald-500" /> List
										</button>
										<button onClick={() => handleCreateBoard(BoardViewType.CALENDAR, 'Lịch')} disabled={createBoard.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
											<Calendar size={14} className="text-rose-500" /> Calendar
										</button>
									</div>
								)}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 mt-20 mb-20">
								<div className="bg-muted/40 rounded-full flex items-center justify-center mb-6 ring-8 ring-muted/10 w-24 h-24">
									<FolderKanban className="w-10 h-10 text-muted-foreground/60" strokeWidth={1.5} />
								</div>
								<h3 className="text-2xl font-semibold mb-3 tracking-tight">Dự án của bạn đang trống</h3>

								{blockId && (
									<div className="bg-background/50 border shadow-sm rounded-2xl w-full max-w-3xl backdrop-blur-sm p-6 border-border/60">
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5 text-left ml-1">Chọn chế độ xem đầu tiên</h4>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
											<button onClick={() => handleCreateBoard(BoardViewType.BOARD, 'Theo trạng thái')} disabled={createBoard.isPending} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm text-foreground group text-left">
												<div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
													<Kanban size={20} />
												</div>
												<div>
													<div className="font-semibold text-base mb-0.5">Board</div>
													<div className="text-xs text-muted-foreground">Bảng Kanban</div>
												</div>
											</button>

											<button onClick={() => handleCreateBoard(BoardViewType.TABLE, 'Bảng tính')} disabled={createBoard.isPending} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-sm text-foreground group text-left">
												<div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
													<Table2 size={20} />
												</div>
												<div>
													<div className="font-semibold text-base mb-0.5">Table</div>
													<div className="text-xs text-muted-foreground">Dạng bảng lưới</div>
												</div>
											</button>

											<button onClick={() => handleCreateBoard(BoardViewType.LIST, 'Danh sách')} disabled={createBoard.isPending} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm text-foreground group text-left">
												<div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
													<ListTodo size={20} />
												</div>
												<div>
													<div className="font-semibold text-base mb-0.5">List</div>
													<div className="text-xs text-muted-foreground">Danh sách cơ bản</div>
												</div>
											</button>

											<button onClick={() => handleCreateBoard(BoardViewType.CALENDAR, 'Lịch')} disabled={createBoard.isPending} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all text-sm text-foreground group text-left">
												<div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
													<Calendar size={20} />
												</div>
												<div>
													<div className="font-semibold text-base mb-0.5">Calendar</div>
													<div className="text-xs text-muted-foreground">Theo lịch biểu</div>
												</div>
											</button>
										</div>
									</div>
								)}
							</div>
						)
					) : (
						activeBoard && ActiveViewComponent ? (
							<ActiveViewComponent
								board={activeBoard}
								context={context}
							/>
						) : null
					)}
				</div>
			</Tabs>
		</div>
	);
};

export default ProjectBlock;
