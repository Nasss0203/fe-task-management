"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import type { WorkspaceItem } from "@/services/workspace/type";
import { ArrowLeft, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
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
	} = useWorkspace();

	const workspaces: WorkspaceItem[] = data?.data ?? [];

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
							<div className='min-w-0 flex-1'>
								<h3 className='truncate text-[15px] font-semibold text-foreground'>
									{workspace.name}
								</h3>
								<div className='mt-1 text-[13px] text-muted-foreground'>
									Deleted on{" "}
									{formatDeletedAt(workspace.deletedAt)}
								</div>
							</div>

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
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DeletedWorkspacesPage;
