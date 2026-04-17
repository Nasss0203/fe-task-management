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
import { usePage } from "@/hooks/use-page";
import { usePageBlock } from "@/hooks/use-pageBlock";
import { PageBlockItem } from "@/services/page/type";

import { GripVertical, Plus, RefreshCw } from "lucide-react";
import React, { useEffect, useRef } from "react";

const SlugPage = () => {
	const {
		pages: { data, isLoading },
	} = usePage();
	const {
		updatePageBlock: { mutate },
	} = usePageBlock();

	const page = data?.data;
	const blocks: PageBlockItem[] = page?.blocks ?? [];

	const initializedRef = useRef(false);

	useEffect(() => {
		if (!blocks.length || initializedRef.current) return;

		initializedRef.current = true;
	}, [blocks]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const handleUpdateDataConfigPageblock = (block: PageBlockItem) => {
		const currentConfig = block.data_config?.[0];

		if (!block.id || !currentConfig) return;

		mutate({
			...block,
			id: block.id,
			data_config: [
				{
					...currentConfig,
					is_open: !currentConfig.is_open,
				},
			],
		});
	};

	return (
		<div className='flex h-screen flex-col gap-5'>
			<div className='relative w-full'>
				<div className='sticky top-0 z-20 h-20 w-full rounded-lg bg-sidebar-accent'>
					<div className='flex h-full flex-1 items-center justify-center'>
						<div className='text-2xl text-white'>Image</div>
					</div>
				</div>
			</div>

			<div className='flex flex-col gap-3 px-20'>
				<div className='w-full'>
					<textarea
						defaultValue={page?.title}
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
						{blocks
							.sort(
								(a, b) =>
									(a.order_index ?? 0) - (b.order_index ?? 0),
							)
							.map((block) => {
								if (!block.id) return null;

								const config = block.data_config?.[0];
								const projectId = config?.project_id;
								const workspaceId =
									config?.workspace_id ?? page?.workspace_id;
								const isOpen = config?.is_open ?? false;

								if (!projectId || !workspaceId) return null;

								return (
									<li
										key={block.id}
										className='rounded-md'
										// ref={}
									>
										<div className='group relative cursor-pointer rounded-md py-1 pl-2 hover:bg-accent-foreground/10'>
											<div className='absolute -left-16 top-0 h-full w-16' />

											<span>
												{block.title ??
													"Untitled project"}
											</span>

											<div className='invisible pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
												<div className='flex items-center gap-2'>
													<button
														type='button'
														className='rounded-md p-1 hover:bg-neutral-700'
													>
														<Plus size={16} />
													</button>

													<DropdownMenuDemo
														onConvert={() =>
															handleUpdateDataConfigPageblock(
																block,
															)
														}
													>
														<button
															type='button'
															className='rounded-md p-1 hover:bg-neutral-700'
														>
															<GripVertical
																size={16}
															/>
														</button>
													</DropdownMenuDemo>
												</div>
											</div>
										</div>

										{isOpen && (
											<div className='mt-2'>
												<ProjectBlockContainer
													projectId={projectId}
													workspaceId={workspaceId}
													configs={
														block.data_config ?? []
													}
													title={block.title ?? ""}
												/>
											</div>
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
	onConvert?: () => void;
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
