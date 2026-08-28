"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockRenderer } from "@/widgets/page-block/ui/page-block-renderer";

interface ToggleBlockEditorProps {
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

export function ToggleBlockEditor({ block }: ToggleBlockEditorProps) {
	const [value, setValue] = useState(() => getText(block));

	/**
	 * Tránh create child nhiều lần khi
	 * query đang invalidate/refetch.
	 */
	const creatingChildRef = useRef(false);

	const updateBlock = useUpdatePageBlock();

	const createBlock = useCreatePageBlock();

	const { requestFocus } = usePageBlockEditor();

	useEffect(() => {
		setValue(getText(block));
	}, [block]);

	/**
	 * Nếu Toggle vừa được transform từ "/"
	 * và mặc định đã mở nhưng chưa có child,
	 * tự tạo TEXT child.
	 */
	useEffect(() => {
		if (!block.is_open) {
			return;
		}

		if (block.children.length > 0) {
			creatingChildRef.current = false;

			return;
		}

		if (creatingChildRef.current) {
			return;
		}

		creatingChildRef.current = true;

		void createBlock
			.mutateAsync({
				pageId: block.page_id,

				parentBlockId: block.id,

				type: PageBlockType.TEXT,

				content: {
					text: "",
				},

				styleConfig: {},
				dataConfig: {},
			})
			.then((newBlock) => {
				requestFocus(newBlock.id);
			})
			.catch(() => {
				creatingChildRef.current = false;
			});
	}, [block.id, block.page_id, block.is_open, block.children.length]);

	const handleToggle = async () => {
		/**
		 * Đóng Toggle.
		 */
		if (block.is_open) {
			await updateBlock.mutateAsync({
				blockId: block.id,

				pageId: block.page_id,

				isOpen: false,
			});

			return;
		}

		/**
		 * Mở Toggle.
		 */
		await updateBlock.mutateAsync({
			blockId: block.id,

			pageId: block.page_id,

			isOpen: true,
		});

		/**
		 * Nếu chưa có child,
		 * tạo TEXT child ngay lập tức.
		 */
		if (block.children.length === 0 && !creatingChildRef.current) {
			creatingChildRef.current = true;

			try {
				const newBlock = await createBlock.mutateAsync({
					pageId: block.page_id,

					parentBlockId: block.id,

					type: PageBlockType.TEXT,

					content: {
						text: "",
					},

					styleConfig: {},
					dataConfig: {},
				});

				requestFocus(newBlock.id);
			} finally {
				creatingChildRef.current = false;
			}
		}
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

	return (
		<div className='w-full'>
			{/* Toggle title */}
			<div className='flex min-h-7 items-start'>
				<button
					type='button'
					onClick={() => {
						void handleToggle();
					}}
					className='
                        flex
                        size-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        text-muted-foreground
                        hover:bg-muted
                    '
				>
					{block.is_open ? (
						<ChevronDown className='size-4' />
					) : (
						<ChevronRight className='size-4' />
					)}
				</button>

				<input
					value={value}
					placeholder='Toggle'
					onChange={(event) => {
						setValue(event.target.value);
					}}
					onBlur={handleBlur}
					className='
                        min-h-7
                        w-full
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

			{/* Children */}
			{block.is_open && (
				<div className='ml-7 pl-2'>
					{block.children.map((child) => (
						<PageBlockRenderer key={child.id} block={child} />
					))}
				</div>
			)}
		</div>
	);
}
