type TextBlockProps = {
	text: string;
};

const TextBlock = ({ text }: TextBlockProps) => {
	return (
		<p className='px-3 py-1 text-sm leading-6 text-neutral-200'>
			{text || "Text"}
		</p>
	);
};

export default TextBlock;
