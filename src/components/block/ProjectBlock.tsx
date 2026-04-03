import { Plus, type LucideIcon } from "lucide-react";
import CalendarApp from "../calendar/calendar";
import { ProviderDragDrop } from "../dnd";
import { TabsListCustom, TabsTriggerCustom } from "../tabs";
import { Tabs, TabsContent } from "../ui/tabs";

export enum BoardViewType {
	BOARD = "BOARD",
	CALENDAR = "CALENDAR",
}

export type BoardItem = {
	id: string;
	name: string;
	viewType: BoardViewType;
	projectId: string;
	workspaceId: string;
};

type AvailableTabItem = {
	icon: LucideIcon;
	type: string;
	value: BoardViewType;
};

type ProjectBlockProps = {
	title?: string;
	projectId: string;
	workspaceId: string;
	boards: BoardItem[];
	activeTab: BoardViewType;
	availableTabs: AvailableTabItem[];
	boardBoard?: BoardItem;
	isOpen?: boolean;
	calendarBoard?: BoardItem;
	setActiveTab: (value: BoardViewType) => void;
};

const ProjectBlock = ({
	title,
	boards,
	activeTab,
	availableTabs,
	boardBoard,
	calendarBoard,
	isOpen,
	projectId,
	workspaceId,
	setActiveTab,
}: ProjectBlockProps) => {
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
					<div className='flex items-center gap-1'>
						<TabsListCustom variant='none'>
							{availableTabs.map((item) => (
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
							))}
						</TabsListCustom>

						{boards.length > 0 && (
							<button className='flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300'>
								<Plus className='size-4' />
							</button>
						)}
					</div>
				</div>

				{boardBoard && (
					<TabsContent value={BoardViewType.BOARD}>
						<ProviderDragDrop
							workspaceId={workspaceId}
							projectId={projectId}
						/>
					</TabsContent>
				)}

				{calendarBoard && (
					<TabsContent value={BoardViewType.CALENDAR}>
						<CalendarApp />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
};

export default ProjectBlock;
