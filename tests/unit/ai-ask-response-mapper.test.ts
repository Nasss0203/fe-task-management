import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, sentenceResponses, workspaceId, pageId, requestId, conversationId, generationId } from "./ai-ask.fixtures";

afterEach(() => vi.restoreAllMocks());

describe("pure Unified Ask response mapping", () => {
	it("never reads or mutates the network while mapping any variant", () => {
		const spies = [vi.spyOn(api, "getAiGeneration"), vi.spyOn(api, "askAi"), vi.spyOn(api, "createAiConversation"),
			vi.spyOn(api, "confirmPageComposition"), vi.spyOn(api, "confirmAiModificationPlan"), vi.spyOn(api, "discardAiGeneration")];
		for (const response of Object.values(askResponses)) mapAiAskResponse(response);
		for (const spy of spies) expect(spy).not.toHaveBeenCalled();
	});
	it.each([
		["writing", "generation"], ["composition", "generation"], ["plan", "plan"], ["context", "needs-context"],
		["clarification", "feedback"], ["pageClarification", "feedback"], ["ambiguous", "page-selection"],
		["missing", "feedback"], ["unsupported", "feedback"], ["operation", "feedback"],
		["planningOperation", "feedback"], ["notModification", "feedback"],
	] as const)("maps %s to %s without modifying input", (name, kind) => {
		const input = structuredClone(askResponses[name]);
		expect(mapAiAskResponse(input).kind).toBe(kind);
		expect(input).toEqual(askResponses[name]);
	});

	it("maps a request for checklist items (gp02) to feedback, never an unknown reason", () => {
		const withReason = (reason: string) => ({ ...askResponses.pageClarification,
			planning: { ...askResponses.pageClarification.planning, reason } }) as AiAskResponse;
		expect(mapAiAskResponse(withReason("MISSING_CHECKLIST_ITEMS")))
			.toMatchObject({ kind: "feedback", reason: "MISSING_CHECKLIST_ITEMS", hasGeneration: false });
		expect(mapAiAskResponse(withReason("MISSING_SOMETHING_ELSE")))
			.toMatchObject({ kind: "invalid", reason: "INVALID_PLANNING_FEEDBACK" });
	});

	it("preserves null capability without a fake Writing action", () => {
		const mapped = mapAiAskResponse(askResponses.clarification);
		expect(mapped).toMatchObject({ capability: null, hasGeneration: false, canConfirm: false, canDiscard: false,
			conversationId: null, generationId: null, needsGenerationRead: false });
	});

	it("retains unknown capability and Generation IDs as a non-actionable result", () => {
		const mapped = mapAiAskResponse({ ...askResponses.writing, capability: "future.action",
			generation: { ...askResponses.writing.generation, capability: "future.action" } });
		expect(mapped).toMatchObject({ kind: "unknown-capability", capability: null, wireCapability: "future.action",
			hasGeneration: true, generationId, conversationId, capabilityValidated: false, canConfirm: false, canDiscard: false });
	});

	it("requires hydration for plans and never makes needs-context executable", () => {
		const ready = mapAiAskResponse(askResponses.plan);
		const context = mapAiAskResponse(askResponses.context);
		expect(ready).toMatchObject({ needsGenerationRead: true, canConfirm: false, canDiscard: false,
			afterHydration: { canConfirm: true, canDiscard: true } });
		expect(context).toMatchObject({ needsGenerationRead: true, canConfirm: false,
			afterHydration: { canConfirm: false, canDiscard: true }, plan: { operations: [] } });
	});

	it("keeps original instruction and request context for candidate selection", () => {
		const context = { workspaceId, instruction: "Add checklist to Sprint Planning", selectedText: "Checklist",
			currentPageId: null, conversationId, requestId };
		const mapped = mapAiAskResponse(askResponses.ambiguous, context);
		expect(mapped).toMatchObject({ kind: "page-selection", candidates: askResponses.ambiguous.planning.candidates, requestContext: context });
		if (mapped.kind === "page-selection") expect(mapped.requestContext).not.toBe(context);
	});

	it.each([
		{ ...askResponses.writing, generationId: "different" },
		{ ...askResponses.writing, generation: { ...askResponses.writing.generation, conversation_id: "different" } },
		{ ...askResponses.writing, generation: { ...askResponses.writing.generation, capability: "writing.translate" } },
		{ ...askResponses.composition, generation: { ...askResponses.composition.generation, updated_at: "invalid-date" } },
		{ ...askResponses.composition, generation: { ...askResponses.composition.generation, provider: undefined } },
		{ ...askResponses.composition, generation: { ...askResponses.composition.generation, preview: undefined } },
		{ ...askResponses.composition, generation: { ...askResponses.composition.generation, preview: { type: "PAGE_COMPOSITION" } } },
		{ ...askResponses.composition, generation: { ...askResponses.composition.generation,
			preview: { ...askResponses.composition.generation.preview, summary: { blocks: 999, databases: 0, database_rows: 0 } } } },
		{ ...askResponses.plan, conversationId: "different" },
		{ ...askResponses.plan, preview: undefined },
		{ ...askResponses.plan, preview: { ...askResponses.plan.preview, pageId: "different" } },
		{ ...askResponses.plan, preview: { ...askResponses.plan.preview, operations: [] } },
		{ ...askResponses.plan, planning: { ...askResponses.plan.planning, intent: { ...askResponses.plan.planning.intent, needsClarification: true } } },
		{ ...askResponses.plan, planning: { ...askResponses.plan.planning, plan: { ...askResponses.plan.planning.plan, status: "NEED_MORE_CONTEXT" } } },
		{ ...askResponses.context, planning: { ...askResponses.context.planning,
			plan: { ...askResponses.context.planning.plan, operations: askResponses.plan.planning.plan.operations } } },
		{ ...askResponses.clarification, generationId },
		{ ...askResponses.missing, planning: { ...askResponses.missing.planning, plan: {} } },
		{ ...askResponses.missing, planning: { ...askResponses.missing.planning, status: "AMBIGUOUS_PAGE" } },
		{ ...askResponses.ambiguous, planning: { ...askResponses.ambiguous.planning, candidates: [{}] } },
		{ status: "NEW_STATUS", requestId, intent: "WRITING", assistantMessage: "New" },
		null,
	])("rejects malformed payload %# with no actions", (payload) => {
		const mapped = mapAiAskResponse(payload as AiAskResponse);
		expect(mapped.kind).toBe("invalid");
		expect(mapped.canConfirm).toBe(false);
		expect(mapped.canDiscard).toBe(false);
		expect(mapped.needsGenerationRead).toBe(false);
	});

	it.each(["FAILED", "PROCESSING", "APPLIED", "DISCARDED"] as const)("does not offer actions for %s Composition", (status) => {
		const mapped = mapAiAskResponse({ ...askResponses.composition, generation: { ...askResponses.composition.generation, status } });
		expect(mapped.canConfirm).toBe(false); expect(mapped.canDiscard).toBe(false);
	});

	it.each([
		{ workspaceId: "other", instruction: "Create page" },
		{ workspaceId, instruction: "Create page", requestId: "different" },
		{ workspaceId, instruction: "Create page", conversationId: "different" },
	])("rejects request context mismatch %#", (context) => {
		expect(mapAiAskResponse(askResponses.composition, context).kind).toBe("invalid");
	});

	it("rejects a plan for a different current Page and preserves ids for recovery", () => {
		expect(mapAiAskResponse(askResponses.plan, { workspaceId, instruction: "Add", currentPageId: "other" }))
			.toMatchObject({ kind: "invalid", generationId, conversationId, canConfirm: false });
		expect(mapAiAskResponse(askResponses.plan, { workspaceId, instruction: "Add", currentPageId: pageId }).kind).toBe("plan");
		expect(mapAiAskResponse(askResponses.plan, { workspaceId, instruction: "Add", selectedPageId: "other" }).kind).toBe("invalid");
	});
});

