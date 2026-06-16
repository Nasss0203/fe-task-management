"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import type { WorkspaceItem } from "@/services/workspace/type";
import {
	ArrowLeft,
	CheckCircle2,
	RefreshCw,
	RotateCcw,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const formatDeletedAt = (value?: string | null) => {
	if (!value) return "recently";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "recently";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const DeletedWorkspacesPage = () => {
	const {
		workspaceTrash: { data, isLoading, isError, refetch },
		restoreWorkspace,
		removeWorkspaceFromUserTrash,
	} = useWorkspace();

	const [workspaceToRemove, setWorkspaceToRemove] =
		useState<WorkspaceItem | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isBulkRestoring, setIsBulkRestoring] = useState(false);
	const [isBulkRemoving, setIsBulkRemoving] = useState(false);
	const [bulkRemoveConfirm, setBulkRemoveConfirm] = useState(false);

	const workspaces: WorkspaceItem[] = data?.data ?? [];

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(workspaces.map((w) => w.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => [...prev, id]);
		} else {
			setSelectedIds((prev) => prev.filter((i) => i !== id));
		}
	};

	const handleBulkRestore = async () => {
		if (selectedIds.length === 0) return;
		setIsBulkRestoring(true);
		try {
			await Promise.all(
				selectedIds.map((id) => restoreWorkspace.mutateAsync(id)),
			);
			toast.success(
				`${selectedIds.length} không gian làm việc đã được khôi phục.`,
			);
			setSelectedIds([]);
		} catch (error) {
			console.error("bulk restore failed", error);
			toast.error("Có lỗi khi khôi phục không gian làm việc.");
		} finally {
			setIsBulkRestoring(false);
		}
	};

	const handleBulkRemove = async () => {
		if (selectedIds.length === 0) return;
		setIsBulkRemoving(true);
		try {
			await Promise.all(
				selectedIds.map((id) =>
					removeWorkspaceFromUserTrash.mutateAsync(id),
				),
			);
			toast.success(
				`Đã xóa ${selectedIds.length} không gian làm việc khỏi thùng rác.`,
			);
			setSelectedIds([]);
			setBulkRemoveConfirm(false);
		} catch (error) {
			console.error("bulk remove failed", error);
			toast.error("Có lỗi khi xóa không gian làm việc.");
		} finally {
			setIsBulkRemoving(false);
		}
	};

	const handleRestore = async (workspaceId: string) => {
		try {
			await restoreWorkspace.mutateAsync(workspaceId);
			toast.success("Không gian làm việc đã được khôi phục.");
		} catch (error) {
			console.error("restoreWorkspace failed", error);
			toast.error("Không thể khôi phục không gian làm việc.");
		}
	};

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
				Đang tải không gian làm việc đã xóa...
			</div>
		);
	}

	if (isError) {
		return (
			<Card className='border-border bg-card text-card-foreground'>
				<CardHeader>
					<CardTitle>Không tải được thùng rác không gian làm việc</CardTitle>
					<CardDescription>
						Thử tải lại để lấy danh sách không gian làm việc đã xóa.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant='outline' onClick={() => refetch()}>
						<RefreshCw className='mr-2 h-4 w-4' />
						Tải lại
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<div className='text-sm text-muted-foreground'>Thùng rác</div>
					<h1 className='text-3xl font-semibold text-foreground'>
						Không gian làm việc đã xóa
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Không gian làm việc đã xóa mềm sẽ hiện ở đây để bạn khôi phục lại.
					</p>
				</div>

				<Button asChild variant='outline'>
					<Link href='/dashboard'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Quay lại bảng điều khiển
					</Link>
				</Button>
			</div>

			{workspaces.length === 0 ? (
				<Card className='border-dashed border-border bg-card text-card-foreground'>
					<CardContent className='flex flex-col items-center justify-center gap-3 py-14 text-center'>
						<div className='rounded-full border border-border bg-muted/50 p-4'>
							<Trash2 className='h-6 w-6 text-muted-foreground' />
						</div>
						<div>
							<div className='text-base font-medium'>
								Chưa có không gian làm việc nào trong thùng rác
							</div>
							<div className='mt-1 text-sm text-muted-foreground'>
								Khi bạn xóa không gian làm việc, nó sẽ hiện ở đây.
							</div>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className='grid gap-3'>
					{workspaces.map((workspace) => (
						<div
							key={workspace.id}
							className='flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md'
						>
							<div className='min-w-0 flex-1 flex items-center gap-4'>
								<Checkbox
									checked={selectedIds.includes(workspace.id)}
									onCheckedChange={(checked) =>
										handleSelectOne(
											workspace.id,
											checked as boolean,
										)
									}
								/>
								<div>
									<h3 className='truncate text-[15px] font-semibold text-foreground'>
										{workspace.name}
									</h3>
									<div className='mt-1 text-[13px] text-muted-foreground'>
										Đã xóa vào{" "}
										{formatDeletedAt(workspace.deletedAt)}
									</div>
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<Button
									variant='outline'
									size='sm'
									className='h-8 shrink-0 rounded-lg border-border bg-background text-[12px] font-medium text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm transition-all'
									onClick={() => handleRestore(workspace.id)}
									disabled={restoreWorkspace.isPending}
								>
									<RotateCcw className='mr-1.5 h-3.5 w-3.5' />
									Khôi phục
								</Button>
								<Button
									variant='outline'
									size='sm'
									className='h-8 shrink-0 rounded-lg border-border bg-background text-[12px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm transition-all'
									onClick={() =>
										setWorkspaceToRemove(workspace)
									}
									disabled={
										removeWorkspaceFromUserTrash.isPending
									}
								>
									<Trash2 className='mr-1.5 h-3.5 w-3.5' />
									Xóa vĩnh viễn
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Floating Bulk Action Bar */}
			{selectedIds.length > 0 && (
				<div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-background px-4 py-2.5 shadow-xl animate-in slide-in-from-bottom-5'>
					<div className='flex items-center gap-2 pr-4 border-r border-border'>
						<Badge
							variant='default'
							className='h-6 w-6 rounded-full flex items-center justify-center p-0'
						>
							{selectedIds.length}
						</Badge>
						<span className='text-sm font-medium whitespace-nowrap'>
							workspace đã chọn
						</span>
					</div>

					<Button
						variant='ghost'
						size='sm'
						className='h-8 rounded-full px-3 text-muted-foreground hover:text-foreground'
						onClick={() =>
							handleSelectAll(
								selectedIds.length !== workspaces.length,
							)
						}
					>
						<CheckCircle2 className='mr-1.5 h-4 w-4' />
						{selectedIds.length === workspaces.length
							? "Bỏ chọn tất cả"
							: "Chọn tất cả"}
					</Button>

					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							className='h-8 rounded-full px-4'
							onClick={handleBulkRestore}
							disabled={isBulkRestoring || isBulkRemoving}
						>
							<RotateCcw className='mr-1.5 h-3.5 w-3.5' />
							Khôi phục
						</Button>
						<Button
							variant='outline'
							size='sm'
							className='h-8 rounded-full px-4 text-destructive hover:text-destructive hover:bg-destructive/10 border-border'
							onClick={() => setBulkRemoveConfirm(true)}
							disabled={isBulkRestoring || isBulkRemoving}
						>
							<Trash2 className='mr-1.5 h-3.5 w-3.5' />
							Xóa
						</Button>
					</div>

					<div className='pl-2 border-l border-border ml-2'>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 rounded-full text-muted-foreground hover:text-foreground'
							onClick={() => setSelectedIds([])}
						>
							<X className='h-4 w-4' />
						</Button>
					</div>
				</div>
			)}

			<Dialog
				open={!!workspaceToRemove}
				onOpenChange={(open) => !open && setWorkspaceToRemove(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Xóa khỏi thùng rác</DialogTitle>
						<DialogDescription>
							Hành động này sẽ xóa không gian làm việc khỏi thùng rác của bạn. Nó sẽ không xóa không gian làm việc của các thành viên khác.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setWorkspaceToRemove(null)}
						>
							Hủy
						</Button>
						<Button
							variant='destructive'
							onClick={() => {
								if (workspaceToRemove) {
									removeWorkspaceFromUserTrash.mutate(
										workspaceToRemove.id,
										{
											onSuccess: () => {
												toast.success(
													"Đã xóa không gian làm việc khỏi thùng rác",
												);
												setWorkspaceToRemove(null);
											},
										},
									);
								}
							}}
							disabled={removeWorkspaceFromUserTrash.isPending}
						>
							Xóa khỏi chế độ xem của tôi
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={bulkRemoveConfirm}
				onOpenChange={setBulkRemoveConfirm}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Xóa các mục đã chọn khỏi thùng rác</DialogTitle>
						<DialogDescription>
							Hành động này sẽ xóa {selectedIds.length} không gian làm việc đã chọn khỏi thùng rác của bạn. Nó sẽ không xóa chúng đối với các thành viên khác.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setBulkRemoveConfirm(false)}
						>
							Hủy
						</Button>
						<Button
							variant='destructive'
							onClick={handleBulkRemove}
							disabled={isBulkRemoving}
						>
							Xóa khỏi chế độ xem của tôi
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DeletedWorkspacesPage;
