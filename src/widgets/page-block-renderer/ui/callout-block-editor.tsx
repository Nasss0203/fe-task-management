"use client";

import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	CALLOUT_TONES,
	type CalloutTone,
	getCalloutIcon,
	getCalloutTone,
	getContent,
	getString,
} from "@/entities/page-block/ui/read-only-block-content";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
	useBlockAutoFocus,
	usePageBlockEditor,
} from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { cn } from "@/shared/lib/utils";
import { useInlineMarks } from "@/widgets/page-block-renderer/model/use-inline-marks";
import { useBlockMentions } from "@/widgets/page-block-renderer/model/use-block-mentions";
import { tokensToDisplay } from "@/entities/comment/lib/mention-text";

interface CalloutBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function CalloutBlockEditor({
	block,
	shareToken,
}: CalloutBlockEditorProps) {
	const [value, setValue] = useState(
		() => tokensToDisplay(getString(getContent(block), "text")).text,
	);
	const [toneOpen, setToneOpen] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const mentions = useBlockMentions({
		pageId: block.page_id,
		enabled: !shareToken,
		storedText: getString(getContent(block), "text"),
		value: value,
		setValue: setValue,
	});
	const inlineMarks = useInlineMarks(
		value,
		setValue,
		"text-[15px] leading-6 text-secondary-foreground dark:text-foreground",
		mentions.toStored(value),
		mentions.pageTitles,
	);

	const updateBlock = useUpdatePageBlock(shareToken);
	const createBlock = useCreatePageBlock(shareToken);
	const { requestFocus } = usePageBlockEditor();

	const tone = getCalloutTone(block.style_config);

	const resizeTextarea = (textarea?: HTMLTextAreaElement) => {
		const element = textarea ?? textareaRef.current;

		if (!element) return;

		element.style.height = "auto";
		element.style.height = `${element.scrollHeight}px`;
	};

	useEffect(() => {
		setValue(tokensToDisplay(getString(getContent(block), "text")).text);
	}, [block]);

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const handleToneSelect = (nextTone: CalloutTone) => {
		setToneOpen(false);

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: {
				...getContent(block),
				text: mentions.toStored(value),
				icon: CALLOUT_TONES[nextTone].icon,
			},
			styleConfig: { ...block.style_config, tone: nextTone },
		});
	};

	const handleBlur = () => {
		if (mentions.toStored(value) === getString(getContent(block), "text"))
			return;

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...getContent(block), text: mentions.toStored(value) },
		});
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (mentions.handleKeyDown(event)) return;
		if (inlineMarks.handleKeyDown(event)) return;

		if (event.key !== "Enter" || event.shiftKey) return;

		event.preventDefault();

		const textarea = event.currentTarget;
		const before = value.slice(0, textarea.selectionStart);
		const after = value.slice(textarea.selectionEnd);

		setValue(before);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...getContent(block), text: mentions.toStored(before) },
		});

		const newBlock = await createBlock.mutateAsync({
			pageId: block.page_id,
			parentBlockId: block.parent_block_id,
			afterBlockId: block.id,
			type: PageBlockType.TEXT,
			content: { text: mentions.toStored(after) },
			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	useBlockAutoFocus(block.id, textareaRef);

	return (
		<div
			className={`flex w-full items-start gap-3 rounded-lg px-4 py-3.5 ${CALLOUT_TONES[tone].className}`}
		>
			<Popover open={toneOpen} onOpenChange={setToneOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						aria-label='Change callout style'
						className='flex size-6 shrink-0 items-center justify-center rounded-md text-lg hover:bg-foreground/10'
					>
						{getCalloutIcon(block)}
					</button>
				</PopoverTrigger>

				<PopoverContent side='bottom' align='start' className='w-52 p-1'>
					{(Object.keys(CALLOUT_TONES) as CalloutTone[]).map((key) => (
						<button
							key={key}
							type='button'
							onClick={() => handleToneSelect(key)}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13.5px] hover:bg-accent'
						>
							<span
								aria-hidden='true'
								className={`flex size-[18px] items-center justify-center rounded text-[11px] ${CALLOUT_TONES[key].className}`}
							>
								{CALLOUT_TONES[key].icon}
							</span>
							{CALLOUT_TONES[key].label}
						</button>
					))}
				</PopoverContent>
			</Popover>

			<div className='relative min-w-0 flex-1'>
				<textarea
					ref={textareaRef}
					value={value}
					rows={1}
					placeholder='Callout'
					onChange={(event) => {
						setValue(event.target.value);
						mentions.track(event.target);
						resizeTextarea(event.target);
					}}
					onKeyDown={handleKeyDown}
					{...mentions.comboboxProps}
					onFocus={inlineMarks.onFocus}
					onBlur={() => {
						inlineMarks.onBlur();
					mentions.close();
						handleBlur();
					}}
					className={cn(
						`block min-h-6 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[15px] leading-6 text-secondary-foreground dark:text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:ring-0`,
						inlineMarks.textareaClassName,
					)}
				/>
				{inlineMarks.preview}
				{mentions.menu}
			</div>
		</div>
	);
}
