"use client";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useRef, useState } from "react";
import type {
	AdminWorkspace,
	WorkspacePlan,
} from "../shared/workspace-admin.types";
import {
	formatDate,
	formatStorage,
	getWorkspaceMemberRoleClass,
	getWorkspacePlanClass,
	getWorkspacePlanLabel,
	getWorkspaceStatusClass,
	getWorkspaceStatusLabel,
} from "../shared/workspace-admin.utils";

type Props = {
	workspace: AdminWorkspace | null;
	onClose: () => void;
	onAssignOwner: (workspaceId: string, ownerId: string) => void;
	onChangePlan: (workspaceId: string, plan: WorkspacePlan) => void;
};

export function WorkspaceDetailPanel({
	workspace,
	onClose,
	onAssignOwner,
	onChangePlan,
}: Props) {
	const [open, setOpen] = useState(Boolean(workspace));
	const [selectedOwnerId, setSelectedOwnerId] = useState(
		workspace?.ownerId ?? "",
	);
	const [selectedPlan, setSelectedPlan] = useState<WorkspacePlan>(
		workspace?.plan ?? "FREE",
	);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
			}
		};
	}, []);

	const handleRequestClose = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		setOpen(false);

		closeTimerRef.current = setTimeout(() => {
			onClose();
		}, 300);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			handleRequestClose();
			return;
		}

		setOpen(true);
	};

	if (!workspace) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết workspace
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Theo dõi thống kê, chuyển gói và gán owner mới
								cho workspace.
							</DrawerDescription>
						</div>

						<Button
							type='button'
							variant='ghost'
							onClick={handleRequestClose}
							className='h-9 rounded-xl border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white'
						>
							Close
						</Button>
					</div>
				</DrawerHeader>

				<div className='no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-4'>
					<div className='space-y-4'>
						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thông tin cơ bản
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-neutral-500'>
										Tên workspace
									</p>
									<p className='text-white'>
										{workspace.name}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Slug</p>
									<p className='text-white'>
										/{workspace.slug}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>
										Owner hiện tại
									</p>
									<p className='text-white'>
										{workspace.ownerName}
									</p>
									<p className='text-xs text-neutral-500'>
										{workspace.ownerEmail}
									</p>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getWorkspaceStatusClass(
											workspace.status,
										)}`}
									>
										{getWorkspaceStatusLabel(
											workspace.status,
										)}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getWorkspacePlanClass(
											workspace.plan,
										)}`}
									>
										{getWorkspacePlanLabel(workspace.plan)}
									</span>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Ngày tạo
										</p>
										<p className='text-white'>
											{formatDate(workspace.createdAt)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Hoạt động gần nhất
										</p>
										<p className='text-white'>
											{formatDate(workspace.lastActive)}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thống kê sử dụng
							</h3>

							<div className='grid grid-cols-2 gap-3'>
								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<p className='text-xs text-neutral-500'>
										Thành viên
									</p>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.membersCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<p className='text-xs text-neutral-500'>
										Project
									</p>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.projectsCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<p className='text-xs text-neutral-500'>
										Board
									</p>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.boardsCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<p className='text-xs text-neutral-500'>
										Task
									</p>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.tasksCount}
									</p>
								</div>
							</div>

							<div className='mt-3 rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
								<p className='text-xs text-neutral-500'>
									Dung lượng sử dụng
								</p>
								<p className='mt-1 text-lg font-semibold text-white'>
									{formatStorage(
										workspace.storageUsedGb,
										workspace.storageLimitGb,
									)}
								</p>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Chuyển gói workspace
							</h3>

							<div className='flex flex-col gap-2 sm:flex-row'>
								<select
									value={selectedPlan}
									onChange={(e) =>
										setSelectedPlan(
											e.target.value as WorkspacePlan,
										)
									}
									className='h-11 min-w-0 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none focus:border-white/20 sm:flex-1'
								>
									<option value='FREE'>Free</option>
									<option value='PRO'>Pro</option>
									<option value='ENTERPRISE'>
										Enterprise
									</option>
								</select>

								<Button
									type='button'
									onClick={() =>
										onChangePlan(workspace.id, selectedPlan)
									}
									className='h-11 w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 sm:w-auto'
								>
									Lưu gói
								</Button>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Gán owner mới
							</h3>

							<div className='flex flex-col gap-2 sm:flex-row'>
								<select
									value={selectedOwnerId}
									onChange={(e) =>
										setSelectedOwnerId(e.target.value)
									}
									className='h-11 min-w-0 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none focus:border-white/20 sm:flex-1'
								>
									{workspace.members.map((member) => (
										<option
											key={member.id}
											value={member.id}
										>
											{member.name} - {member.email}
										</option>
									))}
								</select>

								<Button
									type='button'
									onClick={() =>
										onAssignOwner(
											workspace.id,
											selectedOwnerId,
										)
									}
									className='h-11 w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 sm:w-auto'
								>
									Gán owner
								</Button>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thành viên chính
							</h3>

							<div className='space-y-3'>
								{workspace.members.map((member) => (
									<div
										key={member.id}
										className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
									>
										<div className='flex items-center justify-between gap-4'>
											<div className='min-w-0'>
												<p className='truncate text-sm font-medium text-white'>
													{member.name}
												</p>
												<p className='truncate text-xs text-neutral-500'>
													{member.email}
												</p>
											</div>

											<span
												className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${getWorkspaceMemberRoleClass(
													member.role,
												)}`}
											>
												{member.role}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Lịch sử hoạt động
							</h3>

							<div className='space-y-4'>
								{workspace.activities.map((activity, index) => (
									<div
										key={activity.id}
										className='flex gap-3'
									>
										<div className='flex flex-col items-center'>
											<div className='mt-1 h-2.5 w-2.5 rounded-full bg-white' />
											{index !==
												workspace.activities.length -
													1 && (
												<div className='mt-2 h-full w-px bg-white/10' />
											)}
										</div>

										<div className='pb-2'>
											<p className='text-sm font-medium text-white'>
												{activity.action}
											</p>
											<p className='mt-1 text-xs text-neutral-500'>
												{formatDate(activity.time)}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<DrawerFooter className='border-t border-white/10 px-6 py-4'>
					<Button
						variant='outline'
						onClick={handleRequestClose}
						className='h-11 rounded-2xl border-white/10 bg-[#111111] text-white hover:bg-white/5 hover:text-white'
					>
						Close
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
