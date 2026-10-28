import { describe, expect, it } from "vitest";
import { getPageInstructionFeedback } from "@/widgets/ai-chat/model/page-instruction-feedback";
import type { GeneratePagePlanFromInstructionResponse } from "@/entities/ai-assistant/model/ai-assistant.types";

const intent = { intent: "MODIFY_PAGE", referenceType: "TITLE", pageReference: "Sprint Planning", instruction: "Add QA", needsClarification: false } as const;

describe("Phase 4 Page response feedback", () => {
  it("handles the legacy unsupported operation contract without a preview", () => {
    expect(getPageInstructionFeedback({ status: "UNSUPPORTED_OPERATION", intent, reason: "INSERT_ONLY" }))
      .toBe("Only adding blocks or database rows is currently supported.");
  });
	it("asks for the checklist items (gp02)", () => {
		expect(getPageInstructionFeedback({ status: "NEEDS_CLARIFICATION", reason: "MISSING_CHECKLIST_ITEMS", intent }))
			.toMatch(/Which items should the checklist have/);
	});
	it.each(["UNCLEAR_INTENT", "UNRESOLVED_PAGE", "MISSING_CURRENT_PAGE"] as const)(
		"handles clarification reason %s", (reason) => {
			expect(getPageInstructionFeedback({ status: "NEEDS_CLARIFICATION", reason, intent }).length).toBeGreaterThan(12);
		},
	);
	it("handles missing and ambiguous pages without inventing a preview", () => {
		expect(getPageInstructionFeedback({ status: "PAGE_NOT_FOUND", intent })).toMatch(/couldn't find/);
		expect(getPageInstructionFeedback({ status: "AMBIGUOUS_PAGE", intent, candidates: [] })).toMatch(/Choose the page/);
	});
	it("distinguishes ready from need-more-context", () => {
		const base = { intent, page: { pageId: "p1", workspaceId: "w1", title: "Sprint Planning", parentPageId: null, teamspaceId: null }, resolutionMethod: "EXACT_TITLE" as const, plan: { generationId: "g1", conversationId: "c1", schemaVersion: 1, type: "AI_MODIFICATION_PLAN", pageId: "p1", status: "PLAN_READY", summary: "QA", operations: [] } } satisfies Omit<Extract<GeneratePagePlanFromInstructionResponse, { status: "PLAN_GENERATED" }>, "status">;
		expect(getPageInstructionFeedback({ ...base, status: "PLAN_GENERATED" })).toContain("No changes have been applied");
		expect(getPageInstructionFeedback({ ...base, status: "PLAN_NEEDS_MORE_CONTEXT", plan: { ...base.plan, status: "NEED_MORE_CONTEXT", operations: [], contextRequests: [] } })).toContain("More information");
	});
	 it("rejects non-modification intent as not a Page edit", () => {
		expect(getPageInstructionFeedback({ status: "NOT_A_PAGE_MODIFICATION", intent })).toContain("does not modify");
	});
});
