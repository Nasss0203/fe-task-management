import { BoardItem, BoardViewType } from "@/services/board/type";
import { type LucideIcon } from "lucide-react";
import AddBoard from "../board/AddBoard";
import { BOARD_VIEW_CONFIG } from "../board/view-board";
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
	blockId: string;
	title?: string;
	projectId: string;
	workspaceId: string;
	boards: BoardItem[];
	activeTab: BoardViewType;
	activeBoard?: BoardItem;
	availableTabs: AvailableTabItem[];
	isOpen?: boolean;
	setActiveTab: (value: BoardViewType) => void;
};

const ProjectBlock = ({
	title,
	blockId,
	boards,
	projectId,
	workspaceId,
	activeTab,
	activeBoard,
	availableTabs,
	isOpen,
	setActiveTab,
}: ProjectBlockProps) => {
	const ActiveViewComponent = activeBoard
		? BOARD_VIEW_CONFIG[activeBoard.viewType]?.component
		: null;

	return (
		<div className='flex flex-col gap-2'>
			{!isOpen ? (
				<>
					{boards.length > 0 && (
						<div>
							<input
								type='text'
								defaultValue={title ?? "Workspace"}
								placeholder='Workspace'
								className='text-2xl font-bold outline-none'
							/>
						</div>
					)}
				</>
			) : null}

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as BoardViewType)}
			>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1  '>
						<TabsListCustom variant='none'>
							{availableTabs.map((item) => {
								return (
									<TabsTriggerCustom
										value={item.value}
										key={item.value}
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

						{boards.length > 0 && (
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

				<div className='mt-2'>
					{activeBoard && ActiveViewComponent ? (
						<ActiveViewComponent board={activeBoard} />
					) : null}
				</div>
			</Tabs>
		</div>
	);
};

export default ProjectBlock;
