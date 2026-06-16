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

			toast.success("Workspace đã được chuyển vào thùng rác.");
		} catch (error) {
			console.error("trashWorkspace failed", error);
			toast.error("Không thể chuyển workspace vào thùng rác.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='border-border bg-popover text-foreground sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Chuyển workspace vào Thùng rác?</DialogTitle>
					<DialogDescription className='text-muted-foreground'>
						Workspace{" "}
						<span className='font-medium text-foreground'>
							{workspace.name}
						</span>{" "}
						sẽ bị ẩn khỏi danh sách đang hoạt động. Bạn vẫn có thể
						khôi phục nó từ trang Thùng rác.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className='gap-2 sm:justify-end'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={softDeleteWorkspace.isPending}
					>
						Hủy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={softDeleteWorkspace.isPending}
						className='bg-red-600 text-white hover:bg-red-700'
					>
						{softDeleteWorkspace.isPending
							? "Đang chuyển..."
							: "Chuyển vào Thùng rác"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default WorkspaceTrashDialog;
