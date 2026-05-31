import { PageBlockItem, PageBlockType } from "@/services/page_block/type";
import CodeBlock from "./simple-blocks/CodeBlock";
import DividerBlock from "./simple-blocks/DividerBlock";
import HeaderBlock from "./simple-blocks/HeaderBlock";
import {
	getContentRecord,
	getContentText,
} from "./simple-blocks/page-block-content";
import QuoteBlock from "./simple-blocks/QuoteBlock";
import TextBlock from "./simple-blocks/TextBlock";
import TodoBlock from "./simple-blocks/TodoBlock";
import UnsupportedBlock from "./simple-blocks/UnsupportedBlock";

type SimplePageBlockRendererProps = {
	block: PageBlockItem;
};

const SimplePageBlockRenderer = ({ block }: SimplePageBlockRendererProps) => {
	const text = getContentText(block);

	switch (block.type) {
		case PageBlockType.HEADER:
			return <HeaderBlock text={text} title={block.title} />;

		case PageBlockType.TEXT:
			return <TextBlock text={text} />;

		case PageBlockType.TODO: {
			const content = getContentRecord(block);
			const checked = content.checked === true;

			return <TodoBlock checked={checked} text={text} />;
		}

		case PageBlockType.QUOTE:
			return <QuoteBlock text={text} />;

		case PageBlockType.DIVIDER:
			return <DividerBlock />;

		case PageBlockType.CODE: {
			const content = getContentRecord(block);
			const code =
				typeof content.code === "string" ? content.code : "";

			return <CodeBlock code={code} />;
		}

		default:
			return <UnsupportedBlock type={block.type} />;
	}
};

export default SimplePageBlockRenderer;
