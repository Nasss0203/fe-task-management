"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { useWorkspaceTemplates } from "@/features/workspace-template/hooks/useWorkspaceTemplates";
import { usePlan } from "@/features/billing/hooks/usePlan";
import TemplateGrid from "../templates/TemplateGrid";
import TemplateRecommendation from "../templates/TemplateRecommendation";
import { Dialog } from "../ui/dialog";
import {
	DialogContentV2,
	DialogDescriptionV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
} from "./dialog-custom";
import { DialogUpgradePlan } from "./DialogUpgradePlan";

const DialogAddWorkspace = () => {
	const [workspaceName, setWorkspaceName] = useState("");
	const [open, setOpen] = useState(false);
	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

	const {
		createWorkspace: { mutate, isSuccess },
		workspaceFindAll
	} = useWorkspace();
	const { planInfo } = usePlan();

	const workspaces = workspaceFindAll.data?.data || [];
	const workspaceLimit = planInfo.data?.data?.plan?.limits?.workspaces ?? 5;
	const isAtLimit = workspaces.length >= workspaceLimit;

	const { workspaceTemplatesFindAll } = useWorkspaceTemplates();
	const { data: templatesData, isLoading } = workspaceTemplatesFindAll;
	const templates = templatesData?.data?.data?.filter((t) => t.isSystem) || [];

	useEffect(() => {
		if (isSuccess) {
			setOpen(false);
			setWorkspaceName("");
		}
	}, [isSuccess]);

	const handleCreateByTemplate = (templateId: string) => {
		const selectedTemplate = templates.find((t) => t.id === templateId);
		const finalName =
			workspaceName.trim() || getDefaultWorkspaceName(selectedTemplate?.name);

		mutate({
			name: finalName,
			templateId,
		}, {
			onError: (err: any) => {
				if (err?.response?.data?.code === 'WORKSPACE_LIMIT_EXCEEDED') {
					setOpen(false);
					setUpgradeModalOpen(true);
				}
			}
		});
	};

	return (
		<>
		<Dialog open={open} onOpenChange={setOpen}>
			<div 
				onClick={() => {
					if (isAtLimit) {
						setUpgradeModalOpen(true);
					} else {
						setOpen(true);
					}
				}}
				className='flex h-8 w-full cursor-pointer items-center justify-start gap-2 text-[13px] font-medium hover:bg-sidebar-accent'
			>
				<Plus size={12} className='font-semibold' />
				Thêm mới
			</div>

			<DialogContentV2 className='max-w-3xl! overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl p-0 shadow-2xl sm:rounded-2xl text-foreground'>
				<div className='flex h-full flex-col'>
					{/* Header section with gradient background */}
					<div className='relative overflow-hidden border-b border-border/50 bg-muted/30 px-8 py-8'>
						<div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent' />
						<div className='relative'>
							<DialogHeaderV2 className='mb-0 space-y-2'>
								<DialogTitleV2 className='text-2xl font-bold tracking-tight text-foreground'>
									Tạo workspace
								</DialogTitleV2>
								<DialogDescriptionV2 className='text-[14px] text-muted-foreground'>
									Nhập tên rồi chọn template. Bấm vào template là tạo luôn.
								</DialogDescriptionV2>
							</DialogHeaderV2>
						</div>
					</div>

					<div className='p-8'>
						<div className='mb-8 space-y-3'>
							<label className='text-[13px] font-semibold text-foreground uppercase tracking-wider'>
								Tên workspace
							</label>
							<input
								value={workspaceName}
								onChange={(e) => setWorkspaceName(e.target.value)}
								placeholder='Ví dụ: Marketing Team'
								className='h-12 w-full rounded-xl border border-border/50 bg-muted/20 px-4 text-[15px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-blue-500/50 focus:bg-background focus:ring-4 focus:ring-blue-500/10'
							/>
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
							</div>
						) : (
							<TemplateGrid>
								<TemplateRecommendation
									templates={templates}
									onSelect={handleCreateByTemplate}
								/>
							</TemplateGrid>
						)}
					</div>
				</div>
			</DialogContentV2>
		</Dialog>
		<DialogUpgradePlan open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
		</>
	);
};

export default DialogAddWorkspace;

function getDefaultWorkspaceName(templateName?: string) {
	if (templateName) {
		return `${templateName} Workspace`;
	}
	return "My Workspace";
}
