"use client";

import {
	Archive,
	Cog,
	LayoutTemplate,
	Star,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddPeopleDialog } from "../dialog/AddPeopleDialog";

type WorkspaceMenuProps = {
	workspaceId: string;
	workspaceName?: string;
	inviteLink?: string;

	onAddPeople?: () => void;
	onOpenSettings?: () => void;
	onArchive?: () => void;
	onDelete?: () => void;
	onStar?: () => void;
};

export function WorkspaceMenu({
	workspaceId,
	workspaceName = "Task tracking",
	inviteLink,
	onAddPeople,
	onOpenSettings,
	onArchive,
	onDelete,
	onStar,
}: WorkspaceMenuProps) {
	const [openAddPeople, setOpenAddPeople] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8 rounded-md'
					>
						<span className='text-lg leading-none'>...</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align='start'
					sideOffset={8}
					className='w-64 rounded-md border bg-popover p-1 shadow-lg'
				>
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={onStar} className='gap-3'>
							<Star className='h-4 w-4' />
							<span>Add to starred</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							className='gap-3'
							onSelect={() => {
								onAddPeople?.();
								setOpenAddPeople(true);
							}}
						>
							<UserPlus className='h-4 w-4' />
							<span>Add people</span>
						</DropdownMenuItem>

						<DropdownMenuItem disabled className='gap-3'>
							<LayoutTemplate className='h-4 w-4' />
							<span>Save as template</span>
							<span className='ml-auto rounded border px-1 text-[10px] font-semibold'>
								ENTERPRISE
							</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={onOpenSettings}
							className='gap-3'
						>
							<Cog className='h-4 w-4' />
							<span>Space settings</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={onArchive} className='gap-3'>
						<Archive className='h-4 w-4' />
						<span>Archive space</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={onDelete}
						className='gap-3 text-red-500 focus:text-red-500'
					>
						<Trash2 className='h-4 w-4' />
						<span>Delete space</span>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<div className='flex items-start gap-3 px-2 py-2 text-sm'>
						<Users className='mt-0.5 h-4 w-4 text-blue-500' />
						<div className='flex flex-col'>
							<span className='font-medium'>Software space</span>
							<span className='text-xs text-muted-foreground'>
								Team-managed
							</span>
						</div>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

			<AddPeopleDialog
				open={openAddPeople}
				onOpenChange={setOpenAddPeople}
				workspaceId={workspaceId}
				workspaceName={workspaceName}
				inviteLink={inviteLink}
			/>
		</>
	);
}
