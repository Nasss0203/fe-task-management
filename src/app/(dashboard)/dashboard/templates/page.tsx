"use client";

import { useState } from "react";
import { useWorkspaceTemplate } from "@/features/workspace-template/hooks/useWorkspaceTemplate";
import { TemplateCard } from "@/features/workspace-template/components/TemplateCard";
import { UseTemplateModal } from "@/features/workspace-template/components/UseTemplateModal";
import { WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutTemplate, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function WorkspaceTemplatesPage() {
	const [activeTab, setActiveTab] = useState("all");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplateDto | null>(null);

	const { workspaceTemplates } = useWorkspaceTemplate({
		ownedByMe: activeTab === "mine" ? true : undefined,
		status: "PUBLISHED", // Always fetch PUBLISHED for exploration
		category: selectedCategory !== "all" ? selectedCategory : undefined,
		limit: 50,
	});

	const templates = workspaceTemplates.data?.data.data || [];
	const isLoading = workspaceTemplates.isLoading;

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
					<LayoutTemplate className="w-8 h-8 text-primary" />
					Khám phá Mẫu
				</h1>
				<p className="text-muted-foreground text-lg">
					Khởi tạo nhanh không gian làm việc mới với các dự án, bảng và tác vụ được cấu hình sẵn.
				</p>
			</div>

			<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<TabsList className="grid w-full sm:w-[300px] grid-cols-2">
						<TabsTrigger value="all">Tất cả Mẫu</TabsTrigger>
						<TabsTrigger value="mine">Mẫu của tôi</TabsTrigger>
					</TabsList>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-full sm:w-[200px]">
							<SelectValue placeholder="Tất cả danh mục" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả danh mục</SelectItem>
							<SelectItem value="Software">Phát triển Phần mềm</SelectItem>
							<SelectItem value="Marketing">Marketing</SelectItem>
							<SelectItem value="HR">Nhân sự</SelectItem>
							<SelectItem value="Design">Design</SelectItem>
							<SelectItem value="Personal">Cá nhân</SelectItem>
							<SelectItem value="Other">Khác</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<TabsContent value={activeTab} className="mt-0">
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<Skeleton key={i} className="h-64 w-full rounded-xl" />
							))}
						</div>
					) : templates.length === 0 ? (
						<div className="text-center py-20 border rounded-xl bg-muted/20 border-dashed">
							<LayoutTemplate className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-2">Không tìm thấy mẫu</h3>
							<p className="text-muted-foreground">
								{activeTab === "mine"
									? "Bạn chưa tạo mẫu nào. Lưu không gian làm việc hiện tại thành mẫu để xem ở đây."
									: "Không có mẫu nào vào lúc này."}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{templates.map((template) => (
								<TemplateCard
									key={template.id}
									template={template}
									onUseTemplate={setSelectedTemplate}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>

			<UseTemplateModal
				template={selectedTemplate}
				isOpen={!!selectedTemplate}
				onClose={() => setSelectedTemplate(null)}
			/>
		</div>
	);
}
