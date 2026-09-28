import {
	PageBlockType,
	type DatabaseViewBlockDataConfig,
} from "../model/page-block.types";

interface DatabaseViewConfigSource {
	type: PageBlockType;
	data_config: unknown;
}

export function getDatabaseViewConfig(
	block: DatabaseViewConfigSource,
): DatabaseViewBlockDataConfig | null {
	if (block.type !== PageBlockType.DATABASE_VIEW) {
		return null;
	}

	if (
		!block.data_config ||
		typeof block.data_config !== "object" ||
		Array.isArray(block.data_config)
	) {
		return null;
	}

	const dataConfig = block.data_config as Record<string, unknown>;
	const databaseId = dataConfig.database_id;
	const viewId = dataConfig.view_id;

	if (typeof databaseId !== "string" || typeof viewId !== "string") {
		return null;
	}

	return {
		database_id: databaseId,
		view_id: viewId,
	};
}
