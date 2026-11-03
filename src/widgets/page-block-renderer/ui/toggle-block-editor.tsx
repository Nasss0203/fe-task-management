"use client";

import { ChevronRight } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { cn } from "@/shared/lib/utils";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockEditorRow } from "@/widgets/page-block-editor/ui/page-block-editor-row";

interface ToggleBlockEditorProps {
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

export function ToggleBlockEditor({ block, shareToken }: ToggleBlockEditorProps) {
	const [value, setValue] = useState(() => getText(block));

	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * Tránh create child nhiều lần khi
	 * query đang invalidate/refetch.
	 */
	const creatingChildRef = useRef(false);

	const updateBlock = useUpdatePageBlock(shareToken);

	const createBlock = useCreatePageBlock(shareToken);

	const { focusBlockId, requestFocus, clearFocus } = usePageBlockEditor();

	useEffect(() => {
		setValue(getText(block));
	}, [block]);

	/**
	 * Backspace ở child đầu tiên sẽ focus về title.
	 */
	useEffect(() => {
		if (focusBlockId !== block.id) {
			return;
		}

		inputRef.current?.focus();

		clearFocus();
	}, [focusBlockId, block.id, clearFocus]);

	const addChild = async () => {
		if (creatingChildRef.current) {
			return;
		}

		creatingChildRef.current = true;

		try {
			const newBlock = await createBlock.mutateAsync({
				pageId: block.page_id,

				parentBlockId: block.id,

				type: PageBlockType.TEXT,

				content: {
					text: "",
				},
			});

			requestFocus(newBlock.id);
		} finally {
			creatingChildRef.current = false;
		}
	};

	const handleToggle = () => {
		updateBlock.mutate({
			blockId: block.id,

			pageId: block.page_id,

			isOpen: !block.is_open,
		});
	};

	const saveTitle = () => {
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

	/**
	 * Enter ở title: mở Toggle rồi đi vào child đầu tiên
	 * (chưa có child thì tạo mới).
	 */
	const handleTitleKeyDown = async (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		// Bỏ qua Enter dùng để chốt chữ của bộ gõ tiếng Việt
		if (event.key !== "Enter" || event.nativeEvent.isComposing) {
			return;
		}

		event.preventDefault();

		saveTitle();

		if (!block.is_open) {
			await updateBlock.mutateAsync({
				blockId: block.id,

				pageId: block.page_id,

				isOpen: true,
			});
		}

		const firstChild = block.children[0];

		if (firstChild) {
			requestFocus(firstChild.id);

			return;
		}

		await addChild();
	};

	return (
		<div className='w-full'>
			{/* Toggle title */}
			<div className='flex min-h-6 items-start gap-0.5'>
				<button
					type='button'
					aria-label={block.is_open ? "Collapse toggle" : "Expand toggle"}
					aria-expanded={block.is_open}
					onClick={handleToggle}
					className='
                        mt-0.5
                        flex
                        size-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        text-muted-foreground
                        transition-colors
                        hover:bg-accent
                        hover:text-foreground
                    '
				>
					<ChevronRight
						className={cn(
							"size-4 transition-transform duration-200",
							block.is_open && "rotate-90",
						)}
					/>
				</button>

				<input
					ref={inputRef}
					value={value}
					placeholder='Toggle'
					onChange={(event) => {
						setValue(event.target.value);
					}}
					onKeyDown={(event) => {
						void handleTitleKeyDown(event);
					}}
					onBlur={saveTitle}
					className='
                        min-h-6
                        w-full
                        border-0
                        bg-transparent
                        p-0
                        text-[15px]
                        font-medium
                        leading-6
                        outline-none
                        placeholder:text-faint
                        focus-visible:ring-0
                    '
				/>
			</div>

			{/* Children: dùng cùng row với block gốc để có "+", menu block và "/" */}
			{block.is_open && block.children.length > 0 && (
				<div className='-ml-[34px] mt-1 space-y-1'>
					{block.children.map((child) => (
						<PageBlockEditorRow
							key={child.id}
							block={child}
							shareToken={shareToken}
						/>
					))}
				</div>
			)}

			{block.is_open && block.children.length === 0 && (
				<button
					type='button'
					onClick={() => {
						void addChild();
					}}
					className='
                        mt-1
                        ml-[18px]
                        block
                        rounded-md
                        px-1
                        text-left
                        text-[13px]
                        leading-7
                        text-faint
                        transition-colors
                        hover:bg-accent
                        hover:text-muted-foreground
                    '
				>
					Empty toggle. Click or press Enter to add a block.
				</button>
			)}
		</div>
	);
}