describe("chat nhiều lượt: a conversation opened by the server", () => {
	const sent = { workspaceId, instruction: "Thêm checklist vào trang QA", conversationId: "previous-conversation" };
	const switchedPlan = (id: string, flag: unknown = true) => ({ ...askResponses.plan, conversationId: id, conversationSwitched: flag,
		planning: { ...askResponses.plan.planning, plan: { ...askResponses.plan.planning.plan, conversationId: id } } });
	const switchedWriting = (id: string) => ({ ...askResponses.writing, conversationId: id, conversationSwitched: true,
		generation: { ...askResponses.writing.generation, conversation_id: id } });

	it.each([
		["plan", switchedPlan(conversationId)],
		["generation", switchedWriting(conversationId)],
	] as const)("accepts an explicit switch for a %s", (kind, payload) => {
		expect(mapAiAskResponse(payload as AiAskResponse, sent)).toMatchObject({ kind, conversationId, conversationSwitched: true });
	});

	it("reports no switch for a response in the sent conversation", () => {
		expect(mapAiAskResponse(askResponses.plan, { ...sent, conversationId })).toMatchObject({ kind: "plan", conversationSwitched: false });
	});

	it.each([
		// Another conversation without the server's flag is still a mismatch.
		[{ ...askResponses.plan }, sent],
		// The flag needs a sent conversation, a different id and the literal value true.
		[switchedPlan(conversationId), { workspaceId, instruction: "Add" }],
		[switchedPlan("previous-conversation"), sent],
		[switchedPlan(conversationId, "yes"), sent],
		[switchedPlan(conversationId, false), sent],
		[{ ...askResponses.missing, conversationSwitched: true }, sent],
	])("rejects inconsistent switch payload %#", (payload, context) => {
		expect(mapAiAskResponse(payload as AiAskResponse, context).kind).toBe("invalid");
	});
});

