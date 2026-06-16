import Image from "next/image";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WorkspaceMemberItem } from "@/services/member/type";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { useMember } from "@/features/member/hooks/useMember";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, LogOut, Trash, UserPen } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/features/auth/hooks/useUser";

interface SettingsAccessSectionProps {
	members: WorkspaceMemberItem[];
	isMembersLoading: boolean;
	workspaceId: string;
	onAddPeople: () => void;
	hideHeader?: boolean;
}

export function SettingsAccessSection({
	members,
	isMembersLoading,
	workspaceId,
	onAddPeople,
	hideHeader = false,
}: SettingsAccessSectionProps) {
	const { updateMemberRole, removeMember } = useMember({ workspaceId });
	const { user } = useUser();
	const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberItem | null>(null);
	
	const handleUpdateRole = (userId: string, roleName: string) => {
		updateMemberRole.mutate(
			{ userId, role_name: roleName },
			{
				onSuccess: () => {
					toast.success("Member role updated successfully");
				},
				onError: (error: any) => {
					toast.error(error?.response?.data?.message || "Failed to update member role");
				},
			}
		);
	};

	const handleRemoveMember = (userId: string) => {
		removeMember.mutate(userId, {
			onSuccess: () => {
				toast.success("Member removed successfully");
			},
			onError: (error: any) => {
				toast.error(error?.response?.data?.message || "Failed to remove member");
			},
		});
	};

	const isCurrentUserOwner = members.find(m => m.user_id === user?.id)?.role_name?.toLowerCase() === "owner";

	return (
		<div className='w-full space-y-4'>
			{!hideHeader && (
				<div className='flex items-center justify-between gap-4'>
					<div>
						<div className='text-sm font-semibold'>
							Thành viên hiện tại
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Quản lý thành viên và vai trò trong workspace.
						</div>
					</div>
					<RequirePermission workspaceId={workspaceId} code={PERMISSIONS.WORKSPACE_MEMBER_ADD} mode="hide">
						<button
							type='button'
							onClick={onAddPeople}
							className='rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400'
						>
							Thêm thành viên
						</button>
					</RequirePermission>
				</div>
			)}

			<div className='rounded-md border border-border'>
				<div 
					className='grid border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground'
					style={{ gridTemplateColumns: "1fr 150px 150px 150px 120px" }}
				>
					<div>Tên</div>
					<div>Ngày tham gia</div>
					<div>Số tác vụ</div>
					<div>Vai trò</div>
					<div>Thao tác</div>
				</div>
				{isMembersLoading ? (
					<div className='px-4 py-4 text-sm text-muted-foreground'>
						Đang tải danh sách thành viên...
					</div>
				) : members.length === 0 ? (
					<div className='px-4 py-4 text-sm text-muted-foreground'>
						Chưa có thành viên nào trong workspace này.
					</div>
				) : (
					members.map((member) => (
						<div
							key={member.id}
							className='grid items-center border-t border-border px-4 py-4 text-sm first:border-t-0'
							style={{ gridTemplateColumns: "1fr 150px 150px 150px 120px" }}
						>
							<div className='flex min-w-0 items-center gap-3 pr-4'>
								<div className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-xs font-bold uppercase text-white'>
									{member.avatar_url ? (
										<Image
											src={member.avatar_url}
											alt={member.full_name}
											width={32}
											height={32}
											className='size-full object-cover'
										/>
									) : (
										member.full_name?.charAt(0) ??
										member.email?.charAt(0) ??
										"U"
									)}
								</div>
								<div className='min-w-0'>
									<div className='truncate font-medium'>
										{member.full_name || member.email}
									</div>
									<div className='truncate text-xs text-muted-foreground'>
										{member.email}
									</div>
								</div>
							</div>
							<div className='text-muted-foreground text-sm'>
								{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
							</div>
							<div className='text-muted-foreground text-sm'>
								{member.taskCount || 0} tác vụ
							</div>
							<div className='uppercase text-foreground'>
								{member.role_name}
							</div>
							<div className='text-muted-foreground'>
								<RequirePermission workspaceId={workspaceId} code={PERMISSIONS.WORKSPACE_MEMBER_UPDATE_ROLE} mode="hide">
									{(() => {
										const isSelf = member.user_id === user?.id;
										const isTargetOwner = member.role_name?.toLowerCase() === 'owner';
										const canManageThisMember = isCurrentUserOwner || !isTargetOwner || isSelf;

										if (!canManageThisMember) return null;

										return (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button className="flex size-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
														<MoreHorizontal className="size-4" />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-48">
													{!isSelf && (
														<>
															<DropdownMenuSub>
																<DropdownMenuSubTrigger>
																	<UserPen className="mr-2 size-4" />
																	Đổi vai trò
																</DropdownMenuSubTrigger>
																<DropdownMenuPortal>
																	<DropdownMenuSubContent>
																		<DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "ADMIN")}>
																			Admin
																		</DropdownMenuItem>
																		<DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "MEMBER")}>
																			Member
																		</DropdownMenuItem>
																		<DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "VIEWER")}>
																			Viewer
																		</DropdownMenuItem>
																	</DropdownMenuSubContent>
																</DropdownMenuPortal>
															</DropdownMenuSub>
															<DropdownMenuSeparator />
														</>
													)}
													<DropdownMenuItem
														className="text-red-600 focus:text-red-600 cursor-pointer"
														onClick={() => setMemberToRemove(member)}
													>
														{isSelf ? (
															<>
																<LogOut className="mr-2 size-4" />
																Rời workspace
															</>
														) : (
															<>
																<Trash className="mr-2 size-4" />
																Xoá thành viên
															</>
														)}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										);
									})()}
								</RequirePermission>
							</div>
						</div>
					))
				)}
			</div>

			<Dialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{memberToRemove?.user_id === user?.id ? "Rời khỏi workspace" : "Xoá thành viên"}
						</DialogTitle>
						<DialogDescription>
							{memberToRemove?.user_id === user?.id 
								? "Bạn có chắc chắn muốn rời khỏi workspace này không? Bạn sẽ mất quyền truy cập vào các dự án bên trong." 
								: `Bạn có chắc chắn muốn xoá thành viên ${memberToRemove?.full_name || memberToRemove?.email} khỏi workspace này không?`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setMemberToRemove(null)}>Hủy</Button>
						<Button variant="destructive" onClick={() => {
							if (memberToRemove) {
								handleRemoveMember(memberToRemove.user_id);
								setMemberToRemove(null);
							}
						}}>
							{memberToRemove?.user_id === user?.id ? "Rời khỏi" : "Xoá thành viên"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
