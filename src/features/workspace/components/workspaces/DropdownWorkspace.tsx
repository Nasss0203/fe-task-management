"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WorkspaceSettingsDialog from "@/features/workspace/components/workspaces/WorkspaceSettingsDialog";
import WorkspaceTrashDialog from "@/features/workspace/components/workspaces/WorkspaceTrashDialog";
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import type { WorkspaceItem } from "@/services/workspace/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import {
	Ellipsis,
	ExternalLink,
	Link2,
	Pencil,
	Settings,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type WorkspaceDropdownProps = {
	workspace: WorkspaceItem;
	onStartRename?: () => void;
};

const WorkspaceDropdown = ({
	workspace,
	onStartRename,
}: WorkspaceDropdownProps) => {
	const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
	const [openTrashDialog, setOpenTrashDialog] = useState(false);
	const { setCurrentWorkspaceId } = useProjectSelectionStore();

	const handleSelectWorkspace = () => {
		setCurrentWorkspaceId(workspace.id);
	};

	const handleCopyLink = async () => {
		const targetUrl = `${window.location.origin}/dashboard/${workspace.slug}`;

		try {
			await navigator.clipboard.writeText(targetUrl);
			toast.success("Đã sao chép liên kết không gian làm việc.");
		} catch (error) {
			console.error("copyWorkspaceLink failed", error);
			toast.error("Không thể sao chép liên kết không gian làm việc.");
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className='flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground'>
						<Ellipsis size={14} />
					</div>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align='start'
					side='right'
					sideOffset={12}
					className='w-64 border-border bg-background p-1 text-foreground shadow-xl'
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
							Workspace
						</DropdownMenuLabel>

						<DropdownMenuItem
							onSelect={() => {
								window.setTimeout(() => {
									onStartRename?.();
								}, 150);
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
						>
							<Pencil size={15} />
							<span>Đổi tên workspace</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={handleCopyLink}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
						>
							<Link2 size={15} />
							<span>Sao chép liên kết</span>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/${workspace.slug}`}
								target='_blank'
								className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
							>
								<ExternalLink size={15} />
								<span>Mở trong tab mới</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='my-1 bg-muted' />

					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/${workspace.slug}/member`}
								onClick={handleSelectWorkspace}
								className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
							>
								<Users size={15} />
								<span>Quản lý thành viên</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={() => {
								handleSelectWorkspace();
								setOpenSettingsDialog(true);
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
						>
							<Settings size={15} />
							<span>Cài đặt workspace</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<RequirePermission
						workspaceId={workspace.id}
						code={PERMISSIONS.WORKSPACE_DELETE}
					>
						<DropdownMenuSeparator className='my-1 bg-muted' />
						<DropdownMenuItem
							onSelect={() => setOpenTrashDialog(true)}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'
						>
							<Trash2 size={15} />
							<span>Chuyển vào Thùng rác</span>
						</DropdownMenuItem>
					</RequirePermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<WorkspaceSettingsDialog
				workspace={workspace}
				open={openSettingsDialog}
				onOpenChange={setOpenSettingsDialog}
			/>

			<WorkspaceTrashDialog
				workspace={workspace}
				open={openTrashDialog}
				onOpenChange={setOpenTrashDialog}
			/>
		</>
	);
};

export default WorkspaceDropdown;
