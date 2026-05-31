type QuoteBlockProps = {
	text: string;
};

const QuoteBlock = ({ text }: QuoteBlockProps) => {
	return (
		<blockquote className='my-1 border-l-2 border-neutral-600 px-3 py-1 text-sm text-neutral-300'>
			{text || "Quote"}
		</blockquote>
	);
};

export default QuoteBlock;
