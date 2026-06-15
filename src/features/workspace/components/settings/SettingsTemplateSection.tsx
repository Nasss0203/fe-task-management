"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import { useWorkspaceTemplate } from "@/features/workspace-template/hooks/useWorkspaceTemplate";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveWorkspaceAsTemplateDto } from "@/services/workspace-template/type";

interface SettingsTemplateSectionProps {
	workspaceId: string;
}

export function SettingsTemplateSection({ workspaceId }: SettingsTemplateSectionProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState<SaveWorkspaceAsTemplateDto>({
		name: "",
		description: "",
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
					setIsOpen(false);
					setFormData({ name: "", description: "", visibility: "PRIVATE" });
				},
				onError: () => {
					toast.error("Failed to save workspace as template");
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Workspace Templates</h3>
				<p className="text-sm text-muted-foreground">
					Save your current workspace configuration as a template to reuse later.
				</p>
			</div>
			
			<div className="rounded-lg border bg-card p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h4 className="flex items-center gap-2 font-medium text-foreground">
							<LayoutTemplate className="h-5 w-5 text-primary" />
							Save as Template
						</h4>
						<p className="mt-1 text-sm text-muted-foreground">
							Create a reusable template containing your projects, boards, task structures, and page configurations.
						</p>
					</div>

					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" className="shrink-0">
								Create Template
							</Button>
						</DialogTrigger>
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
								<Button variant="outline" onClick={() => setIsOpen(false)} disabled={saveWorkspaceAsTemplate.isPending}>
									Cancel
								</Button>
								<Button onClick={handleSave} disabled={saveWorkspaceAsTemplate.isPending}>
									{saveWorkspaceAsTemplate.isPending ? "Saving..." : "Save Template"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
