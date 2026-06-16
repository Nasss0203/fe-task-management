import { PageBlockType } from "@/services/page_block/type";

type UnsupportedBlockProps = {
	type: PageBlockType;
};

const UnsupportedBlock = ({ type }: UnsupportedBlockProps) => {
	return (
		<div className='px-3 py-1 text-sm text-muted-foreground'>
			Unsupported block: {type}
		</div>
	);
};

export default UnsupportedBlock;
