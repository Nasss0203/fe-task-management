"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { toast } from "sonner";
import { DialogUpgradePlan } from "@/components/dialog/DialogUpgradePlan";

interface UseTemplateModalProps {
	template: WorkspaceTemplateDto | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UseTemplateModal = ({ template, isOpen, onClose }: UseTemplateModalProps) => {
	const [workspaceName, setWorkspaceName] = useState("");
	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
	const { createWorkspace } = useWorkspace();

	const handleUseTemplate = () => {
		if (!template) return;
		if (!workspaceName.trim()) {
			toast.error("Vui lòng nhập tên không gian làm việc.");
			return;
		}

		createWorkspace.mutate(
			{
				name: workspaceName,
				templateId: template.id,
			},
			{
				onSuccess: () => {
					toast.success("Đã tạo không gian làm việc từ mẫu.");
					setWorkspaceName("");
					onClose();
				},
				onError: (err: any) => {
					if (err?.response?.data?.code === 'WORKSPACE_LIMIT_EXCEEDED') {
						onClose();
						setUpgradeModalOpen(true);
					} else {
						toast.error("Không thể tạo không gian làm việc.");
					}
				},
			}
		);
	};

	return (
		<>
		<Dialog open={isOpen} onOpenChange={onClose}>
			{template && (
				<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Dùng mẫu</DialogTitle>
					<DialogDescription>
						Tạo không gian làm việc mới từ cấu hình của mẫu <b>{template.name}</b>.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Tên không gian làm việc</Label>
						<Input
							id="name"
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
							placeholder="Nhập tên không gian làm việc"
							autoFocus
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={createWorkspace.isPending}>
						Hủy
					</Button>
					<Button onClick={handleUseTemplate} disabled={createWorkspace.isPending}>
						{createWorkspace.isPending ? "Đang tạo..." : "Tạo không gian làm việc"}
					</Button>
				</DialogFooter>
			</DialogContent>
			)}
		</Dialog>
		<DialogUpgradePlan open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
		</>
	);
};
