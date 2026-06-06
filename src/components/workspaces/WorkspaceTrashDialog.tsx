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
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import type { WorkspaceItem } from "@/services/workspace/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type WorkspaceTrashDialogProps = {
	workspace: WorkspaceItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const WorkspaceTrashDialog = ({
	workspace,
	open,
	onOpenChange,
}: WorkspaceTrashDialogProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const { currentWorkspaceId, setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();
	const { softDeleteWorkspace } = useWorkspace();

	const handleConfirm = async () => {
		try {
			await softDeleteWorkspace.mutateAsync(workspace.id);

			const isCurrentWorkspace =
				currentWorkspaceId === workspace.id ||
				pathname?.startsWith(`/dashboard/${workspace.slug}`);

			onOpenChange(false);

			if (isCurrentWorkspace) {
				setCurrentWorkspaceId("");
				setCurrentProjectId(null);
				router.push("/dashboard/trash/workspaces");
			}

			toast.success("Workspace da duoc chuyen vao thung rac.");
		} catch (error) {
			console.error("trashWorkspace failed", error);
			toast.error("Khong the chuyen workspace vao thung rac.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='border-neutral-800 bg-neutral-950 text-neutral-100 sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Chuyen workspace vao Thung rac?</DialogTitle>
					<DialogDescription className='text-neutral-400'>
						Workspace{" "}
						<span className='font-medium text-neutral-200'>
							{workspace.name}
						</span>{" "}
						se bi an khoi danh sach dang hoat dong. Ban van co the
						khoi phuc no tu trang Thung rac.
					</DialogDescription>
				</DialogHeader>

				<div className='rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200/80'>
					Hanh dong nay la xoa mem, khong xoa vinh vien du lieu ngay
					lap tuc.
				</div>

				<DialogFooter className='gap-2 sm:justify-end'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={softDeleteWorkspace.isPending}
					>
						Huy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={softDeleteWorkspace.isPending}
						className='bg-red-600 text-white hover:bg-red-700'
					>
						{softDeleteWorkspace.isPending
							? "Dang chuyen..."
							: "Chuyen vao Thung rac"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default WorkspaceTrashDialog;
