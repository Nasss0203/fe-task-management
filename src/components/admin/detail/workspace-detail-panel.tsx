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
import type {
	PlanTypeWorkspace,
	WorkspaceItem,
} from "@/services/admin/workspace/type";
import {
	ArchiveX,
	CalendarDays,
	Clock3,
	Copy,
	Crown,
	FolderKanban,
	LayoutDashboard,
	ListChecks,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
	workspace: WorkspaceItem | null;
	onClose: () => void;
	onChangePlan: (workspaceId: string, plan: PlanTypeWorkspace) => void;
};

const formatDate = (value?: string | null) => {
	if (!value) return "Chưa có dữ liệu";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Không hợp lệ";
	}

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const formatDateTime = (value?: string | null) => {
	if (!value) return "Chưa có dữ liệu";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Không hợp lệ";
	}

	return date.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getWorkspaceStatusClass = (status: WorkspaceItem["status"]) => {
	if (status === "ACTIVE") {
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
	}

	return "border-amber-500/20 bg-amber-500/10 text-amber-400";
};

const getWorkspaceStatusLabel = (status: WorkspaceItem["status"]) => {
	if (status === "ACTIVE") return "Đang hoạt động";
	return "Đã xóa mềm";
};

const getWorkspacePlanClass = (plan: WorkspaceItem["plan"]) => {
	if (plan === "pro") {
		return "border-sky-500/20 bg-sky-500/10 text-sky-400";
	}

	return "border-white/10 bg-white/5 text-neutral-300";
};

const getWorkspacePlanLabel = (plan: WorkspaceItem["plan"]) => {
	if (plan === "pro") return "Pro";
	return "Free";
};

export function WorkspaceDetailPanel({
	workspace,
	onClose,
	onChangePlan,
}: Props) {
	const [open, setOpen] = useState(Boolean(workspace));
	const [selectedPlan, setSelectedPlan] = useState<PlanTypeWorkspace>("free");

	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setOpen(Boolean(workspace));

		if (workspace) {
			setSelectedPlan(workspace.plan);
		}
	}, [workspace]);

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

	const handleCopyWorkspaceId = async () => {
		if (!workspace) return;

		await navigator.clipboard.writeText(workspace.id);
	};

	const handleSavePlan = () => {
		if (!workspace) return;

		onChangePlan(workspace.id, selectedPlan);
	};

	if (!workspace) return null;

	const isDeleted = workspace.status === "DELETED";
	const isPlanChanged = selectedPlan !== workspace.plan;

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
								Xem thông tin, owner, gói dịch vụ và thống kê sử
								dụng của workspace.
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
										Workspace ID
									</p>

									<div className='mt-1 flex items-start justify-between gap-3'>
										<p className='break-all text-white'>
											{workspace.id}
										</p>

										<Button
											type='button'
											variant='ghost'
											onClick={handleCopyWorkspaceId}
											className='h-8 shrink-0 rounded-xl border border-white/10 px-2 text-neutral-300 hover:bg-white/5 hover:text-white'
										>
											<Copy className='h-4 w-4' />
										</Button>
									</div>
								</div>

								<div>
									<p className='text-neutral-500'>
										Owner hiện tại
									</p>
									<p className='text-white'>
										{workspace.ownerName ?? "Chưa có owner"}
									</p>
									<p className='text-xs text-neutral-500'>
										{workspace.ownerEmail ?? "—"}
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
										<div className='mt-1 flex items-center gap-2 text-white'>
											<CalendarDays className='h-4 w-4 text-neutral-500' />
											{formatDate(workspace.createdAt)}
										</div>
									</div>

									<div>
										<p className='text-neutral-500'>
											Cập nhật gần nhất
										</p>
										<div className='mt-1 flex items-center gap-2 text-white'>
											<Clock3 className='h-4 w-4 text-neutral-500' />
											{formatDateTime(
												workspace.updatedAt,
											)}
										</div>
									</div>
								</div>

								{workspace.deletedAt && (
									<div className='rounded-xl border border-amber-500/20 bg-amber-500/10 p-3'>
										<div className='flex items-center gap-2 text-amber-400'>
											<ArchiveX className='h-4 w-4' />
											<p className='text-sm font-medium'>
												Workspace đã xóa mềm
											</p>
										</div>
										<p className='mt-1 text-xs text-amber-300/80'>
											Thời gian xóa:{" "}
											{formatDateTime(
												workspace.deletedAt,
											)}
										</p>
									</div>
								)}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thống kê sử dụng
							</h3>

							<div className='grid grid-cols-2 gap-3'>
								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<div className='flex items-center gap-2 text-neutral-500'>
										<Users className='h-4 w-4' />
										<p className='text-xs'>Thành viên</p>
									</div>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.membersCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<div className='flex items-center gap-2 text-neutral-500'>
										<FolderKanban className='h-4 w-4' />
										<p className='text-xs'>Project</p>
									</div>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.projectsCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<div className='flex items-center gap-2 text-neutral-500'>
										<LayoutDashboard className='h-4 w-4' />
										<p className='text-xs'>Board</p>
									</div>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.boardsCount}
									</p>
								</div>

								<div className='rounded-xl border border-white/10 bg-[#0b0b0b] p-3'>
									<div className='flex items-center gap-2 text-neutral-500'>
										<ListChecks className='h-4 w-4' />
										<p className='text-xs'>Task</p>
									</div>
									<p className='mt-1 text-lg font-semibold text-white'>
										{workspace.tasksCount}
									</p>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Chuyển gói workspace
							</h3>

							<div className='flex flex-col gap-2 sm:flex-row'>
								<select
									value={selectedPlan}
									disabled={isDeleted}
									onChange={(e) =>
										setSelectedPlan(
											e.target.value as PlanTypeWorkspace,
										)
									}
									className='h-11 min-w-0 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1'
								>
									<option value='free'>Free</option>
									<option value='pro'>Pro</option>
								</select>

								<Button
									type='button'
									disabled={isDeleted || !isPlanChanged}
									onClick={handleSavePlan}
									className='h-11 w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
								>
									<Crown className='mr-2 h-4 w-4' />
									Lưu gói
								</Button>
							</div>

							{isDeleted && (
								<p className='mt-2 text-xs text-amber-400'>
									Workspace đã xóa mềm nên chưa thể chuyển
									gói.
								</p>
							)}
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
