"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceTemplate } from "@/features/workspace-template/hooks/useWorkspaceTemplate";
import { UpdateWorkspaceTemplateDto, WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { toast } from "sonner";

interface UpdateTemplateModalProps {
	template: WorkspaceTemplateDto | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UpdateTemplateModal = ({ template, isOpen, onClose }: UpdateTemplateModalProps) => {
	const [formData, setFormData] = useState<UpdateWorkspaceTemplateDto>({
		name: "",
		description: "",
		category: "",
		visibility: "PRIVATE",
	});

	const { updateWorkspaceTemplate } = useWorkspaceTemplate();

	useEffect(() => {
		if (template) {
			setFormData({
				name: template.name || "",
				description: template.description || "",
				category: template.category || "",
				visibility: (template.visibility as "WORKSPACE" | "PRIVATE" | "PUBLIC") || "PRIVATE",
			});
		}
	}, [template]);

	const handleUpdate = () => {
		if (!template) return;
		if (!formData.name?.trim()) {
			toast.error("Please enter a template name");
			return;
		}

		updateWorkspaceTemplate.mutate(
			{ id: template.id, data: formData },
			{
				onSuccess: () => {
					toast.success("Template updated successfully!");
					onClose();
				},
				onError: () => {
					toast.error("Failed to update template");
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Template</DialogTitle>
					<DialogDescription>
						Modify the details of your workspace template.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="update-name">Template Name</Label>
						<Input
							id="update-name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g. Software Development"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="update-description">Description</Label>
						<Input
							id="update-description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Optional description"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="update-category">Category</Label>
						<Select
							value={formData.category}
							onValueChange={(v) => setFormData({ ...formData, category: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Software">Software Development</SelectItem>
								<SelectItem value="Marketing">Marketing</SelectItem>
								<SelectItem value="HR">Human Resources</SelectItem>
								<SelectItem value="Design">Design</SelectItem>
								<SelectItem value="Personal">Personal</SelectItem>
								<SelectItem value="Other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="update-visibility">Visibility</Label>
						<Select
							value={formData.visibility}
							onValueChange={(v: "PRIVATE" | "WORKSPACE" | "PUBLIC") => setFormData({ ...formData, visibility: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select visibility" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PRIVATE">Private (Only you)</SelectItem>
								<SelectItem value="WORKSPACE">Workspace (Members only)</SelectItem>
								<SelectItem value="PUBLIC">Public (Everyone)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={updateWorkspaceTemplate.isPending}>
						Cancel
					</Button>
					<Button onClick={handleUpdate} disabled={updateWorkspaceTemplate.isPending}>
						{updateWorkspaceTemplate.isPending ? "Updating..." : "Update Template"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
