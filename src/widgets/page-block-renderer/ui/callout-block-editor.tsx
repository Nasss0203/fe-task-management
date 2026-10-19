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

interface CalloutBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function CalloutBlockEditor({
	block,
	shareToken,
}: CalloutBlockEditorProps) {
	const [value, setValue] = useState(() =>
		getString(getContent(block), "text"),
	);
	const [toneOpen, setToneOpen] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

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
		setValue(getString(getContent(block), "text"));
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
				text: value,
				icon: CALLOUT_TONES[nextTone].icon,
			},
			styleConfig: { ...block.style_config, tone: nextTone },
		});
	};

	const handleBlur = () => {
		if (value === getString(getContent(block), "text")) return;

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...getContent(block), text: value },
		});
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (event.key !== "Enter" || event.shiftKey) return;

		event.preventDefault();

		const textarea = event.currentTarget;
		const before = value.slice(0, textarea.selectionStart);
		const after = value.slice(textarea.selectionEnd);

		setValue(before);

		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...getContent(block), text: before },
		});

		const newBlock = await createBlock.mutateAsync({
			pageId: block.page_id,
			parentBlockId: block.parent_block_id,
			afterBlockId: block.id,
			type: PageBlockType.TEXT,
			content: { text: after },
			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	useBlockAutoFocus(block.id, textareaRef);

	return (
		<div
			className={`flex w-full items-start gap-3 rounded-md px-4 py-3 ${CALLOUT_TONES[tone].className}`}
		>
			<Popover open={toneOpen} onOpenChange={setToneOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						aria-label='Change callout style'
						className='flex size-7 shrink-0 items-center justify-center rounded-md text-lg hover:bg-foreground/10'
					>
						{getCalloutIcon(block)}
					</button>
				</PopoverTrigger>

				<PopoverContent side='bottom' align='start' className='w-44 p-1'>
					{(Object.keys(CALLOUT_TONES) as CalloutTone[]).map((key) => (
						<button
							key={key}
							type='button'
							onClick={() => handleToneSelect(key)}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<span
								aria-hidden='true'
								className={`flex size-6 items-center justify-center rounded ${CALLOUT_TONES[key].className}`}
							>
								{CALLOUT_TONES[key].icon}
							</span>
							{CALLOUT_TONES[key].label}
						</button>
					))}
				</PopoverContent>
			</Popover>

			<textarea
				ref={textareaRef}
				value={value}
				rows={1}
				placeholder='Callout'
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
