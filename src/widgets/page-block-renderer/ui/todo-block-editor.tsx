"use client";

import { NativeCheckbox } from "@/shared/ui/native-checkbox";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import {
	useBlockAutoFocus,
	usePageBlockEditor,
} from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { cn } from "@/shared/lib/utils";
import { useInlineMarks } from "@/widgets/page-block-renderer/model/use-inline-marks";
import { useBlockMentions } from "@/widgets/page-block-renderer/model/use-block-mentions";
import { tokensToDisplay } from "@/entities/comment/lib/mention-text";

interface TodoBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
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

export function TodoBlockEditor({ block, shareToken }: TodoBlockEditorProps) {
	const initial = getTodoContent(block);

	const [text, setText] = useState(
		() => tokensToDisplay(initial.text).text,
	);

	const [checked, setChecked] = useState(initial.checked);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const textTone = checked
		? "text-faint line-through"
		: "text-secondary-foreground dark:text-foreground";
	const mentions = useBlockMentions({
		pageId: block.page_id,
		enabled: !shareToken,
		storedText: initial.text,
		value: text,
		setValue: setText,
	});
	const inlineMarks = useInlineMarks(
		text,
		setText,
		cn("text-[15px] leading-6", textTone),
		mentions.toStored(text),
	);

	const updateBlock = useUpdatePageBlock(shareToken);

	const createBlock = useCreatePageBlock(shareToken);

	const { requestFocus } = usePageBlockEditor();

	useEffect(() => {
		const content = getTodoContent(block);

		setText(tokensToDisplay(content.text).text);
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
		mentions.track(event.target);

		resizeTextarea(event.target);
	};

	const handleCheckedChange = async (nextChecked: boolean) => {
		setChecked(nextChecked);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: mentions.toStored(text),
				checked: nextChecked,
			},
		});
	};

	const handleBlur = () => {
		const oldContent = getTodoContent(block);

		if (
			mentions.toStored(text) === oldContent.text &&
			checked === oldContent.checked
		) {
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: mentions.toStored(text),
				checked,
			},
		});
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (mentions.handleKeyDown(event)) return;
		if (inlineMarks.handleKeyDown(event)) return;

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
				text: mentions.toStored(before),
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
				text: mentions.toStored(after),
			},

			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	useBlockAutoFocus(block.id, textareaRef);

	return (
		<div className='flex min-h-6 w-full items-start gap-2.5'>
			<NativeCheckbox
				checked={checked}
				onChange={(event) => handleCheckedChange(event.target.checked)}
				className='
          mt-1
          size-4
          shrink-0
          cursor-pointer
        '
			/>

			<div className='relative min-w-0 flex-1'>
				<textarea
					ref={textareaRef}
					value={text}
					rows={1}
					placeholder='To-do'
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					{...mentions.comboboxProps}
					onFocus={inlineMarks.onFocus}
					onBlur={() => {
						inlineMarks.onBlur();
					mentions.close();
						handleBlur();
					}}
					className={cn(
						`
	          block
	          min-h-6
	          w-full
	          resize-none
	          overflow-hidden
	          border-0
	          bg-transparent
	          p-0
	          text-[15px]
	          leading-6
	          outline-none
	          placeholder:text-muted-foreground/40
	          focus-visible:ring-0
	        `,
						textTone,
						inlineMarks.textareaClassName,
					)}
				/>
				{inlineMarks.preview}
				{mentions.menu}
			</div>
		</div>
	);
}
