"use client";

import {
	ArrowLeft,
	CheckSquare,
	ChevronRight,
	Code2,
	Copy,
	Heading,
	Link,
	Minus,
	Quote,
	RotateCcw,
	Text,
	Trash2,
} from "lucide-react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useDeletePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/shared/ui/command";

import { useState } from "react";

interface PageBlockActionMenuProps {
	block: PageBlockNode;
	onClose?: () => void;
}

type MenuMode = "actions" | "turn-into";

const TURN_INTO_OPTIONS = [
	{
		label: "Text",
		type: PageBlockType.TEXT,
		icon: Text,
	},
	{
		label: "Heading",
		type: PageBlockType.HEADER,
		icon: Heading,
	},
	{
		label: "To-do",
		type: PageBlockType.TODO,
		icon: CheckSquare,
	},
	{
		label: "Toggle",
		type: PageBlockType.TOGGLE,
		icon: ChevronRight,
	},
	{
		label: "Quote",
		type: PageBlockType.QUOTE,
		icon: Quote,
	},
	{
		label: "Code",
		type: PageBlockType.CODE,
		icon: Code2,
	},
	{
		label: "Divider",
		type: PageBlockType.DIVIDER,
		icon: Minus,
	},
];

function getText(block: PageBlockNode): string {
	const content = block.content;

	if (
		content &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"text" in content &&
		typeof content.text === "string"
	) {
		return content.text;
	}

	return "";
}

export function PageBlockActionMenu({
	block,
	onClose,
}: PageBlockActionMenuProps) {
	const [mode, setMode] = useState<MenuMode>("actions");

	const createBlock = useCreatePageBlock();

	const updateBlock = useUpdatePageBlock();

	const deleteBlock = useDeletePageBlock();

	const handleCopyLink = async () => {
		const url =
			`${window.location.origin}` +
			`/page/${block.page_id}` +
			`#block-${block.id}`;

		await navigator.clipboard.writeText(url);

		onClose?.();
	};

	const handleCopyCode = async () => {
		await navigator.clipboard.writeText(getText(block));

		onClose?.();
	};

	const handleDuplicate = async () => {
		await createBlock.mutateAsync({
			pageId: block.page_id,

			parentBlockId: block.parent_block_id,

			afterBlockId: block.id,

			type: block.type,

			content: block.content,

			styleConfig: block.style_config,

			dataConfig: block.data_config,
		});

		onClose?.();
	};

	const handleDelete = async () => {
		await deleteBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
		});

		onClose?.();
	};

	const handleTurnInto = async (type: PageBlockType) => {
		if (type === block.type) {
			onClose?.();
			return;
		}

		const text = getText(block);

		let content: Record<string, unknown> | null;

		switch (type) {
			case PageBlockType.DIVIDER:
				content = null;
				break;

			case PageBlockType.TODO:
				content = {
					text,
					checked: false,
				};
				break;

			case PageBlockType.CODE:
				content = {
					text,
					language: "typescript",
				};
				break;

			default:
				content = {
					text,
				};
		}

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			type,

			content,

			/**
			 * Nếu block trước đó là loại
			 * có data config riêng thì
			 * không mang theo khi transform.
			 */
			dataConfig: null,
		});

		onClose?.();
	};

	if (mode === "turn-into") {
		return (
			<Command
				className='
                    w-[280px]
                    rounded-xl
                    border
                    bg-popover
                    shadow-xl
                '
			>
				<div className='flex h-9 items-center border-b px-2'>
					<button
						type='button'
						onClick={() => setMode("actions")}
						className='
                            flex
                            size-7
                            items-center
                            justify-center
                            rounded-md
                            text-muted-foreground
                            hover:bg-muted
                            hover:text-foreground
                        '
					>
						<ArrowLeft className='size-4' />
					</button>

					<span className='ml-1 text-sm font-medium'>Turn into</span>
				</div>

				<CommandInput placeholder='Search blocks...' className='h-9' />

				<CommandList className='max-h-[300px]'>
					<CommandEmpty>No results.</CommandEmpty>

					<CommandGroup>
						{TURN_INTO_OPTIONS.map((option) => {
							const Icon = option.icon;

							return (
								<CommandItem
									key={option.type}
									value={option.label}
									onSelect={() =>
										void handleTurnInto(option.type)
									}
									className='
                                            h-10
                                            cursor-pointer
                                            gap-2.5
                                            px-2
                                        '
								>
									<Icon className='size-4 text-muted-foreground' />

									<span>{option.label}</span>

									{block.type === option.type && (
										<span className='ml-auto text-xs text-muted-foreground'>
											Current
										</span>
									)}
								</CommandItem>
							);
						})}
					</CommandGroup>
				</CommandList>
			</Command>
		);
	}

	return (
		<Command
			className='
                w-[300px]
                rounded-xl
                border
                bg-popover
                shadow-xl
            '
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose?.();
				}
			}}
		>
			<CommandInput placeholder='Search actions...' className='h-9' />

			<CommandList className='max-h-[380px]'>
				<CommandEmpty>No actions found.</CommandEmpty>

				{/* Block specific */}
				{block.type === PageBlockType.CODE && (
					<>
						<CommandGroup heading='Code'>
							<CommandItem
								onSelect={() => void handleCopyCode()}
								className='h-10 cursor-pointer gap-2.5'
							>
								<Code2 className='size-4' />
								Copy code
							</CommandItem>
						</CommandGroup>

						<CommandSeparator />
					</>
				)}

				{/* Main actions */}
				<CommandGroup>
					<CommandItem
						onSelect={() => setMode("turn-into")}
						className='h-10 cursor-pointer gap-2.5'
					>
						<RotateCcw className='size-4' />

						<span>Turn into</span>

						<ChevronRight className='ml-auto size-4 text-muted-foreground' />
					</CommandItem>

					<CommandItem
						onSelect={() => void handleCopyLink()}
						className='h-10 cursor-pointer gap-2.5'
					>
						<Link className='size-4' />
						Copy link to block
					</CommandItem>

					<CommandItem
						onSelect={() => void handleDuplicate()}
						className='h-10 cursor-pointer gap-2.5'
					>
						<Copy className='size-4' />
						Duplicate
						<CommandShortcut>Ctrl+D</CommandShortcut>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup>
					<CommandItem
						onSelect={() => void handleDelete()}
						className='
                            h-10
                            cursor-pointer
                            gap-2.5
                            text-destructive
                            data-[selected=true]:text-destructive
                        '
					>
						<Trash2 className='size-4' />
						Delete
						<CommandShortcut>Del</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>

			<div
				className='
                    border-t
                    px-3
                    py-2
                    text-[11px]
                    text-muted-foreground
                '
			>
				Block · {block.type}
			</div>
		</Command>
	);
}
