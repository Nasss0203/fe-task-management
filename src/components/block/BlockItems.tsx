import { GripVertical, Plus, RefreshCw } from "lucide-react";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "../dropdown/dropdown-custom";
import { BoardViewType } from "./ProjectBlock";
import ProjectBlockContainer from "./ProjectBlockContainer";

interface BlockItemsProps {
	title: string;
	isOpen: boolean;
	handleUpdateDataConfigPageblock: (block: any) => void;
	projectId: string;
	workspaceId: string;
	boardId: string;
	view: BoardViewType;
}

const BlockItems = ({
	title,
	isOpen,
	projectId,
	workspaceId,
	handleUpdateDataConfigPageblock,
	boardId,
	view,
}: BlockItemsProps) => {
	return (
		<li
			className='rounded-md'
			// ref={}
		>
			<div className='group relative cursor-pointer rounded-md py-1 pl-2 hover:bg-accent-foreground/10'>
				<div className='absolute -left-16 top-0 h-full w-16' />

				<span>{title ?? "Untitled project"}</span>

				<div className='invisible pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							className='rounded-md p-1 hover:bg-neutral-700'
						>
							<Plus size={16} />
						</button>

						<DropdownMenuDemo
							onConvert={() => handleUpdateDataConfigPageblock}
						>
							<button
								type='button'
								className='rounded-md p-1 hover:bg-neutral-700'
							>
								<GripVertical size={16} />
							</button>
						</DropdownMenuDemo>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className='mt-2'>
					<ProjectBlockContainer
						projectId={projectId}
						workspaceId={workspaceId}
						initialBoardId={boardId ?? null}
						initialView={view}
						isOpen
						title={title ?? ""}
					/>
				</div>
			)}
		</li>
	);
};

export default BlockItems;

export function DropdownMenuDemo({
	children,
	onConvert,
}: {
	children: React.ReactNode;
	onConvert?: () => void;
}) {
	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 asChild>{children}</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-52' align='center' side='left'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2>Settings</DropdownMenuLabelV2>

					<DropdownMenuItemV2 onSelect={onConvert}>
						<div className='flex items-center gap-2'>
							<RefreshCw size={16} />
							<div>Chuyển đổi</div>
						</div>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
}
