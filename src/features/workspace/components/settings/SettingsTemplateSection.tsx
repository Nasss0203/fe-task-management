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
import { Switch } from "@/components/ui/switch";
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
					setIsOpen(false);
					setFormData({ name: "", description: "", visibility: "PRIVATE", includeSampleTasks: false });
				},
				onError: () => {
					toast.error("Không thể lưu không gian làm việc thành mẫu.");
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Mẫu Không gian làm việc</h3>
				<p className="text-sm text-muted-foreground">
					Lưu cấu hình không gian làm việc hiện tại của bạn thành một mẫu để tái sử dụng sau này.
				</p>
			</div>
			
			<div className="rounded-lg border bg-card p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h4 className="flex items-center gap-2 font-medium text-foreground">
							<LayoutTemplate className="h-5 w-5 text-primary" />
							Lưu thành Mẫu
						</h4>
						<p className="mt-1 text-sm text-muted-foreground">
							Tạo một mẫu có thể tái sử dụng chứa các dự án, bảng, cấu trúc công việc và cấu hình trang của bạn.
						</p>
					</div>

					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" className="shrink-0">
								Tạo Mẫu
							</Button>
						</DialogTrigger>
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
										<Label htmlFor="include-tasks-settings">Lưu kèm công việc mẫu</Label>
										<div className="text-[11px] text-muted-foreground leading-tight">
											Lưu lại toàn bộ các công việc hiện tại trong dự án vào mẫu này.
										</div>
									</div>
									<Switch
										id="include-tasks-settings"
										checked={formData.includeSampleTasks}
										onCheckedChange={(checked) => setFormData({ ...formData, includeSampleTasks: checked })}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsOpen(false)} disabled={saveWorkspaceAsTemplate.isPending}>
									Hủy
								</Button>
								<Button onClick={handleSave} disabled={saveWorkspaceAsTemplate.isPending}>
									{saveWorkspaceAsTemplate.isPending ? "Đang lưu..." : "Lưu mẫu"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
