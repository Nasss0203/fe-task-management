"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
		includeSampleTasks: false,
	});

	const { saveWorkspaceAsTemplate } = useWorkspaceTemplate();

	const handleSave = () => {
		if (!formData.name.trim()) {
			toast.error("Vui lòng nhập tên mẫu.");
			return;
		}

		saveWorkspaceAsTemplate.mutate(
			{ workspaceId, data: formData },
			{
				onSuccess: () => {
					toast.success("Đã lưu không gian làm việc thành mẫu.");
					onClose();
					setFormData({ name: "", description: "", category: "", visibility: "PRIVATE", includeSampleTasks: false });
				},
				onError: () => {
					toast.error("Không thể lưu không gian làm việc thành mẫu.");
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Lưu thành Mẫu</DialogTitle>
					<DialogDescription>
						Chuyển đổi không gian làm việc hiện tại thành một mẫu. Các trạng thái và cấu hình của dự án sẽ được lưu lại.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Tên mẫu</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="Ví dụ: Phát triển phần mềm"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Mô tả</Label>
						<Input
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Mô tả tùy chọn"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="category">Danh mục</Label>
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
						<Label htmlFor="visibility">Quyền riêng tư</Label>
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
					<div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
						<div className="space-y-0.5">
							<Label htmlFor="include-tasks">Lưu kèm công việc mẫu</Label>
							<div className="text-[11px] text-muted-foreground leading-tight">
								Lưu lại toàn bộ các công việc hiện tại trong dự án vào mẫu này.
							</div>
						</div>
						<Switch
							id="include-tasks"
							checked={formData.includeSampleTasks}
							onCheckedChange={(checked) => setFormData({ ...formData, includeSampleTasks: checked })}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={saveWorkspaceAsTemplate.isPending}>
						Hủy
					</Button>
					<Button onClick={handleSave} disabled={saveWorkspaceAsTemplate.isPending}>
						{saveWorkspaceAsTemplate.isPending ? "Đang lưu..." : "Lưu mẫu"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
