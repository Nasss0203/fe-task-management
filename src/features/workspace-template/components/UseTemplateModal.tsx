"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { toast } from "sonner";

interface UseTemplateModalProps {
	template: WorkspaceTemplateDto | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UseTemplateModal = ({ template, isOpen, onClose }: UseTemplateModalProps) => {
	const [workspaceName, setWorkspaceName] = useState("");
	const { createWorkspace } = useWorkspace();

	const handleUseTemplate = () => {
		if (!template) return;
		if (!workspaceName.trim()) {
			toast.error("Please enter a workspace name");
			return;
		}

		createWorkspace.mutate(
			{
				name: workspaceName,
				templateId: template.id,
			},
			{
				onSuccess: () => {
					toast.success("Workspace created successfully from template!");
					setWorkspaceName("");
					onClose();
				},
				onError: () => {
					toast.error("Failed to create workspace");
				},
			}
		);
	};

	if (!template) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Use Template</DialogTitle>
					<DialogDescription>
						Create a new workspace using the configuration from <b>{template.name}</b>.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Workspace Name</Label>
						<Input
							id="name"
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
							placeholder="Enter workspace name"
							autoFocus
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={createWorkspace.isPending}>
						Cancel
					</Button>
					<Button onClick={handleUseTemplate} disabled={createWorkspace.isPending}>
						{createWorkspace.isPending ? "Creating..." : "Create Workspace"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
