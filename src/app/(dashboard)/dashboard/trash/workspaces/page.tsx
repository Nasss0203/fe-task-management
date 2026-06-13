"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import type { WorkspaceItem } from "@/services/workspace/type";
import { ArrowLeft, CheckCircle2, RefreshCw, RotateCcw, Trash2, X } from "lucide-react";
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

	const [workspaceToRemove, setWorkspaceToRemove] = useState<WorkspaceItem | null>(null);
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
				selectedIds.map((id) => restoreWorkspace.mutateAsync(id))
			);
			toast.success(`${selectedIds.length} workspaces da duoc khoi phuc.`);
			setSelectedIds([]);
		} catch (error) {
			console.error("bulk restore failed", error);
			toast.error("Co loi khi khoi phuc workspaces.");
		} finally {
			setIsBulkRestoring(false);
		}
	};

	const handleBulkRemove = async () => {
		if (selectedIds.length === 0) return;
		setIsBulkRemoving(true);
		try {
			await Promise.all(
				selectedIds.map((id) => removeWorkspaceFromUserTrash.mutateAsync(id))
			);
			toast.success(`${selectedIds.length} workspaces removed from trash.`);
			setSelectedIds([]);
			setBulkRemoveConfirm(false);
		} catch (error) {
			console.error("bulk remove failed", error);
			toast.error("Co loi khi xoa workspaces.");
		} finally {
			setIsBulkRemoving(false);
		}
	};

	const handleRestore = async (workspaceId: string) => {
		try {
			await restoreWorkspace.mutateAsync(workspaceId);
			toast.success("Workspace da duoc khoi phuc.");
		} catch (error) {
			console.error("restoreWorkspace failed", error);
			toast.error("Khong the khoi phuc workspace.");
		}
	};

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
				Loading deleted workspaces...
			</div>
		);
	}

	if (isError) {
		return (
			<Card className='border-border bg-card text-card-foreground'>
				<CardHeader>
					<CardTitle>Khong tai duoc thung rac workspace</CardTitle>
					<CardDescription>
						Thu tai lai de lay danh sach workspace da xoa.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant='outline' onClick={() => refetch()}>
						<RefreshCw className='mr-2 h-4 w-4' />
						Tai lai
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<div className='text-sm text-muted-foreground'>Trash</div>
					<h1 className='text-3xl font-semibold text-foreground'>
						Deleted workspaces
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Workspace da xoa mem se hien o day de ban khoi phuc lai.
					</p>
				</div>

				<Button asChild variant='outline'>
					<Link href='/dashboard'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to dashboard
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
								Chua co workspace nao trong thung rac
							</div>
							<div className='mt-1 text-sm text-muted-foreground'>
								Khi ban xoa workspace mem, no se hien o day.
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
									onCheckedChange={(checked) => handleSelectOne(workspace.id, checked as boolean)}
								/>
								<div>
									<h3 className='truncate text-[15px] font-semibold text-foreground'>
										{workspace.name}
									</h3>
									<div className='mt-1 text-[13px] text-muted-foreground'>
										Deleted on{" "}
										{formatDeletedAt(workspace.deletedAt)}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant='outline'
									size='sm'
									className='h-8 shrink-0 rounded-lg border-border bg-background text-[12px] font-medium text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm transition-all'
									onClick={() => handleRestore(workspace.id)}
									disabled={restoreWorkspace.isPending}
								>
									<RotateCcw className='mr-1.5 h-3.5 w-3.5' />
									Restore
								</Button>
								<Button
									variant='outline'
									size='sm'
									className='h-8 shrink-0 rounded-lg border-border bg-background text-[12px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm transition-all'
									onClick={() => setWorkspaceToRemove(workspace)}
									disabled={removeWorkspaceFromUserTrash.isPending}
								>
									<Trash2 className='mr-1.5 h-3.5 w-3.5' />
									Delete forever
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Floating Bulk Action Bar */}
			{selectedIds.length > 0 && (
				<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-background px-4 py-2.5 shadow-xl animate-in slide-in-from-bottom-5">
					<div className="flex items-center gap-2 pr-4 border-r border-border">
						<Badge variant="default" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
							{selectedIds.length}
						</Badge>
						<span className="text-sm font-medium whitespace-nowrap">
							workspace đã chọn
						</span>
					</div>

					<Button
						variant="ghost"
						size="sm"
						className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground"
						onClick={() => handleSelectAll(selectedIds.length !== workspaces.length)}
					>
						<CheckCircle2 className="mr-1.5 h-4 w-4" />
						{selectedIds.length === workspaces.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
					</Button>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-8 rounded-full px-4"
							onClick={handleBulkRestore}
							disabled={isBulkRestoring || isBulkRemoving}
						>
							<RotateCcw className="mr-1.5 h-3.5 w-3.5" />
							Restore
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 rounded-full px-4 text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
							onClick={() => setBulkRemoveConfirm(true)}
							disabled={isBulkRestoring || isBulkRemoving}
						>
							<Trash2 className="mr-1.5 h-3.5 w-3.5" />
							Delete
						</Button>
					</div>

					<div className="pl-2 border-l border-border ml-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
							onClick={() => setSelectedIds([])}
						>
							<X className="h-4 w-4" />
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
						<DialogTitle>Remove from trash</DialogTitle>
						<DialogDescription>
							This will remove the workspace from your trash. It will not delete the workspace for other members.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setWorkspaceToRemove(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (workspaceToRemove) {
									removeWorkspaceFromUserTrash.mutate(workspaceToRemove.id, {
										onSuccess: () => {
											toast.success("Workspace removed from trash");
											setWorkspaceToRemove(null);
										},
									});
								}
							}}
							disabled={removeWorkspaceFromUserTrash.isPending}
						>
							Delete from my view
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
						<DialogTitle>Remove selected from trash</DialogTitle>
						<DialogDescription>
							This will remove {selectedIds.length} selected workspaces from your trash. It will not delete them for other members.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBulkRemoveConfirm(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleBulkRemove}
							disabled={isBulkRemoving}
						>
							Delete from my view
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DeletedWorkspacesPage;
