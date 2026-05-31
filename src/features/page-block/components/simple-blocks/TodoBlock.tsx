import { CheckSquare } from "lucide-react";

type TodoBlockProps = {
	checked: boolean;
	text: string;
};

const TodoBlock = ({ checked, text }: TodoBlockProps) => {
	return (
		<div className='flex items-center gap-2 px-3 py-1 text-sm'>
			<CheckSquare
				size={16}
				className={checked ? "text-emerald-500" : "text-neutral-500"}
			/>
			<span
				className={
					checked
						? "text-neutral-500 line-through"
						: "text-neutral-200"
				}
			>
				{text || "Todo"}
			</span>
		</div>
	);
};

export default TodoBlock;
