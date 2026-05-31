"use client";

import { usePageBlock } from "@/features/page-block/hooks/usePageBlock";
import SimplePageBlockRenderer from "@/features/page-block/components/SimplePageBlockRenderer";
import {
	normalizeDatabaseViewConfig,
	PageBlockItem,
	PageBlockType,
} from "@/services/page_block/type";
import { GripVertical, Plus } from "lucide-react";
import CreateBlockMenu from "../dropdown/CreateBlockMenu";
import DropdownMenu from "../dropdown/DropdownMenu";
import ProjectBlockContainer from "./ProjectBlockContainer";

type BlockListProps = {
	page: any;
	blocks: PageBlockItem[];
};

const BlockList = ({ blocks, page }: BlockListProps) => {
	const {
		createPageBlock: { mutate: createBlock },
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

	const handleCreateBlockAfter = (
		block: PageBlockItem,
		type: PageBlockType,
	) => {
		const title =
			type === PageBlockType.HEADER
				? "Heading"
				: type === PageBlockType.DATABASE_VIEW
					? "Project view"
					: null;

		createBlock({
			page_id: block.page_id,
			type,
			title,
			insert_after_block_id: block.id,
			content:
				type === PageBlockType.TEXT
					? { text: "" }
					: type === PageBlockType.HEADER
						? { text: "Heading" }
						: type === PageBlockType.TODO
							? { text: "", checked: false }
							: type === PageBlockType.QUOTE
								? { text: "" }
								: type === PageBlockType.CODE
									? { code: "", language: "typescript" }
									: null,
			style_config: type === PageBlockType.HEADER ? { level: 2 } : null,
			data_config: null,
			is_open: true,
		});
	};

	const sortedBlocks = [...(Array.isArray(blocks) ? blocks : [])].sort(
		(a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
	);

	return (
		<ul className='flex flex-col gap-2'>
			{sortedBlocks.map((block) => {
				if (!block.id) return null;

				const config =
					block.type === PageBlockType.DATABASE_VIEW
						? normalizeDatabaseViewConfig(block.data_config)
						: null;
				const isOpen = block.is_open ?? false;

				return (
					<li key={block.id} className='rounded-md'>
						<div className='group relative cursor-pointer rounded-md py-1 pl-14 hover:bg-accent-foreground/10'>
							<div className='absolute left-0 top-0 h-full w-14' />

							{block.type === PageBlockType.DATABASE_VIEW ? (
								<span className='pl-3'>
									{block.title ?? "Untitled project"}
								</span>
							) : (
								<SimplePageBlockRenderer block={block} />
							)}

							<div className='invisible pointer-events-none absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
								<CreateBlockMenu
									onCreate={(type) =>
										handleCreateBlockAfter(block, type)
									}
								>
									<button
										type='button'
										className='rounded-md p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white'
									>
										<Plus size={16} />
									</button>
								</CreateBlockMenu>

								<DropdownMenu
									onConvert={() =>
										handleUpdateDataConfigPageblock(block)
									}
								>
									<button
										type='button'
										className='rounded-md p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white'
									>
										<GripVertical size={16} />
									</button>
								</DropdownMenu>
							</div>
						</div>

						{block.type === PageBlockType.DATABASE_VIEW &&
							isOpen &&
							config && (
								<ProjectBlockContainer
									blockId={block.id}
									projectId={config.project_id}
									workspaceId={
										config.workspace_id ??
										page?.workspace_id
									}
									isOpen={block.is_open}
									config={config}
									title={block.title ?? ""}
								/>
							)}

						{block.type === PageBlockType.DATABASE_VIEW &&
							isOpen &&
							!config && (
								<div className='ml-14 rounded-md border border-dashed border-neutral-800 px-3 py-4 text-sm text-neutral-500'>
									Project view chua cau hinh.
								</div>
							)}
					</li>
				);
			})}
		</ul>
	);
};

export default BlockList;
