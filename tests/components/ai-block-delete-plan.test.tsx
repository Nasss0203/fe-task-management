import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiAskResponse, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { isAiModificationPlan } from "@/widgets/ai-chat/model/ai-capability";
import { formatPlanCounts } from "@/widgets/ai-chat/model/ai-plan-counts";
import { AiModificationPlanPreview } from "@/widgets/ai-chat/ui/AiModificationPlanPreview";
import { askResponses } from "../unit/ai-ask.fixtures";
import { createWrapper } from "../utils/test-utils";

const api = vi.hoisted(() => ({ undoAiModificationPlan: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api", async (original) => ({
	...(await original<object>()),
	undoAiModificationPlan: api.undoAiModificationPlan,
}));
vi.mock("sonner", () => ({ toast }));
// The page's own blocks name what is nested in a deleted toggle.
vi.mock("@/entities/page-block/model/page-block.queries", async (original) => ({
	...(await original<object>()),
	usePageBlocks: () => ({
		data: [
			{ id: "g1", parent_block_id: null, content: { text: "Ghi chú họp" } },
			{ id: "g2", parent_block_id: "g1", content: { text: "Ý kiến của An" } },
			{ id: "g3", parent_block_id: "g1", content: { text: "Hỏi lại Bình" } },
		],
	}),
}));

// Kế hoạch xoá block: DELETE_BLOCK soft-deletes a block and everything nested in it.
const deletes = [
	{ type: "DELETE_BLOCK", blockId: "g1", text: "Ghi chú họp", childCount: 2 },
	{ type: "DELETE_BLOCK", blockId: "t8", text: "Gửi email", childCount: 0 },
];
const plan = {
	type: "AI_MODIFICATION_PLAN", schemaVersion: 1, pageId: "page-1", status: "PLAN_READY",
	summary: 'Xoá 2 block: "Ghi chú họp", "Gửi email" (kèm 2 block con)', operations: deletes,
};
const generation = (overrides: Partial<AiGeneration> = {}) => ({
	id: "generation-delete", conversation_id: "conversation-page", workspace_id: "workspace-1",
	capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED", output_data: plan, applied_at: null,
	...overrides,
}) as unknown as AiGeneration;

beforeEach(() => vi.clearAllMocks());

describe("DELETE_BLOCK plans", () => {
	it("accepts a delete plan and counts deletions", () => {
		expect(isAiModificationPlan(plan)).toBe(true);
		expect(formatPlanCounts(plan.operations as never)).toBe("2 operations · 2 deletions");
	});

	it.each([
		["without text", { type: "DELETE_BLOCK", blockId: "g1", childCount: 0 }],
		["with a negative nested count", { ...deletes[0], childCount: -1 }],
		["with a fractional nested count", { ...deletes[0], childCount: 1.5 }],
	])("rejects a delete %s", (_name, operation) => {
		expect(isAiModificationPlan({ ...plan, operations: [operation] })).toBe(false);
	});

	it("maps a delete draft and checks the delete count of its preview", () => {
		const response = (blockDeletes?: number) => {
			const base = askResponses.plan as Extract<AiAskResponse, { status: "PLAN_GENERATED" }>;
			return {
				...base,
				planning: { ...base.planning, plan: { ...base.planning.plan, summary: plan.summary, operations: deletes } },
				preview: {
					...base.preview, summary: plan.summary, operations: deletes,
					counts: {
						operations: 2, blocks: 0, databaseRows: 0, todoUpdates: 0, blockEdits: 0,
						...(blockDeletes === undefined ? {} : { blockDeletes }),
					},
				},
			} as AiAskResponse;
		};
		expect(mapAiAskResponse(response(2)).kind).toBe("plan");
		expect(mapAiAskResponse(response(1)).kind).toBe("invalid");
		expect(mapAiAskResponse(response()).kind).toBe("invalid");
	});

	it("shows each deleted block and what is nested in it", () => {
		const { wrapper } = createWrapper();
		render(<AiModificationPlanPreview generation={generation()} previewOnly onConfirm={vi.fn()} onDiscard={vi.fn()} />,
			{ wrapper });

		expect(screen.getByText("Delete 2 blocks")).toBeTruthy();
		const toggle = screen.getByText("Ghi chú họp").closest("li")!;
		expect(within(toggle).getByText("Ghi chú họp").tagName).toBe("DEL");
		expect(within(toggle).getByText("+ 2 nested blocks")).toBeTruthy();
		expect(within(toggle).getByText("Ý kiến của An")).toBeTruthy();
		expect(within(toggle).getByText("Hỏi lại Bình")).toBeTruthy();
		expect(screen.queryByRole("button", { name: /Undo/ })).toBeNull();
	});

	it("offers Undo on an applied delete and restores through the API", async () => {
		api.undoAiModificationPlan.mockResolvedValue({ restoredBlockIds: ["g1", "g2", "g3", "t8"] });
		const { wrapper, queryClient } = createWrapper();
		queryClient.setQueryData(pageBlockKeys.byPage("page-1"), []);
		render(<AiModificationPlanPreview generation={generation({ status: "APPLIED", applied_at: new Date().toISOString() })}
			onConfirm={vi.fn()} onDiscard={vi.fn()} />, { wrapper });

		await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Undo/ })); });

		await waitFor(() => expect(api.undoAiModificationPlan).toHaveBeenCalledWith("generation-delete"));
		expect(queryClient.getQueryState(pageBlockKeys.byPage("page-1"))?.isInvalidated).toBe(true);
		expect(toast.success).toHaveBeenCalledWith("Restored 4 blocks.");
		expect(screen.getByRole("button", { name: /Undone/ })).toBeDisabled();
	});

	it("does not offer Undo after 24 hours", () => {
		const { wrapper } = createWrapper();
		const appliedAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
		render(<AiModificationPlanPreview generation={generation({ status: "APPLIED", applied_at: appliedAt })}
			onConfirm={vi.fn()} onDiscard={vi.fn()} />, { wrapper });
		expect(screen.queryByRole("button", { name: /Undo/ })).toBeNull();
	});
});
