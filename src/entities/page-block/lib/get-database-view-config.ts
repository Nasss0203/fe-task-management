import {
	PageBlockType,
	type DatabaseViewBlockDataConfig,
	type PageBlock,
} from "../model/page-block.types";

export function getDatabaseViewConfig(
	block: PageBlock,
): DatabaseViewBlockDataConfig | null {
	if (block.type !== PageBlockType.DATABASE_VIEW) {
		return null;
	}

	if (!block.data_config) {
		return null;
	}

	const databaseId = block.data_config.database_id;
	const viewId = block.data_config.view_id;

	if (typeof databaseId !== "string" || typeof viewId !== "string") {
		return null;
	}

	return {
		database_id: databaseId,
		view_id: viewId,
	};
}
