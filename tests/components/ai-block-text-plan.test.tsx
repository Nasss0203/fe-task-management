import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AiAskResponse, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { isAiModificationPlan } from "@/widgets/ai-chat/model/ai-capability";
import { AiModificationPlanPreview } from "@/widgets/ai-chat/ui/AiModificationPlanPreview";
import { askResponses } from "../unit/ai-ask.fixtures";

// Kế hoạch sửa chữ block: SET_BLOCK_TEXT only changes the text of an existing block.
const edits = [{ type: "SET_BLOCK_TEXT", blockId: "h1", oldText: "Việc tuần sau", newText: "Việc tháng sau" }];
const plan = {
	type: "AI_MODIFICATION_PLAN", schemaVersion: 1, pageId: "page-1", status: "PLAN_READY",
	summary: 'Sửa 1 block: "Việc tuần sau" → "Việc tháng sau"', operations: edits,
};

describe("SET_BLOCK_TEXT plans", () => {
	it("accepts a text edit plan", () => {
		expect(isAiModificationPlan(plan)).toBe(true);
	});

	it.each([
		["without old text", { type: "SET_BLOCK_TEXT", blockId: "h1", newText: "B" }],
		["with blank new text", { ...edits[0], newText: " " }],
		["without a block", { ...edits[0], blockId: "" }],
	])("rejects an edit %s", (_name, operation) => {
		expect(isAiModificationPlan({ ...plan, operations: [operation] })).toBe(false);
	});

	it("maps an edit draft and checks the edit count of its preview", () => {
		const response = (blockEdits?: number) => {
			const base = askResponses.plan as Extract<AiAskResponse, { status: "PLAN_GENERATED" }>;
			return {
				...base,
				planning: { ...base.planning, plan: { ...base.planning.plan, summary: plan.summary, operations: edits } },
				preview: {
					...base.preview, summary: plan.summary, operations: edits,
					counts: { operations: 1, blocks: 0, databaseRows: 0, todoUpdates: 0, ...(blockEdits === undefined ? {} : { blockEdits }) },
				},
			} as AiAskResponse;
		};
		expect(mapAiAskResponse(response(1)).kind).toBe("plan");
		expect(mapAiAskResponse(response(2)).kind).toBe("invalid");
		expect(mapAiAskResponse(response()).kind).toBe("invalid");
	});

	it("shows the old text struck through and the new text", () => {
		const generation = {
			id: "generation-edit", conversation_id: "conversation-page", workspace_id: "workspace-1",
			capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED", output_data: plan,
		} as unknown as AiGeneration;
		render(<AiModificationPlanPreview generation={generation} previewOnly onConfirm={vi.fn()} onDiscard={vi.fn()} />);

		expect(screen.getByText("1 operation · 1 edit")).toBeTruthy();
		expect(screen.getByText("Edit 1 block")).toBeTruthy();
		const row = screen.getByText("Việc tháng sau").closest("li")!;
		expect(within(row).getByText("Việc tuần sau").tagName).toBe("DEL");
		expect(within(row).getByText("Việc tháng sau").tagName).toBe("INS");
	});
});
