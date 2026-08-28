"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useDeletePageBlock,
	useTransformToDatabaseBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	PageBlockCommand,
	PageBlockCommandMenu,
} from "@/widgets/page-block-editor/ui/page-block-command-menu";
import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface TextBlockEditorProps {
	block: PageBlockNode;
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

export function TextBlockEditor({ block }: TextBlockEditorProps) {
	const transformToDatabaseBlock = useTransformToDatabaseBlock();
	const deleteBlock = useDeletePageBlock();
	const createBlock = useCreatePageBlock();

	const [value, setValue] = useState(() => getText(block));

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [commandOpen, setCommandOpen] = useState(false);
	const [slashIndex, setSlashIndex] = useState<number | null>(null);

	const updateBlock = useUpdatePageBlock();
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

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const textarea = event.target;

		const nextValue = textarea.value;

		const cursor = textarea.selectionStart;

		setValue(nextValue);

		resizeTextarea(textarea);

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

	return (
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

			{commandOpen && (
				<div
					className='
          absolute
          left-0
          top-full
          z-50
          mt-1
          w-64
          rounded-lg
          border
          bg-popover
          shadow-xl
        '
				>
					<PageBlockCommandMenu onSelect={handleSlashSelect} />
				</div>
			)}
		</div>
	);
}
