"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { useWorkspace } from "@/hooks/use-workspace";
import TemplateGrid from "../templates/TemplateGrid";
import TemplateRecommendation, {
	type WorkspaceTemplateType,
} from "../templates/TemplateRecommendation";
import { Dialog } from "../ui/dialog";
import {
	DialogContentV2,
	DialogDescriptionV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
} from "./dialog-custom";

const DialogAddWorkspace = () => {
	const [workspaceName, setWorkspaceName] = useState("");
	const [open, setOpen] = useState(false);

	const {
		createWorkspace: { mutate, isSuccess },
	} = useWorkspace();

	useEffect(() => {
		if (isSuccess) {
			setOpen(false);
			setWorkspaceName("");
		}
	}, [isSuccess]);

	const handleCreateByTemplate = (template: WorkspaceTemplateType) => {
		const finalName =
			workspaceName.trim() || getDefaultWorkspaceName(template);

		mutate({
			name: finalName,
			template,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTriggerV2 className='w-full'>
				<div className='flex h-8 w-full cursor-pointer items-center justify-start gap-2 text-[13px] font-medium hover:bg-sidebar-accent'>
					<Plus size={12} className='font-semibold' />
					Thêm mới
				</div>
			</DialogTriggerV2>

			<DialogContentV2 className='max-w-[calc(100%-35%)]! min-h-[calc(100%-10%)]! overflow-hidden border border-neutral-800 bg-[#191919] p-0 text-white'>
				<div className='h-full p-7'>
					<DialogHeaderV2 className='mb-6'>
						<DialogTitleV2 className='text-2xl font-bold'>
							Tạo workspace
						</DialogTitleV2>

						<DialogDescriptionV2 className='text-sm text-neutral-400'>
							Nhập tên rồi chọn template. Bấm vào template là tạo
							luôn.
						</DialogDescriptionV2>
					</DialogHeaderV2>

					<div className='mb-6'>
						<label className='mb-2 block text-sm text-neutral-300'>
							Tên workspace
						</label>
						<input
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
							placeholder='Ví dụ: Marketing Team'
							className='h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 text-sm outline-none placeholder:text-neutral-500 focus:border-blue-500'
						/>
					</div>

					<TemplateGrid>
						<TemplateRecommendation
							onSelect={handleCreateByTemplate}
						/>
					</TemplateGrid>
				</div>
			</DialogContentV2>
		</Dialog>
	);
};

export default DialogAddWorkspace;

function getDefaultWorkspaceName(template: WorkspaceTemplateType) {
	switch (template) {
		case "TASK_TRACKER":
			return "Task Tracker Workspace";
		case "PROJECT":
			return "Project Workspace";
		case "BLANK_DATABASE":
			return "Database Workspace";
		case "BLANK_PAGE":
			return "Blank Workspace";
		default:
			return "My Workspace";
	}
}
