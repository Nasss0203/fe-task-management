import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AiAskResponse, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { isAiModificationPlan } from "@/widgets/ai-chat/model/ai-capability";
import { AiModificationPlanPreview } from "@/widgets/ai-chat/ui/AiModificationPlanPreview";
import { askResponses } from "../unit/ai-ask.fixtures";

// Kế hoạch tích to-do: SET_TODO_CHECKED only changes the checkbox of an existing to-do.
const ticks = [
	{ type: "SET_TODO_CHECKED", blockId: "t6", text: "đặt phòng", checked: true },
	{ type: "SET_TODO_CHECKED", blockId: "t8", text: "Gửi email", checked: false },
];
const plan = {
	type: "AI_MODIFICATION_PLAN", schemaVersion: 1, pageId: "page-1", status: "PLAN_READY",
	summary: "Tích 1 to-do, bỏ tích 1 to-do", operations: ticks,
};

describe("SET_TODO_CHECKED plans", () => {
	it("accepts a tick plan", () => {
		expect(isAiModificationPlan(plan)).toBe(true);
	});

	it.each([
		["without text", { type: "SET_TODO_CHECKED", blockId: "t6", checked: true }],
		["with blank text", { ...ticks[0], text: " " }],
		["without a block", { ...ticks[0], blockId: "" }],
		["with a non-boolean checked", { ...ticks[0], checked: "yes" }],
	])("rejects a tick %s", (_name, operation) => {
		expect(isAiModificationPlan({ ...plan, operations: [operation] })).toBe(false);
	});

	it("maps a tick draft and checks the to-do count of its preview", () => {
		const response = (todoUpdates?: number) => {
			const base = askResponses.plan as Extract<AiAskResponse, { status: "PLAN_GENERATED" }>;
			return {
				...base,
				planning: { ...base.planning, plan: { ...base.planning.plan, summary: plan.summary, operations: ticks } },
				preview: {
					...base.preview, summary: plan.summary, operations: ticks,
					counts: { operations: 2, blocks: 0, databaseRows: 0, ...(todoUpdates === undefined ? {} : { todoUpdates }) },
				},
			} as AiAskResponse;
		};
		expect(mapAiAskResponse(response(2)).kind).toBe("plan");
		expect(mapAiAskResponse(response(1)).kind).toBe("invalid");
		// A tick draft from a server that does not count to-dos is not trusted either.
		expect(mapAiAskResponse(response()).kind).toBe("invalid");
	});

	it("shows each to-do with its state before and after", () => {
		const generation = {
			id: "generation-tick", conversation_id: "conversation-page", workspace_id: "workspace-1",
			capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED", output_data: plan,
		} as unknown as AiGeneration;
		render(<AiModificationPlanPreview generation={generation} previewOnly onConfirm={vi.fn()} onDiscard={vi.fn()} />);

		expect(screen.getByText("2 operations · 2 to-dos")).toBeTruthy();
		expect(screen.getByText("Update 2 to-dos")).toBeTruthy();
		const tick = screen.getByText("đặt phòng").closest("li")!;
		expect(within(tick).getByText("Check")).toBeTruthy();
		expect(within(tick).getByLabelText("Not done → Done")).toBeTruthy();
		const untick = screen.getByText("Gửi email").closest("li")!;
		expect(within(untick).getByText("Uncheck")).toBeTruthy();
		expect(within(untick).getByLabelText("Done → Not done")).toBeTruthy();
	});
});
