"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useDeletePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface HeadingBlockEditorProps {
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

function getHeadingLevel(block: PageBlockNode): 1 | 2 | 3 {
	const config = block.style_config;

	if (!config) {
		return 1;
	}

	const level = config.level;

	if (level === 2) {
		return 2;
	}

	if (level === 3) {
		return 3;
	}

	return 1;
}

const headingStyles: Record<1 | 2 | 3, string> = {
	1: "text-3xl font-bold leading-10",
	2: "text-2xl font-semibold leading-8",
	3: "text-xl font-semibold leading-7",
};

export function HeadingBlockEditor({ block }: HeadingBlockEditorProps) {
	const [value, setValue] = useState(() => getText(block));

	const inputRef = useRef<HTMLInputElement>(null);

	const updateBlock = useUpdatePageBlock();

	const deleteBlock = useDeletePageBlock();

	const createBlock = useCreatePageBlock();

	const { focusBlockId, requestFocus, clearFocus, getPreviousBlockId } =
		usePageBlockEditor();

	const level = getHeadingLevel(block);

	const headingClass = headingStyles[level];

	useEffect(() => {
		setValue(getText(block));
	}, [block]);

	useEffect(() => {
		if (focusBlockId !== block.id) {
			return;
		}

		const input = inputRef.current;

		if (!input) {
			return;
		}

		input.focus();

		const length = input.value.length;

		input.setSelectionRange(length, length);

		clearFocus();
	}, [focusBlockId, block.id, clearFocus]);

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
		event: React.KeyboardEvent<HTMLInputElement>,
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

		if (event.key !== "Enter") {
			return;
		}

		event.preventDefault();

		const input = event.currentTarget;

		const start = input.selectionStart ?? value.length;

		const end = input.selectionEnd ?? value.length;

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
		<input
			ref={inputRef}
			value={value}
			type='text'
			placeholder={`Heading ${level}`}
			onChange={(event) => {
				setValue(event.target.value);
			}}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			className={`
                w-full
                border-0
                bg-transparent
                p-0
                outline-none
                placeholder:text-muted-foreground/40
                focus-visible:ring-0

                ${headingClass}
            `}
		/>
	);
}
