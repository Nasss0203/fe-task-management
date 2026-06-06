"use client";

import WorkspaceSettingsDialog from "@/components/workspaces/WorkspaceSettingsDialog";
import WorkspaceTrashDialog from "@/components/workspaces/WorkspaceTrashDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
			toast.success("Da sao chep lien ket workspace.");
		} catch (error) {
			console.error("copyWorkspaceLink failed", error);
			toast.error("Khong the sao chep lien ket workspace.");
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className='flex size-5 cursor-pointer items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'>
						<Ellipsis size={14} />
					</div>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align='start'
					side='right'
					sideOffset={12}
					className='w-64 border-neutral-700 bg-neutral-900 p-1 text-neutral-200 shadow-xl'
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel className='px-2 py-1.5 text-xs font-medium text-neutral-500'>
							Workspace
						</DropdownMenuLabel>

						<DropdownMenuItem
							onSelect={() => {
								window.setTimeout(() => {
									onStartRename?.();
								}, 150);
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
						>
							<Pencil size={15} />
							<span>Doi ten workspace</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={handleCopyLink}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
						>
							<Link2 size={15} />
							<span>Sao chep lien ket</span>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/${workspace.slug}`}
								target='_blank'
								className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
							>
								<ExternalLink size={15} />
								<span>Mo trong tab moi</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='my-1 bg-neutral-800' />

					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/${workspace.slug}/member`}
								onClick={handleSelectWorkspace}
								className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
							>
								<Users size={15} />
								<span>Quan ly thanh vien</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={() => {
								handleSelectWorkspace();
								setOpenSettingsDialog(true);
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
						>
							<Settings size={15} />
							<span>Cai dat workspace</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='my-1 bg-neutral-800' />

					<DropdownMenuItem
						onSelect={() => setOpenTrashDialog(true)}
						className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'
					>
						<Trash2 size={15} />
						<span>Chuyen vao Thung rac</span>
					</DropdownMenuItem>
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
