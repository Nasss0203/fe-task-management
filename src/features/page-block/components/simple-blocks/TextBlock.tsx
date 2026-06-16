"use client";
import { PageBlockItem } from "@/services/page_block/type";
import { useEffect, useMemo, useState } from "react";

type TextBlockProps = {
	block: PageBlockItem;
	text: string;
	onUpdate: (block: PageBlockItem) => void;
};

const TextBlock = ({ block, text, onUpdate }: TextBlockProps) => {
	const [value, setValue] = useState(text);

	useEffect(() => {
		setValue(text);
	}, [text]);

	const rows = useMemo(() => {
		return Math.max(value.split("\n").length, 1);
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
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={handleSave}
			rows={rows}
			placeholder='Text'
			className='w-full resize-none overflow-hidden bg-transparent px-3 text-sm leading-6 text-foreground outline-none'
		/>
	);
};

export default TextBlock;
