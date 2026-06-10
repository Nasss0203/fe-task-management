"use client";

import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceItem } from "@/services/workspace/type";
import WorkspaceSettingsContent from "./WorkspaceSettingsContent";

type WorkspaceSettingsDialogProps = {
	workspace: WorkspaceItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const WorkspaceSettingsDialog = ({
	workspace,
	open,
	onOpenChange,
}: WorkspaceSettingsDialogProps) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='h-[min(90vh,860px)] max-w-[min(1200px,calc(100vw-2rem))] overflow-hidden border-border bg-background p-0 text-foreground sm:max-w-[min(1200px,calc(100vw-2rem))]'>
				<DialogTitle className='sr-only'>
					Workspace settings for {workspace.name}
				</DialogTitle>
				<WorkspaceSettingsContent
					workspaceSlug={workspace.slug}
					variant='dialog'
				/>
			</DialogContent>
		</Dialog>
	);
};

export default WorkspaceSettingsDialog;
