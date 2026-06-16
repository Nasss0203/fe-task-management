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
import { usePageBlock } from "@/features/page-block/hooks/usePageBlock";
import { useProject } from "@/features/project/hooks/useProject";
import type { PageBlockItem } from "@/services/page_block/type";
import type { ProjectItems } from "@/services/project/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type WorkspaceSummary = {
	id: string;
	name: string;
	slug: string;
};

type ProjectTrashDialogProps = {
	project: ProjectItems;
	workspace: WorkspaceSummary;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pageId?: string;
	projectBlock?: PageBlockItem | null;
};

const ProjectTrashDialog = ({
	project,
	workspace,
	open,
	onOpenChange,
	pageId,
	projectBlock,
}: ProjectTrashDialogProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const { currentProjectId, setCurrentProjectId } = useProjectSelectionStore();
	const {
		deleteProject: { mutateAsync: deleteProject, isPending: isDeletingProject },
	} = useProject(workspace.id);
	const {
		deletePageBlock: { mutateAsync: deletePageBlock },
	} = usePageBlock({ pageId });

	const handleConfirm = async () => {
		if (!project.id) return;

		try {
			await deleteProject({
				workspaceId: workspace.id,
				projectId: project.id,
			});

			if (projectBlock?.id && pageId) {
				try {
					await deletePageBlock({
						blockId: projectBlock.id,
						pageId,
						workspaceId: workspace.id,
					});
				} catch (error) {
					console.error("deleteProjectBlockAfterProjectDelete failed", error);
				}
			}

			const isCurrentProject =
				currentProjectId === project.id ||
				pathname?.includes(`/projects/${project.id}`);

			onOpenChange(false);

			if (isCurrentProject) {
				setCurrentProjectId(null);
				router.push(`/dashboard/${workspace.slug}`);
			}

			toast.success("Project đã được chuyển vào thùng rác.");
		} catch (error) {
			console.error("deleteProjectFromDialog failed", error);
			toast.error("Không thể chuyển project vào thùng rác.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='border-border bg-popover text-foreground sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Chuyển project vào Thùng rác?</DialogTitle>
					<DialogDescription className='text-muted-foreground'>
						Project{" "}
						<span className='font-medium text-foreground'>
							{project.name ?? "Untitled project"}
						</span>{" "}
						sẽ bị ẩn khỏi workspace. Bạn có thể khôi phục nó sau từ
						thùng rác.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className='gap-2 sm:justify-end'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isDeletingProject}
					>
						Hủy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isDeletingProject}
						className='bg-red-600 text-white hover:bg-red-700'
					>
						{isDeletingProject ? "Đang chuyển..." : "Chuyển vào Thùng rác"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ProjectTrashDialog;