describe("M1b: real Page names found in the sentence", () => {
	const picked = { workspaceId, instruction: "thêm checklist vào trang qa", selectedPageId: pageId };
	const candidate = sentenceResponses.ambiguous.planning.candidates[0];

	it("offers sentence matches for an explicit choice", () => {
		expect(mapAiAskResponse(sentenceResponses.ambiguous, { workspaceId, instruction: picked.instruction }))
			.toMatchObject({ kind: "page-selection", candidates: [candidate], feedback: 'Ý bạn là trang "QA"? Chọn trang để tiếp tục:' });
	});

	it("accepts a sentence-matched plan only for the Page the user picked", () => {
		expect(mapAiAskResponse(sentenceResponses.plan, picked).kind).toBe("plan");
		expect(mapAiAskResponse(sentenceResponses.plan, { ...picked, selectedPageId: undefined }).kind).toBe("invalid");
		expect(mapAiAskResponse(sentenceResponses.plan).kind).toBe("invalid");
		expect(mapAiAskResponse(sentenceResponses.plan, { ...picked, selectedPageId: "other" }).kind).toBe("invalid");
	});

	it.each([
		{ ...sentenceResponses.ambiguous, planning: { ...sentenceResponses.ambiguous.planning, resolutionMethod: "FUZZY_TITLE" } },
		{ ...sentenceResponses.ambiguous, planning: { ...sentenceResponses.ambiguous.planning,
			candidates: Array.from({ length: 6 }, (_, index) => ({ ...candidate, pageId: `page-${index}` })) } },
		{ ...askResponses.plan, planning: { ...askResponses.plan.planning, resolutionMethod: "FUZZY_TITLE" } },
		// Any other method still never plans an intent that needed clarification.
		{ ...sentenceResponses.plan, planning: { ...sentenceResponses.plan.planning, resolutionMethod: "EXACT_TITLE" } },
	])("rejects unexpected sentence payload %#", (payload) => {
		expect(mapAiAskResponse(payload as AiAskResponse, picked).kind).toBe("invalid");
	});
});
