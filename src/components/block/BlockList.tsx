"use client";
import { usePageBlock } from "@/hooks/use-pageBlock";
import { PageBlockItem } from "@/services/page_block/type";
import { GripVertical, Plus } from "lucide-react";
import DropdownMenu from "../dropdown/DropdownMenu";
import ProjectBlockContainer from "./ProjectBlockContainer";

type BlockListProps = {
	page: any;
	blocks: any;
};

const BlockList = ({ blocks, page }: BlockListProps) => {
	const {
		updatePageBlock: { mutate },
	} = usePageBlock();

	const handleUpdateDataConfigPageblock = (block: PageBlockItem) => {
		if (!block.id) return;

		mutate({
			...block,
			id: block.id,
			is_open: !block.is_open,
		});
	};
	return (
		<div className='flex flex-col gap-3'>
			<ul className='flex flex-col gap-2'>
				{blocks
					.sort(
						(a: any, b: any) =>
							(a.order_index ?? 0) - (b.order_index ?? 0),
					)
					.map((block: any) => {
						if (!block.id) return null;

						const config = block.data_config?.[0];
						const projectId = config?.project_id;
						const workspaceId =
							config?.workspace_id ?? page?.workspace_id;
						const isOpen = block.is_open ?? false;

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
										{block.title ?? "Untitled project"}
									</span>

									<div className='invisible pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
										<div className='flex items-center gap-2'>
											<button
												type='button'
												className='rounded-md p-1 hover:bg-neutral-700'
											>
												<Plus size={16} />
											</button>

											<DropdownMenu
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
													<GripVertical size={16} />
												</button>
											</DropdownMenu>
										</div>
									</div>
								</div>

								{isOpen && (
									<div className='mt-2'>
										<ProjectBlockContainer
											projectId={projectId}
											workspaceId={workspaceId}
											isOpen={block.is_open}
											configs={block.data_config ?? []}
											title={block.title ?? ""}
										/>
									</div>
								)}
							</li>
						);
					})}
			</ul>
		</div>
	);
};

export default BlockList;
