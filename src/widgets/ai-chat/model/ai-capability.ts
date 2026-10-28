import type { AiCapability, AiModificationPlan } from "@/entities/ai-assistant/model/ai-assistant.types";

const CAPABILITIES: readonly AiCapability[] = [
	"writing.improve", "writing.translate", "writing.shorten", "writing.expand",
	"writing.summarize", "writing.continue", "GENERATE_PAGE_COMPOSITION", "GENERATE_PAGE_MODIFICATION_PLAN",
];

export function isAiCapability(value: unknown): value is AiCapability {
	return typeof value === "string" && CAPABILITIES.some((capability) => capability === value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonemptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

const nullableId = (value: unknown) => value === null || isNonemptyString(value);

export function isAiModificationPlan(value: unknown): value is AiModificationPlan {
	if (!isRecord(value) || value.type !== "AI_MODIFICATION_PLAN" || value.schemaVersion !== 1 ||
		!isNonemptyString(value.pageId) || typeof value.summary !== "string" || !Array.isArray(value.operations)) return false;
	if (value.status === "NEED_MORE_CONTEXT") {
		return value.operations.length === 0 && Array.isArray(value.contextRequests) && value.contextRequests.length > 0 &&
			value.contextRequests.every((item) => isRecord(item) &&
				["ROWS_TRUNCATED", "TEXT_TRUNCATED", "AMBIGUOUS_TARGET", "MISSING_RESOURCE_CONTEXT"].includes(String(item.reason)) &&
				typeof item.description === "string" && (item.question === undefined || typeof item.question === "string"));
	}
	if (value.status !== "PLAN_READY" || value.operations.length === 0) return false;
	return value.operations.every((operation) => {
		if (!isRecord(operation)) return false;
		if (operation.type === "INSERT_BLOCKS") {
			return nullableId(operation.parentBlockId) && nullableId(operation.afterBlockId) &&
				Array.isArray(operation.blocks) && operation.blocks.length > 0 && operation.blocks.every((block) =>
					isRecord(block) && ["TEXT", "HEADER", "QUOTE", "TODO", "TOGGLE"].includes(String(block.type)) && isRecord(block.content));
		}
		if (operation.type === "DELETE_BLOCK") {
			return isNonemptyString(operation.blockId) && isNonemptyString(operation.text) &&
				Number.isInteger(operation.childCount) && Number(operation.childCount) >= 0;
		}
		if (operation.type === "SET_BLOCK_TEXT") {
			return isNonemptyString(operation.blockId) && isNonemptyString(operation.oldText) &&
				isNonemptyString(operation.newText);
		}
		if (operation.type === "SET_TODO_CHECKED") {
			return isNonemptyString(operation.blockId) && isNonemptyString(operation.text) &&
				typeof operation.checked === "boolean";
		}
		return operation.type === "CREATE_DATABASE_ROWS" && isNonemptyString(operation.databaseId) &&
			Array.isArray(operation.rows) && operation.rows.length > 0 &&
			operation.rows.every((row) => isRecord(row) && isRecord(row.values));
	});
}
