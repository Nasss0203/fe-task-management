"use client";

import { LayoutTemplate, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import { AddPeopleDialog } from "@/components/dialog/AddPeopleDialog";
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
import { SaveTemplateDialog } from "@/features/workspace-template/components/SaveTemplateDialog";

type WorkspaceMenuProps = {
	workspaceId: string;
	workspaceName?: string;
	inviteLink?: string;
	onAddPeople?: () => void;
	onStartRename?: () => void;
	onOpenSettings?: () => void;
	onDelete?: () => void;
};

export function WorkspaceMenu({
	workspaceId,
	workspaceName = "Task tracking",
	inviteLink,
	onAddPeople,
	onStartRename,
	onOpenSettings,
	onDelete,
}: WorkspaceMenuProps) {
	const [openAddPeople, setOpenAddPeople] = useState(false);
	const [openSaveTemplate, setOpenSaveTemplate] = useState(false);

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
								<span>Đổi tên workspace</span>
							</DropdownMenuItem>
						</RequirePermission>

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
								<span>Mời thêm thành viên</span>
							</DropdownMenuItem>
						</RequirePermission>

						<RequirePermission
							workspaceId={workspaceId}
							code={PERMISSIONS.WORKSPACE_UPDATE}
						>
							<DropdownMenuItem
								onClick={() => setOpenSaveTemplate(true)}
								className='gap-3'
							>
								<LayoutTemplate className='h-4 w-4' />
								<span>Lưu mẫu workspace</span>
							</DropdownMenuItem>
						</RequirePermission>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<RequirePermission
						workspaceId={workspaceId}
						code={PERMISSIONS.WORKSPACE_DELETE}
					>
						<DropdownMenuItem
							onClick={onDelete}
							className='gap-3 text-red-500 focus:text-red-500'
						>
							<Trash2 className='h-4 w-4' />
							<span>Xóa không gian</span>
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

			<SaveTemplateDialog
				workspaceId={workspaceId}
				isOpen={openSaveTemplate}
				onClose={() => setOpenSaveTemplate(false)}
			/>
		</>
	);
}
