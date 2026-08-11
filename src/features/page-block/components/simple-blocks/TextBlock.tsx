"use client";
import { PageBlockItem } from "@/services/page_block/type";
import { useEffect, useRef, useState } from "react";

type TextBlockProps = {
	block: PageBlockItem;
	text: string;
	onUpdate: (block: PageBlockItem) => void;
};

const TextBlock = ({ block, text, onUpdate }: TextBlockProps) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [value, setValue] = useState(text);

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	useEffect(() => {
		setValue(text);
	}, [text]);

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const handleSave = () => {
		if (value === text) return;

		onUpdate({
			...block,
			content: {
				...(typeof block.content === "object" &&
				block.content &&
				!Array.isArray(block.content)
					? block.content
					: {}),
				text: value,
			},
		});
	};

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={handleSave}
			rows={1}
			placeholder='Text'
			wrap='soft'
			className='block min-h-6 w-full min-w-0 resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent px-3 text-sm leading-6 text-foreground outline-none'
		/>
	);
};

export default TextBlock;
