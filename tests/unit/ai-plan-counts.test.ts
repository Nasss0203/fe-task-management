import { describe, expect, it } from "vitest";

import type { AiModificationOperation } from "@/entities/ai-assistant/model/ai-assistant.types";
import { formatPlanCounts } from "@/widgets/ai-chat/model/ai-plan-counts";

const insert = (blocks: number): AiModificationOperation => ({
	type: "INSERT_BLOCKS", parentBlockId: null, afterBlockId: null,
	blocks: Array.from({ length: blocks }, () => ({ type: "TEXT", content: { text: "x" } })),
});
const rows = (count: number): AiModificationOperation => ({
	type: "CREATE_DATABASE_ROWS", databaseId: "db", rows: Array.from({ length: count }, () => ({ values: {} })),
});
const tick: AiModificationOperation = { type: "SET_TODO_CHECKED", blockId: "t", text: "T", checked: true };
const edit: AiModificationOperation = { type: "SET_BLOCK_TEXT", blockId: "b", oldText: "A", newText: "B" };

describe("plan count text", () => {
	it.each([
		[[edit], "1 operation · 1 edit"],
		[[tick, { ...tick, blockId: "u" }], "2 operations · 2 to-dos"],
		[[insert(3), rows(1)], "2 operations · 3 blocks · 1 row"],
		[[insert(1)], "1 operation · 1 block"],
		[[], "0 operations"],
	] as const)("counts %j as %s", (operations, text) => {
		expect(formatPlanCounts([...operations])).toBe(text);
	});
});
