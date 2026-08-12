"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/constants/permissions";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePermission } from "@/features/permission/hooks/usePermission";
import WorkspaceSettingsDialog from "@/features/workspace/components/workspaces/WorkspaceSettingsDialog";
import WorkspaceTrashDialog from "@/features/workspace/components/workspaces/WorkspaceTrashDialog";
import { getFriendlyApiErrorMessage } from "@/lib/api-error-message";
import { leaveWorkspaceApi } from "@/services/member/member.service";
import { MEMBER_KEY } from "@/services/member/type";
import {
	WORKSPACE_KEY,
	type FindAllWorkspaceResponse,
	type WorkspaceItem,
} from "@/services/workspace/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Ellipsis,
	ExternalLink,
	Link2,
	LogOut,
	Pencil,
	Settings,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
	const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user } = useUser();
	const { can, isLoading: isPermissionLoading } = usePermission(workspace.id);
	const { currentWorkspaceId, setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();
	const removeSelfMember = useMutation({
		mutationFn: () => leaveWorkspaceApi(workspace.id),
	});
	const canDeleteWorkspace = can(PERMISSIONS.WORKSPACE_DELETE);
	const showTrashAction = !isPermissionLoading && canDeleteWorkspace;
	const showLeaveAction =
		!isPermissionLoading && !canDeleteWorkspace && Boolean(user?.id);

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

	const handleLeaveWorkspace = async () => {
		if (!user?.id) {
			toast.error("Không thể xác định tài khoản hiện tại.");
			return;
		}

		try {
			await removeSelfMember.mutateAsync();

			queryClient.setQueryData<FindAllWorkspaceResponse>(
				[WORKSPACE_KEY.WORKSPACE],
				(previous) => {
					if (!previous) return previous;

					return {
						...previous,
						data: previous.data.filter((item) => item.id !== workspace.id),
					};
				},
			);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [MEMBER_KEY.MEMBERS, workspace.id],
				}),
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE],
				}),
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE_ACCESS, workspace.id],
				}),
			]);

			const isCurrentWorkspace =
				currentWorkspaceId === workspace.id ||
				pathname?.startsWith(`/dashboard/${workspace.slug}`);

			setOpenLeaveDialog(false);

			if (isCurrentWorkspace) {
				setCurrentWorkspaceId(null);
				setCurrentProjectId(null);
				router.push("/dashboard");
			}

			toast.success("Đã rời khỏi workspace.");
		} catch (error) {
			toast.error(
				getFriendlyApiErrorMessage(error, "Không thể rời khỏi workspace."),
			);
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

					{(showTrashAction || showLeaveAction) && (
						<>
							<DropdownMenuSeparator className='my-1 bg-muted' />
							{showTrashAction ? (
								<DropdownMenuItem
									onSelect={() => setOpenTrashDialog(true)}
									className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'
								>
									<Trash2 size={15} />
									<span>Chuyển vào Thùng rác</span>
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									onSelect={() => setOpenLeaveDialog(true)}
									className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'
								>
									<LogOut size={15} />
									<span>Rời workspace</span>
								</DropdownMenuItem>
							)}
						</>
					)}
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

			<Dialog open={openLeaveDialog} onOpenChange={setOpenLeaveDialog}>
				<DialogContent className='border-border bg-popover text-foreground sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Rời workspace?</DialogTitle>
						<DialogDescription className='text-muted-foreground'>
							Bạn sẽ mất quyền truy cập vào workspace{" "}
							<span className='font-medium text-foreground'>
								{workspace.name}
							</span>{" "}
							và các dự án bên trong.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className='gap-2 sm:justify-end'>
						<Button
							variant='outline'
							onClick={() => setOpenLeaveDialog(false)}
							disabled={removeSelfMember.isPending}
						>
							Hủy
						</Button>
						<Button
							variant='destructive'
							onClick={handleLeaveWorkspace}
							disabled={removeSelfMember.isPending}
						>
							{removeSelfMember.isPending ? "Đang rời..." : "Rời workspace"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default WorkspaceDropdown;
