import { PageBlockItem } from "@/services/page_block/type";
import { useState } from "react";

type HeaderBlockProps = {
	block: PageBlockItem;
	text: string;
	title?: string | null;
	onUpdate: (block: PageBlockItem) => void;
};

const HeaderBlock = ({ block, text, title, onUpdate }: HeaderBlockProps) => {
	const [value, setValue] = useState(text || title || "");

	const handleSave = () => {
		if (value === text) return;

		onUpdate({
			...block,
			title: value || "Heading",
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
		<input
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={handleSave}
			className='w-full bg-transparent px-3 py-1 text-xl font-semibold outline-none'
			placeholder='Heading'
		/>
	);
};

export default HeaderBlock;
