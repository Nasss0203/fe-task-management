import { PageBlockItem } from "@/services/page_block/type";
import { useEffect, useRef, useState } from "react";

type QuoteBlockProps = {
	block: PageBlockItem;
	text: string;
	onUpdate: (block: PageBlockItem) => void;
};

const getContentObject = (block: PageBlockItem) => {
	if (
		block.content &&
		typeof block.content === "object" &&
		!Array.isArray(block.content)
	) {
		return block.content;
	}

	return {};
};

const QuoteBlock = ({ block, text, onUpdate }: QuoteBlockProps) => {
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
				...getContentObject(block),
				text: value,
			},
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Escape") {
			setValue(text);
			event.currentTarget.blur();
			return;
		}

		if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			handleSave();
			event.currentTarget.blur();
		}
	};

	return (
		<div className='my-2 border-l-[3px] border-foreground/80 pl-1'>
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onBlur={handleSave}
				onKeyDown={handleKeyDown}
				placeholder='Quote'
				rows={1}
				className='block w-full resize-none overflow-hidden bg-transparent px-4 py-1 text-[15px] italic leading-relaxed text-foreground outline-none placeholder:font-normal placeholder:not-italic placeholder:text-muted-foreground/50'
			/>
		</div>
	);
};

export default QuoteBlock;
