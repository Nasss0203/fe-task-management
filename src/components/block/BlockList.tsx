"use client";

import SimplePageBlockRenderer from "@/features/page-block/components/SimplePageBlockRenderer";
import { usePageBlock } from "@/features/page-block/hooks/usePageBlock";
import {
	CreatePageBlockPayload,
	normalizeDatabaseViewConfig,
	PageBlockItem,
	PageBlockType,
} from "@/services/page_block/type";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { ReactNode } from "react";
import CreateBlockMenu from "../dropdown/CreateBlockMenu";
import DropdownMenu from "../dropdown/DropdownMenu";
import ProjectBlockContainer from "./ProjectBlockContainer";

type BlockListProps = {
	page: any;
	blocks: PageBlockItem[];
};

type SortableBlockItemProps = {
	blockId: string;
	children: (props: {
		attributes: ReturnType<typeof useSortable>["attributes"];
		listeners: ReturnType<typeof useSortable>["listeners"];
		setActivatorNodeRef: ReturnType<
			typeof useSortable
		>["setActivatorNodeRef"];
		isDragging: boolean;
	}) => ReactNode;
};

const SortableBlockItem = ({ blockId, children }: SortableBlockItemProps) => {
	const {
		attributes,
		listeners,
		setActivatorNodeRef,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: blockId,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			className={`rounded-md ${isDragging ? "relative z-30 opacity-70" : ""}`}
		>
			{children({
				attributes,
				listeners,
				setActivatorNodeRef,
				isDragging,
			})}
		</li>
	);
};

const buildCreateBlockPayload = (
	pageId: string,
	type: PageBlockType,
): CreatePageBlockPayload => {
	const title =
		type === PageBlockType.HEADER
			? "Heading"
			: type === PageBlockType.DATABASE_VIEW
				? "Project view"
				: null;

	return {
		page_id: pageId,
		type,
		title,
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
	};
};

const BlockList = ({ blocks, page }: BlockListProps) => {
	const {
		createPageBlock: { mutate: createBlock },
		updatePageBlock: { mutate },
		deletePageBlock: { mutate: deleteBlock },
		reorderPageBlocks: { mutate: reorderBlocks },
	} = usePageBlock();
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 6,
			},
		}),
	);

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
		createBlock({
			...buildCreateBlockPayload(block.page_id, type),
			insert_after_block_id: block.id,
		});
	};

	const handleCreateFirstBlock = (type: PageBlockType) => {
		if (!page?.id) return;

		createBlock({
			...buildCreateBlockPayload(page.id, type),
			order_index: 0,
		});
	};

	const handleDeleteBlock = (block: PageBlockItem) => {
		const workspaceId = page?.workspace_id;

		if (!block.id || !block.page_id || !workspaceId) return;

		deleteBlock({
			blockId: block.id,
			pageId: block.page_id,
			workspaceId,
		});
	};

	const sortedBlocks = [...(Array.isArray(blocks) ? blocks : [])].sort(
		(a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!page?.id || !over || active.id === over.id) return;

		const oldIndex = sortedBlocks.findIndex(
			(block) => block.id === active.id,
		);
		const newIndex = sortedBlocks.findIndex(
			(block) => block.id === over.id,
		);

		if (oldIndex < 0 || newIndex < 0) return;

		const nextBlocks = arrayMove(sortedBlocks, oldIndex, newIndex);

		reorderBlocks({
			page_id: page.id,
			items: nextBlocks.map((block, index) => ({
				id: block.id,
				order_index: index,
			})),
		});
	};

	if (!sortedBlocks.length) {
		return (
			<div className='mt-6 min-h-32'>
				<div className='group relative h-8 rounded-md pl-14 hover:bg-accent-foreground/10'>
					<div className='absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100'>
						<CreateBlockMenu onCreate={handleCreateFirstBlock}>
							<button
								type='button'
								className='rounded-md p-1 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:text-white'
								aria-label='Create block'
							>
								<Plus size={16} />
							</button>
						</CreateBlockMenu>

						<button
							type='button'
							className='rounded-md p-1 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:text-white'
							aria-label='Block actions'
						>
							<GripVertical size={16} />
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis]}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={sortedBlocks.map((block) => block.id)}
				strategy={verticalListSortingStrategy}
			>
				<ul className='flex flex-col gap-2'>
					{sortedBlocks.map((block) => {
						if (!block.id) return null;

						const config =
							block.type === PageBlockType.DATABASE_VIEW
								? normalizeDatabaseViewConfig(
										block.data_config,
									)
								: null;
						const isOpen = block.is_open ?? false;

						return (
							<SortableBlockItem
								key={block.id}
								blockId={block.id}
							>
								{({
									attributes,
									listeners,
									setActivatorNodeRef,
									isDragging,
								}) => (
									<>
										<div
											className={`group relative cursor-pointer rounded-md py-1 pl-14 hover:bg-accent-foreground/10 ${
												isDragging
													? "bg-accent-foreground/10"
													: ""
											}`}
										>
											<div className='absolute left-0 top-0 h-full w-14' />

											{block.type ===
											PageBlockType.DATABASE_VIEW ? (
												<span className='pl-3'>
													{block.title ??
														"Untitled project"}
												</span>
											) : (
												<SimplePageBlockRenderer
													block={block}
													onUpdate={(nextBlock) =>
														mutate(nextBlock)
													}
													onCreateAfter={
														handleCreateBlockAfter
													}
												/>
											)}

											<div className='invisible pointer-events-none absolute left-1 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100'>
												<CreateBlockMenu
													onCreate={(type) =>
														handleCreateBlockAfter(
															block,
															type,
														)
													}
												>
													<button
														type='button'
														className='rounded-md p-1 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:text-white'
													>
														<Plus size={16} />
													</button>
												</CreateBlockMenu>

												<DropdownMenu
													onConvert={
														block.type ===
														PageBlockType.DATABASE_VIEW
															? () =>
																	handleUpdateDataConfigPageblock(
																		block,
																	)
															: undefined
													}
													onRemoveFromPage={() =>
														handleDeleteBlock(block)
													}
												>
													<button
														ref={
															setActivatorNodeRef
														}
														type='button'
														className='touch-none rounded-md p-1 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:text-white'
														{...attributes}
														{...listeners}
													>
														<GripVertical
															size={16}
														/>
													</button>
												</DropdownMenu>
											</div>
										</div>

										{block.type ===
											PageBlockType.DATABASE_VIEW &&
											isOpen &&
											config && (
												<ProjectBlockContainer
													blockId={block.id}
													projectId={
														config.project_id
													}
													workspaceId={
														config.workspace_id ??
														page?.workspace_id
													}
													isOpen={block.is_open}
													config={config}
													title={block.title ?? ""}
												/>
											)}

										{block.type ===
											PageBlockType.DATABASE_VIEW &&
											isOpen &&
											!config && (
												<div className='ml-14 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground'>
													Project view chua cau hinh.
												</div>
											)}
									</>
								)}
							</SortableBlockItem>
						);
					})}
				</ul>
			</SortableContext>
		</DndContext>
	);
};

export default BlockList;
