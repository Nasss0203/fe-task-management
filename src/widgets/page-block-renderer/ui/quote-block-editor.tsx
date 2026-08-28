"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface QuoteBlockEditorProps {
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

export function QuoteBlockEditor({ block }: QuoteBlockEditorProps) {
	const [value, setValue] = useState(() => getText(block));

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const updateBlock = useUpdatePageBlock();

	const createBlock = useCreatePageBlock();

	const { requestFocus } = usePageBlockEditor();

	useEffect(() => {
		setValue(getText(block));
	}, [block]);

	const resizeTextarea = (textarea?: HTMLTextAreaElement) => {
		const element = textarea ?? textareaRef.current;

		if (!element) return;

		element.style.height = "auto";

		element.style.height = `${element.scrollHeight}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);

		resizeTextarea(event.target);
	};

	const handleBlur = () => {
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

	return (
		<div className='flex min-h-7 w-full'>
			<div className='mr-3 w-[3px] shrink-0 rounded-full bg-foreground' />

			<textarea
				ref={textareaRef}
				value={value}
				rows={1}
				placeholder='Quote'
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
          placeholder:text-muted-foreground/40
          focus-visible:ring-0
        '
			/>
		</div>
	);
}
