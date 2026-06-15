"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceTemplate } from "@/features/workspace-template/hooks/useWorkspaceTemplate";
import { SaveWorkspaceAsTemplateDto } from "@/services/workspace-template/type";
import { toast } from "sonner";

interface SaveTemplateDialogProps {
	workspaceId: string;
	isOpen: boolean;
	onClose: () => void;
}

export const SaveTemplateDialog = ({ workspaceId, isOpen, onClose }: SaveTemplateDialogProps) => {
	const [formData, setFormData] = useState<SaveWorkspaceAsTemplateDto>({
		name: "",
		description: "",
		category: "",
		visibility: "PRIVATE",
	});

	const { saveWorkspaceAsTemplate } = useWorkspaceTemplate();

	const handleSave = () => {
		if (!formData.name.trim()) {
			toast.error("Please enter a template name");
			return;
		}

		saveWorkspaceAsTemplate.mutate(
			{ workspaceId, data: formData },
			{
				onSuccess: () => {
					toast.success("Workspace saved as template successfully!");
					onClose();
					setFormData({ name: "", description: "", category: "", visibility: "PRIVATE" });
				},
				onError: () => {
					toast.error("Failed to save workspace as template");
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Save as Template</DialogTitle>
					<DialogDescription>
						Convert the current workspace into a template. Tasks' states and configurations will be saved.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Template Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g. Software Development"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Optional description"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="category">Category</Label>
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
						<Label htmlFor="visibility">Visibility</Label>
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
					<Button variant="outline" onClick={onClose} disabled={saveWorkspaceAsTemplate.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={saveWorkspaceAsTemplate.isPending}>
						{saveWorkspaceAsTemplate.isPending ? "Saving..." : "Save Template"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
