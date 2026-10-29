import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, sentenceResponses, workspaceId, pageId } from "./ai-ask.fixtures";

// M3 (kế hoạch tên gần đúng, C6): titles close to a misspelled name.
const typedIntent = {
	intent: "MODIFY_PAGE", referenceType: "TITLE", pageReference: "relese 2",
	instruction: "Thêm checklist QA", needsClarification: false,
} as const;
const candidate = sentenceResponses.ambiguous.planning.candidates[0];
const ambiguous = {
	...sentenceResponses.ambiguous,
	assistantMessage: 'Không có trang "relese 2". Ý bạn là trang "QA"? Chọn trang để tiếp tục:',
	planning: { status: "AMBIGUOUS_PAGE", intent: typedIntent, candidates: [candidate], resolutionMethod: "FUZZY_TITLE" },
} as AiAskResponse;
const plan = {
	...askResponses.plan,
	planning: { ...(askResponses.plan as { planning: object }).planning, intent: typedIntent, resolutionMethod: "FUZZY_TITLE" },
} as AiAskResponse;
const picked = { workspaceId, instruction: "Thêm checklist QA vào trang relese 2", selectedPageId: pageId };
const withPlanning = (response: AiAskResponse, planning: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as { planning: object }).planning, ...planning } }) as AiAskResponse;

describe("M3: titles close to a misspelled name", () => {
	it("offers them for an explicit choice, even a single one", () => {
		expect(mapAiAskResponse(ambiguous, { workspaceId, instruction: picked.instruction })).toMatchObject({
			kind: "page-selection", candidates: [candidate],
			feedback: 'Không có trang "relese 2". Ý bạn là trang "QA"? Chọn trang để tiếp tục:',
		});
	});

	it("accepts the draft only for the Page the user picked", () => {
		expect(mapAiAskResponse(plan, picked).kind).toBe("plan");
		expect(mapAiAskResponse(plan, { ...picked, selectedPageId: undefined }).kind).toBe("invalid");
		expect(mapAiAskResponse(plan, { ...picked, selectedPageId: "other" }).kind).toBe("invalid");
	});

	it.each([
		["six Pages", withPlanning(ambiguous, {
			candidates: Array.from({ length: 6 }, (_, index) => ({ ...candidate, pageId: `page-${index}` })) })],
		["no typed name", withPlanning(ambiguous, {
			intent: { ...typedIntent, referenceType: "UNRESOLVED", pageReference: null, needsClarification: true } })],
		["an activity intent", withPlanning(ambiguous, {
			intent: { ...typedIntent, referenceType: "ACTIVITY", pageReference: null,
				activity: { relative: "TODAY", days: null, titleHint: null } } })],
		["a draft without a typed name", withPlanning(plan, {
			intent: { ...typedIntent, referenceType: "UNRESOLVED", pageReference: null, needsClarification: true } })],
	])("rejects %s", (_name, payload) => {
		expect(mapAiAskResponse(payload, picked).kind).toBe("invalid");
	});
});
