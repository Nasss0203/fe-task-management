import { PageBlockItem } from "@/services/page_block/type";
import { useEffect, useRef, useState } from "react";

type CodeBlockProps = {
	block: PageBlockItem;
	code: string;
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

const CodeBlock = ({ block, code, onUpdate }: CodeBlockProps) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [value, setValue] = useState(code);

	useEffect(() => {
		setValue(code);
	}, [code]);

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const handleSave = () => {
		if (value === code) return;

		onUpdate({
			...block,
			content: {
				...getContentObject(block),
				code: value,
				language: "typescript",
			},
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Escape") {
			setValue(code);
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
		<textarea
			ref={textareaRef}
			value={value}
			onChange={(event) => setValue(event.target.value)}
			onBlur={handleSave}
			onKeyDown={handleKeyDown}
			rows={1}
			placeholder='// Code'
			spellCheck={false}
			className='my-1 block w-full resize-none overflow-hidden rounded-md bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-200 outline-none'
		/>
	);
};

export default CodeBlock;
