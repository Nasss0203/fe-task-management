import { PageBlockType, type PageBlock } from "@/entities/page-block/model/page-block.types";

export function makePageBlock(overrides: Partial<PageBlock> = {}): PageBlock {
	return {
		id: "block-1",
		page_id: "page-1",
		parent_block_id: null,
		type: PageBlockType.TEXT,
		title: null,
		position_x: null,
		position_y: null,
		width: null,
		height: null,
		order_index: 0,
		content: { text: "Original text" },
		style_config: {},
		data_config: {},
		created_by: "owner",
		is_open: false,
		created_at: "2026-01-01",
		updated_at: "2026-01-01",
		deleted_at: null,
		deleted_by: null,
		...overrides,
	};
}
