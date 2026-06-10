import { BoardItem, BoardViewType } from "@/services/board/type";
import { type LucideIcon } from "lucide-react";
import AddBoard from "@/features/board/components/board/AddBoard";
import { BOARD_VIEW_CONFIG } from "@/features/board/components/board/view-board";
import { TabsListCustom, TabsTriggerCustom } from "../tabs";
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

	return (
		<div className='flex flex-col gap-2 ml-16 mt-2'>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as BoardViewType)}
			>
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

						{boards.length > 0 && blockId && (
							<AddBoard
								blockId={blockId}
								boards={boards}
								projectId={projectId}
								workspaceId={workspaceId}
							/>
						)}
					</div>
				</div>
				<Separator />

				<div className={`mt-2 ${isOpen ? "mb-10" : ""}`}>
					{activeBoard && ActiveViewComponent ? (
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
