"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useDeletePageBlock,
	useTransformToDatabaseBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import {
	type MarkdownShortcut,
	matchMarkdownShortcut,
} from "@/entities/page-block/lib/match-markdown-shortcut";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	PageBlockCommand,
	PageBlockCommandMenu,
} from "@/widgets/page-block-editor/ui/page-block-command-menu";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";
import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface TextBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

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

export function TextBlockEditor({ block, shareToken }: TextBlockEditorProps) {
	const transformToDatabaseBlock = useTransformToDatabaseBlock();
	const deleteBlock = useDeletePageBlock(shareToken);
	const createBlock = useCreatePageBlock(shareToken);

	const [value, setValue] = useState(() => getText(block));

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [commandOpen, setCommandOpen] = useState(false);
	const [slashIndex, setSlashIndex] = useState<number | null>(null);

	const updateBlock = useUpdatePageBlock(shareToken);
	const { focusBlockId, requestFocus, clearFocus, getPreviousBlockId } =
		usePageBlockEditor();

	const resizeTextarea = (textarea?: HTMLTextAreaElement) => {
		const element = textarea ?? textareaRef.current;

		if (!element) return;

		element.style.height = "auto";
		element.style.height = `${element.scrollHeight}px`;
	};

	useEffect(() => {
		setValue(getText(block));
	}, [block]);

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const applyShortcut = async ({
		type,
		content,
		styleConfig,
	}: MarkdownShortcut) => {
		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
			type,
			content,
			styleConfig,
		});

		requestFocus(block.id);
	};

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textarea = event.target;

		const nextValue = textarea.value;

		const cursor = textarea.selectionStart;

		setValue(nextValue);

		resizeTextarea(textarea);

		const shortcut = matchMarkdownShortcut(nextValue, cursor);

		if (shortcut) {
			setCommandOpen(false);
			setSlashIndex(null);
			void applyShortcut(shortcut);
			return;
		}

		if (cursor > 0 && nextValue[cursor - 1] === "/") {
			setSlashIndex(cursor - 1);

			setCommandOpen(true);

			return;
		}

		setCommandOpen(false);
		setSlashIndex(null);
	};

	const handleSlashSelect = async ({
		type,
		styleConfig,
	}: PageBlockCommand) => {
		if (slashIndex === null) {
			return;
		}

		setCommandOpen(false);

		const nextValue =
			value.slice(0, slashIndex) + value.slice(slashIndex + 1);

		setSlashIndex(null);

		if (type === PageBlockType.DATABASE_VIEW) {
			if (shareToken) return;

			await transformToDatabaseBlock.mutateAsync({
				blockId: block.id,
				pageId: block.page_id,
				name: "Untitled",
			});

			return;
		}

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			type,

			content:
				type === PageBlockType.DIVIDER
					? null
					: {
							text: nextValue,
						},

			styleConfig: styleConfig ?? null,
		});

		if (type === PageBlockType.TEXT) {
			requestFocus(block.id);
		}
	};

	const handleBlur = () => {
		if (commandOpen) {
			return;
		}

		const oldValue = getText(block);

		if (value === oldValue) {
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: value,
			},
		});
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (event.key === "Backspace" && value.length === 0) {
			event.preventDefault();

			const previousBlockId = getPreviousBlockId(block.id);

			if (!previousBlockId) {
				return;
			}

			await deleteBlock.mutateAsync({
				blockId: block.id,
				pageId: block.page_id,
			});

			requestFocus(previousBlockId);

			return;
		}

		if (event.key !== "Enter" || event.shiftKey) {
			return;
		}

		event.preventDefault();

		const textarea = event.currentTarget;

		const start = textarea.selectionStart;

		const end = textarea.selectionEnd;

		const before = value.slice(0, start);

		const after = value.slice(end);

		setValue(before);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: before,
			},
		});

		const newBlock = await createBlock.mutateAsync({
			pageId: block.page_id,

			parentBlockId: block.parent_block_id,

			afterBlockId: block.id,

			type: PageBlockType.TEXT,

			content: {
				text: after,
			},

			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	useEffect(() => {
		if (focusBlockId !== block.id) {
			return;
		}

		const textarea = textareaRef.current;

		if (!textarea) {
			return;
		}

		textarea.focus();

		const length = textarea.value.length;

		textarea.setSelectionRange(length, length);

		clearFocus();
	}, [focusBlockId, block.id, clearFocus]);

	const closeCommand = () => {
		setCommandOpen(false);
		setSlashIndex(null);
	};

	return (
		<Popover
			open={commandOpen}
			onOpenChange={(open) => {
				if (!open) closeCommand();
			}}
		>
			<PopoverAnchor asChild>
				<div className='relative w-full'>
					<textarea
						ref={textareaRef}
						value={value}
						rows={1}
						placeholder="Type '/' for commands"
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						className='
		        block
		        min-h-7
		        w-full
		        resize-none
		        overflow-hidden
		        border-0
		        bg-transparent
		        p-0
		        text-base
		        leading-7
		        outline-none
		        placeholder:text-muted-foreground/50
		        focus-visible:ring-0
		      '
					/>
				</div>
			</PopoverAnchor>

			<PopoverContent
				side='bottom'
				align='start'
				sideOffset={4}
				collisionPadding={12}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					textareaRef.current?.focus();
				}}
				className='w-auto border-0 bg-transparent p-0 shadow-none'
			>
				<PageBlockCommandMenu
					onSelect={handleSlashSelect}
					onClose={closeCommand}
					allowDatabase={!shareToken}
				/>
			</PopoverContent>
		</Popover>
	);
}
