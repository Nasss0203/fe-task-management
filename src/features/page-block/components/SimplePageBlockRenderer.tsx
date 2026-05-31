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
	onUpdate: (block: PageBlockItem) => void;
	onCreateAfter: (block: PageBlockItem, type: PageBlockType) => void;
};

const SimplePageBlockRenderer = ({
	block,
	onUpdate,
	onCreateAfter,
}: SimplePageBlockRendererProps) => {
	const text = getContentText(block);

	switch (block.type) {
		case PageBlockType.HEADER:
			return (
				<HeaderBlock
					block={block}
					text={text}
					title={block.title}
					onUpdate={onUpdate}
				/>
			);

		case PageBlockType.TEXT:
			return <TextBlock block={block} text={text} onUpdate={onUpdate} />;

		case PageBlockType.TODO: {
			const content = getContentRecord(block);

			return (
				<TodoBlock
					block={block}
					content={content}
					onUpdate={onUpdate}
					onCreateAfter={onCreateAfter}
				/>
			);
		}

		case PageBlockType.QUOTE:
			return <QuoteBlock block={block} text={text} onUpdate={onUpdate} />;

		case PageBlockType.DIVIDER:
			return <DividerBlock />;

		case PageBlockType.CODE: {
			const content = getContentRecord(block);
			const code = typeof content.code === "string" ? content.code : "";

			return <CodeBlock block={block} code={code} onUpdate={onUpdate} />;
		}

		default:
			return <UnsupportedBlock type={block.type} />;
	}
};

export default SimplePageBlockRenderer;
