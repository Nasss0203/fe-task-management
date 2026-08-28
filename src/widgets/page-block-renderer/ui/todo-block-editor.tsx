"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface TodoBlockEditorProps {
	block: PageBlockNode;
}

function getTodoContent(block: PageBlockNode) {
	const content = block.content;

	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			text:
				"text" in content && typeof content.text === "string"
					? content.text
					: "",

			checked:
				"checked" in content && typeof content.checked === "boolean"
					? content.checked
					: false,
		};
	}

	return {
		text: "",
		checked: false,
	};
}

export function TodoBlockEditor({ block }: TodoBlockEditorProps) {
	const initial = getTodoContent(block);

	const [text, setText] = useState(initial.text);

	const [checked, setChecked] = useState(initial.checked);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const updateBlock = useUpdatePageBlock();

	const createBlock = useCreatePageBlock();

	const { requestFocus } = usePageBlockEditor();

	useEffect(() => {
		const content = getTodoContent(block);

		setText(content.text);
		setChecked(content.checked);
	}, [block]);

	const resizeTextarea = (textarea?: HTMLTextAreaElement) => {
		const element = textarea ?? textareaRef.current;

		if (!element) return;

		element.style.height = "auto";

		element.style.height = `${element.scrollHeight}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [text]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(event.target.value);

		resizeTextarea(event.target);
	};

	const handleCheckedChange = async (nextChecked: boolean) => {
		setChecked(nextChecked);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text,
				checked: nextChecked,
			},
		});
	};

	const handleBlur = () => {
		const oldContent = getTodoContent(block);

		if (text === oldContent.text && checked === oldContent.checked) {
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text,
				checked,
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

		const before = text.slice(0, start);

		const after = text.slice(end);

		// Giữ phần trước cursor trong TODO hiện tại
		setText(before);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: before,
				checked,
			},
		});

		// Tạo TEXT block mới phía dưới
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
		<div className='flex min-h-7 w-full items-start gap-2'>
			<input
				type='checkbox'
				checked={checked}
				onChange={(event) => handleCheckedChange(event.target.checked)}
				className='
          mt-[6px]
          size-4
          shrink-0
          cursor-pointer
        '
			/>

			<textarea
				ref={textareaRef}
				value={text}
				rows={1}
				placeholder='To-do'
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
