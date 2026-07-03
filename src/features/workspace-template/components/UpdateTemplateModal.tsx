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
			toast.error("Vui lòng nhập tên mẫu.");
			return;
		}

		updateWorkspaceTemplate.mutate(
			{ id: template.id, data: formData },
			{
				onSuccess: () => {
					toast.success("Đã cập nhật mẫu.");
					onClose();
				},
				onError: () => {
					toast.error("Không thể cập nhật mẫu.");
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Cập nhật Mẫu</DialogTitle>
					<DialogDescription>
						Chỉnh sửa thông tin chi tiết của mẫu không gian làm việc.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="update-name">Tên mẫu</Label>
						<Input
							id="update-name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="Ví dụ: Phát triển phần mềm"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="update-description">Mô tả</Label>
						<Input
							id="update-description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Mô tả tùy chọn"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="update-category">Danh mục</Label>
						<Select
							value={formData.category}
							onValueChange={(v) => setFormData({ ...formData, category: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn danh mục" />
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
						<Label htmlFor="update-visibility">Quyền riêng tư</Label>
						<Select
							value={formData.visibility}
							onValueChange={(v: "PRIVATE" | "WORKSPACE" | "PUBLIC") => setFormData({ ...formData, visibility: v })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn quyền riêng tư" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PRIVATE">Riêng tư (Chỉ mình bạn)</SelectItem>
								<SelectItem value="WORKSPACE">Không gian làm việc (Chỉ thành viên)</SelectItem>
								<SelectItem value="PUBLIC">Công khai (Tất cả mọi người)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={updateWorkspaceTemplate.isPending}>
						Hủy
					</Button>
					<Button onClick={handleUpdate} disabled={updateWorkspaceTemplate.isPending}>
						{updateWorkspaceTemplate.isPending ? "Đang cập nhật..." : "Cập nhật Mẫu"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
