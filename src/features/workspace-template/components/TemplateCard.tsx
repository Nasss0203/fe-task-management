"use client";

import { WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutTemplate, Lock, Users, Globe, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useUser } from "@/features/auth/hooks/useUser";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpdateTemplateModal } from "./UpdateTemplateModal";
import { useState } from "react";
import { useWorkspaceTemplate } from "../hooks/useWorkspaceTemplate";
import { toast } from "sonner";

interface TemplateCardProps {
	template: WorkspaceTemplateDto;
	onUseTemplate: (template: WorkspaceTemplateDto) => void;
}

export const TemplateCard = ({ template, onUseTemplate }: TemplateCardProps) => {
	const { user } = useUser();
	const isOwner = user?.id === template.createdBy;
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { deleteWorkspaceTemplate } = useWorkspaceTemplate();

	const handleDelete = () => {
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		deleteWorkspaceTemplate.mutate(template.id, {
			onSuccess: () => {
				toast.success("Đã xóa mẫu.");
				setIsDeleteDialogOpen(false);
			},
			onError: () => {
				toast.error("Không thể xóa mẫu.");
			}
		});
	};

	const getVisibilityIcon = () => {
		switch (template.visibility) {
			case "PRIVATE":
				return <Lock className="w-3 h-3 mr-1" />;
			case "WORKSPACE":
				return <Users className="w-3 h-3 mr-1" />;
			case "PUBLIC":
				return <Globe className="w-3 h-3 mr-1" />;
			default:
				return null;
		}
	};

	const getVisibilityLabel = () => {
		switch (template.visibility) {
			case "PUBLIC":
				return "Công khai";
			case "WORKSPACE":
				return "Không gian làm việc";
			case "PRIVATE":
				return "Riêng tư";
			default:
				return template.visibility;
		}
	};

	return (
		<Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-200 border-border/50">
			<div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border-b">
				<LayoutTemplate className="w-12 h-12 text-muted-foreground/50" />
			</div>
			<CardHeader className="flex-1 pb-4">
				<div className="flex justify-between items-start gap-2 mb-2">
					<div className="flex items-start gap-2 overflow-hidden">
						<CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
						{template.isSystem && (
							<Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
								Hệ thống
							</Badge>
						)}
					</div>
					{isOwner && !template.isSystem && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
									<MoreVertical className="h-4 w-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)} className="gap-2">
									<Pencil className="h-4 w-4" />
									Chỉnh sửa mẫu
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-500 focus:text-red-500">
									<Trash2 className="h-4 w-4" />
									Xóa
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				<CardDescription className="line-clamp-3 text-sm">
					{template.description || "Chưa có mô tả. Mẫu này có thể dùng để tạo nhanh không gian làm việc của bạn."}
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				<div className="flex items-center justify-between text-xs text-muted-foreground w-full">
					<div className="flex items-center gap-4">
						<div className="flex items-center">
							{getVisibilityIcon()}
							<span>{getVisibilityLabel()}</span>
						</div>
						<div className="flex items-center">
							<CalendarDays className="w-3 h-3 mr-1" />
							<span>{format(new Date(template.createdAt), "d MMM, yyyy", { locale: vi })}</span>
						</div>
					</div>
					{template.category && (
						<Badge variant="outline" className="text-[10px] font-normal px-2 py-0 h-5">
							{template.category}
						</Badge>
					)}
				</div>
			</CardContent>
			<CardFooter className="pt-0">
				<Button className="w-full" onClick={() => onUseTemplate(template)}>
					Dùng mẫu này
				</Button>
			</CardFooter>

			<UpdateTemplateModal
				template={template}
				isOpen={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
			/>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Xóa mẫu không gian làm việc</DialogTitle>
						<DialogDescription>
							Bạn có chắc chắn muốn xóa mẫu này? Hành động này không thể hoàn tác và mẫu sẽ bị gỡ khỏi hệ thống.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 gap-2">
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteWorkspaceTemplate.isPending}>
							Hủy
						</Button>
						<Button variant="destructive" onClick={confirmDelete} disabled={deleteWorkspaceTemplate.isPending}>
							{deleteWorkspaceTemplate.isPending ? "Đang xóa..." : "Xóa"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
};
