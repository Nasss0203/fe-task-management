type HeaderBlockProps = {
	text: string;
	title?: string | null;
};

const HeaderBlock = ({ text, title }: HeaderBlockProps) => {
	return (
		<h2 className='px-3 py-1 text-xl font-semibold'>
			{text || title || "Heading"}
		</h2>
	);
};

export default HeaderBlock;
