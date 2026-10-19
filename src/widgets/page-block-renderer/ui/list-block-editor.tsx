"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	getContent,
	getString,
	ListMarker,
} from "@/entities/page-block/ui/read-only-block-content";
import {
	useBlockAutoFocus,
	usePageBlockEditor,
} from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface ListBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function ListBlockEditor({ block, shareToken }: ListBlockEditorProps) {
	const [value, setValue] = useState(() =>
		getString(getContent(block), "text"),
	);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const updateBlock = useUpdatePageBlock(shareToken);
	const createBlock = useCreatePageBlock(shareToken);
	const { requestFocus } = usePageBlockEditor();

	const isNumbered = block.type === PageBlockType.NUMBERED_LIST;

	const resizeTextarea = (textarea?: HTMLTextAreaElement) => {
		const element = textarea ?? textareaRef.current;

		if (!element) return;

		element.style.height = "auto";
		element.style.height = `${element.scrollHeight}px`;
	};

	useEffect(() => {
		setValue(getString(getContent(block), "text"));
	}, [block]);

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const turnIntoText = async () => {
		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
			type: PageBlockType.TEXT,
			content: { text: value },
		});

		requestFocus(block.id);
	};

	const handleBlur = () => {
		if (value === getString(getContent(block), "text")) return;

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: { text: value },
		});
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		const textarea = event.currentTarget;

		if (
			event.key === "Backspace" &&
			textarea.selectionStart === 0 &&
			textarea.selectionEnd === 0
		) {
			event.preventDefault();
			await turnIntoText();
			return;
		}

		if (event.key !== "Enter" || event.shiftKey) return;

		event.preventDefault();

		if (!value) {
			await turnIntoText();
			return;
		}

		const before = value.slice(0, textarea.selectionStart);
		const after = value.slice(textarea.selectionEnd);

		setValue(before);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
			content: { text: before },
		});

		const newBlock = await createBlock.mutateAsync({
			pageId: block.page_id,
			parentBlockId: block.parent_block_id,
			afterBlockId: block.id,
			type: block.type,
			content: { text: after },
			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	useBlockAutoFocus(block.id, textareaRef);

	return (
		<div className='flex min-h-7 w-full items-start gap-1'>
			<ListMarker
				number={isNumbered ? (block.list_number ?? 1) : undefined}
			/>

			<textarea
				ref={textareaRef}
				value={value}
				rows={1}
				placeholder='List'
				aria-label={
					isNumbered ? "Numbered list item" : "Bulleted list item"
				}
				onChange={(event) => {
					setValue(event.target.value);
					resizeTextarea(event.target);
				}}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				className='block min-h-7 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-base leading-7 outline-none placeholder:text-muted-foreground/40 focus-visible:ring-0'
			/>
		</div>
	);
}
