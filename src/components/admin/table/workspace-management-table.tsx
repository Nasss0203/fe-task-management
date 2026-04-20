import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock3,
	Ellipsis,
	Eye,
	Lock,
	RefreshCcw,
	ShieldCheck,
	Trash2,
	Unlock,
} from "lucide-react";
import type {
	AdminWorkspace,
	WorkspacePlan,
} from "../shared/workspace-admin.types";
import {
	formatDate,
	formatRelativeTime,
	formatStorage,
	getInitials,
	getWorkspacePlanClass,
	getWorkspacePlanLabel,
	getWorkspaceStatusClass,
	getWorkspaceStatusLabel,
} from "../shared/workspace-admin.utils";

type Props = {
	workspaces: AdminWorkspace[];
	onView: (workspace: AdminWorkspace) => void;
	onToggleLock: (workspaceId: string) => void;
	onToggleDelete: (workspaceId: string) => void;
	onChangePlan: (workspaceId: string, plan: WorkspacePlan) => void;
};

export function WorkspaceManagementTable({
	workspaces,
	onView,
	onToggleLock,
	onToggleDelete,
	onChangePlan,
}: Props) {
	if (!workspaces.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không tìm thấy workspace phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Danh sách workspace
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Quan sát owner, gói dịch vụ, trạng thái và thống kê sử
						dụng của từng workspace trên toàn hệ thống.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{workspaces.length} workspace
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1450px] border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Workspace</th>
							<th className='px-4 py-2 font-medium'>Owner</th>
							<th className='px-4 py-2 font-medium'>Gói</th>
							<th className='px-4 py-2 font-medium'>
								Trạng thái
							</th>
							<th className='px-4 py-2 font-medium'>Thống kê</th>
							<th className='px-4 py-2 font-medium'>
								Dung lượng
							</th>
							<th className='px-4 py-2 font-medium'>Ngày tạo</th>
							<th className='px-4 py-2 font-medium'>
								Hoạt động gần nhất
							</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{workspaces.map((workspace) => (
							<tr
								key={workspace.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex items-center gap-3'>
										<div className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#171717] text-sm font-semibold text-white'>
											{getInitials(workspace.name)}
										</div>

										<div className='space-y-0.5'>
											<p className='font-medium text-white'>
												{workspace.name}
											</p>
											<p className='text-xs text-neutral-500'>
												/{workspace.slug}
											</p>
										</div>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-0.5'>
										<p className='font-medium text-white'>
											{workspace.ownerName}
										</p>
										<p className='text-xs text-neutral-500'>
											{workspace.ownerEmail}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getWorkspacePlanClass(
											workspace.plan,
										)}`}
									>
										{getWorkspacePlanLabel(workspace.plan)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getWorkspaceStatusClass(
											workspace.status,
										)}`}
									>
										{getWorkspaceStatusLabel(
											workspace.status,
										)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex flex-wrap gap-2'>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{workspace.membersCount} member
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{workspace.projectsCount} project
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{workspace.boardsCount} board
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{workspace.tasksCount} task
										</span>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{formatStorage(
										workspace.storageUsedGb,
										workspace.storageLimitGb,
									)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{formatDate(workspace.createdAt)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-neutral-300'>
										<Clock3 className='h-4 w-4 text-neutral-500' />
										<span>
											{formatRelativeTime(
												workspace.lastActive,
											)}
										</span>
									</div>
								</td>

								<td className='rounded-r-3xl border-y border-r border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-60 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(workspace)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												{workspace.status !==
													"DELETED" && (
													<DropdownMenuItem
														onClick={() =>
															onToggleLock(
																workspace.id,
															)
														}
														className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
													>
														{workspace.status ===
														"LOCKED" ? (
															<>
																<Unlock className='mr-2 h-4 w-4' />
																Mở khóa
																workspace
															</>
														) : (
															<>
																<Lock className='mr-2 h-4 w-4' />
																Khóa workspace
															</>
														)}
													</DropdownMenuItem>
												)}

												<DropdownMenuItem
													onClick={() =>
														onToggleDelete(
															workspace.id,
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													{workspace.status ===
													"DELETED" ? (
														<>
															<RefreshCcw className='mr-2 h-4 w-4' />
															Khôi phục workspace
														</>
													) : (
														<>
															<Trash2 className='mr-2 h-4 w-4' />
															Xóa mềm workspace
														</>
													)}
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-white/10' />

												<DropdownMenuItem
													onClick={() =>
														onChangePlan(
															workspace.id,
															"FREE",
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													Chuyển gói Free
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														onChangePlan(
															workspace.id,
															"PRO",
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													Chuyển gói Pro
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														onChangePlan(
															workspace.id,
															"ENTERPRISE",
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													Chuyển gói Enterprise
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-white/10' />

												<DropdownMenuItem
													onClick={() =>
														onView(workspace)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<ShieldCheck className='mr-2 h-4 w-4' />
													Gán owner mới
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
