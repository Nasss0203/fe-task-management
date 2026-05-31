import { cn } from "@/lib/utils";
import { PageBlockItem, PageBlockType } from "@/services/page_block/type";
import { Square, SquareCheck } from "lucide-react";
import { useEffect, useState } from "react";

type TodoBlockProps = {
	block: PageBlockItem;
	content: Record<string, unknown>;
	onUpdate: (block: PageBlockItem) => void;
	onCreateAfter: (block: PageBlockItem, type: PageBlockType) => void;
};

const getTodoText = (content: Record<string, unknown>) => {
	return typeof content.text === "string" ? content.text : "";
};

const getTodoChecked = (content: Record<string, unknown>) => {
	return content.checked === true;
};

const TodoBlock = ({
	block,
	content,
	onUpdate,
	onCreateAfter,
}: TodoBlockProps) => {
	const text = getTodoText(content);
	const checked = getTodoChecked(content);
	const [value, setValue] = useState(text);

	useEffect(() => {
		setValue(text);
	}, [text]);

	const updateTodo = (nextText: string, nextChecked: boolean) => {
		onUpdate({
			...block,
			content: {
				...content,
				text: nextText,
				checked: nextChecked,
			},
		});
	};

	const handleSave = () => {
		if (value === text) return;

		updateTodo(value, checked);
	};

	const handleToggle = () => {
		updateTodo(value, !checked);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") {
			setValue(text);
			event.currentTarget.blur();
			return;
		}

		if (event.key !== "Enter") return;

		event.preventDefault();
		handleSave();
		onCreateAfter(block, PageBlockType.TODO);
	};

	return (
		<div className='flex items-center gap-2 px-3 py-1 text-sm'>
			<button
				type='button'
				onClick={handleToggle}
				className='shrink-0 text-neutral-500 hover:text-neutral-200'
			>
				{checked ? (
					<SquareCheck size={18} className='text-blue-500' />
				) : (
					<Square size={18} />
				)}
			</button>

			<input
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onBlur={handleSave}
				onKeyDown={handleKeyDown}
				placeholder='Todo'
				className={cn(
					"w-full bg-transparent text-sm outline-none",
					checked
						? "text-neutral-500 line-through"
						: "text-neutral-200",
				)}
			/>
		</div>
	);
};

export default TodoBlock;
