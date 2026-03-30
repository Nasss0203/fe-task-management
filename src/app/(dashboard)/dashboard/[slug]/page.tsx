"use client";

import { ProjectBlockContainer } from "@/components/block";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "@/components/dropdown/dropdown-custom";
import { findProjectByWorkspaceIdApi } from "@/services/project/project.service";
import { PROJECT_KEY, ProjectItems } from "@/services/project/type";
import { findOneByWorkspaceIdApi } from "@/services/workspace/workspace.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, Plus, RefreshCw } from "lucide-react";
import React, { useState } from "react";

const SlugPage = () => {
	const { currentWorkspaceId } = useProjectSelectionStore();
	const [openedProjectIds, setOpenedProjectIds] = useState<string[]>([]);

	const query = useQuery({
		queryKey: ["workspace", currentWorkspaceId],
		queryFn: () => findOneByWorkspaceIdApi(currentWorkspaceId as string),
		enabled: !!currentWorkspaceId,
	});

	const dataWorkspace = query.data?.data;

	const project = useQuery({
		queryKey: [PROJECT_KEY.PROJECT, currentWorkspaceId],
		queryFn: () =>
			findProjectByWorkspaceIdApi(currentWorkspaceId as string),
		enabled: !!currentWorkspaceId,
	});

	const resProject = project.data?.data;

	const handleConvertProject = (project: ProjectItems) => {
		if (!project.id) return;

		const projectId = project.id;

		setOpenedProjectIds((prev) =>
			prev.includes(projectId)
				? prev.filter((id) => id !== projectId)
				: [...prev, projectId],
		);
	};

	return (
		<div className='flex h-screen flex-col gap-5'>
			<div className='relative w-full'>
				<div className='sticky top-0 z-20 h-20 w-full rounded-lg bg-sidebar-accent'>
					<div className='flex items-center justify-center flex-1 h-full'>
						<div className='text-white text-2xl'>Image</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col gap-3 px-20'>
				<div className='w-full'>
					<textarea
						defaultValue={dataWorkspace?.name}
						placeholder='New page'
						rows={1}
						onInput={(e) => {
							const target = e.currentTarget;
							target.style.height = "auto";
							target.style.height = `${target.scrollHeight}px`;
						}}
						className='w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-extrabold outline-none ring-0 placeholder:text-2xl placeholder:font-bold focus:outline-none focus:ring-0'
					/>
				</div>

				<div className='flex flex-col gap-3'>
					<ul className='flex flex-col gap-2'>
						{resProject?.map((items: ProjectItems) => {
							if (!items.id) return null;

							const isOpen = openedProjectIds.includes(items.id);

							return (
								<li key={items.id} className='rounded-md'>
									<div className='group relative cursor-pointer rounded-md pl-2 py-1 hover:bg-accent-foreground/10'>
										<div className='absolute -left-16 top-0 h-full w-16' />
										<span>{items.name}</span>

										<div className='invisible pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
											<div className='flex items-center gap-2'>
												<div className='rounded-md p-1 hover:bg-neutral-700'>
													<Plus size={16} />
												</div>

												<DropdownMenuDemo
													onConvert={() =>
														handleConvertProject(
															items,
														)
													}
												>
													<div className='rounded-md p-1 hover:bg-neutral-700'>
														<GripVertical
															size={16}
														/>
													</div>
												</DropdownMenuDemo>
											</div>
										</div>
									</div>

									{isOpen && (
										<ProjectBlockContainer
											project={items}
											workspaceId={
												currentWorkspaceId as string
											}
										/>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default SlugPage;

export function DropdownMenuDemo({
	children,
	onConvert,
}: {
	children: React.ReactNode;
	onConvert: () => void;
}) {
	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 asChild>{children}</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-52' align='center' side='left'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2>Settings</DropdownMenuLabelV2>

					<DropdownMenuItemV2 onSelect={onConvert}>
						<div className='flex items-center gap-2'>
							<RefreshCw size={16} />
							<div>Chuyển đổi</div>
						</div>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
}
