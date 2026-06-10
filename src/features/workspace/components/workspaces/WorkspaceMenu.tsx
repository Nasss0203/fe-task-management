"use client";

import { Archive, Cog, Pencil, Star, Trash2, UserPlus } from "lucide-react";
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
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { AddPeopleDialog } from "@/components/dialog/AddPeopleDialog";

type WorkspaceMenuProps = {
	workspaceId: string;
	workspaceName?: string;
	inviteLink?: string;

	onAddPeople?: () => void;
	onStartRename?: () => void;
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
	onStartRename,
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
						<RequirePermission
							workspaceId={workspaceId}
							code={PERMISSIONS.WORKSPACE_UPDATE}
						>
							<DropdownMenuItem
								onSelect={() => {
									window.setTimeout(() => {
										onStartRename?.();
									}, 150);
								}}
								className='gap-3'
							>
								<Pencil className='h-4 w-4' />
								<span>Rename workspace</span>
							</DropdownMenuItem>
						</RequirePermission>

						<DropdownMenuItem onClick={onStar} className='gap-3'>
							<Star className='h-4 w-4' />
							<span>Add to starred</span>
						</DropdownMenuItem>

						<RequirePermission
							workspaceId={workspaceId}
							code={PERMISSIONS.WORKSPACE_MEMBER_ADD}
						>
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
						</RequirePermission>

						<DropdownMenuItem
							onClick={onOpenSettings}
							className='gap-3'
						>
							<Cog className='h-4 w-4' />
							<span>Space settings</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<RequirePermission
						workspaceId={workspaceId}
						code={PERMISSIONS.WORKSPACE_DELETE}
					>
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
					</RequirePermission>
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
