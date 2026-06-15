"use client";

import { WorkspaceTemplateDto } from "@/services/workspace-template/type";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutTemplate, Lock, Users, Globe, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/features/auth/hooks/useUser";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
	const { deleteWorkspaceTemplate } = useWorkspaceTemplate();

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
			deleteWorkspaceTemplate.mutate(template.id, {
				onSuccess: () => {
					toast.success("Template deleted successfully");
				}
			});
		}
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
								System
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
									Edit Template
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-500 focus:text-red-500">
									<Trash2 className="h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				<CardDescription className="line-clamp-3 text-sm">
					{template.description || "No description provided. This template can be used to quick-start your workspace."}
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				<div className="flex items-center justify-between text-xs text-muted-foreground w-full">
					<div className="flex items-center gap-4">
						<div className="flex items-center">
							{getVisibilityIcon()}
							<span className="capitalize">{template.visibility.toLowerCase()}</span>
						</div>
						<div className="flex items-center">
							<CalendarDays className="w-3 h-3 mr-1" />
							<span>{format(new Date(template.createdAt), "MMM d, yyyy")}</span>
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
					Use Template
				</Button>
			</CardFooter>

			<UpdateTemplateModal 
				template={template} 
				isOpen={isUpdateModalOpen} 
				onClose={() => setIsUpdateModalOpen(false)} 
			/>
		</Card>
	);
};
