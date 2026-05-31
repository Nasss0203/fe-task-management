import { PageBlockItem } from "@/services/page_block/type";

export const getContentRecord = (
	block: PageBlockItem,
): Record<string, unknown> => {
	const content = block.content;

	if (!content || Array.isArray(content) || typeof content !== "object") {
		return {};
	}

	return content as Record<string, unknown>;
};

export const getContentText = (block: PageBlockItem) => {
	const content = getContentRecord(block);

	return typeof content.text === "string" ? content.text : "";
};
