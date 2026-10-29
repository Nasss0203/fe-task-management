import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, sentenceResponses, workspaceId, pageId } from "./ai-ask.fixtures";

// M6 (kế hoạch tìm theo mô tả, G6): Pages close to what the user described.
const describedIntent = {
	intent: "MODIFY_PAGE", referenceType: "DESCRIPTION", pageReference: null,
	instruction: "Thêm mục họp", needsClarification: false, description: "biên bản họp hằng tuần",
} as const;
const candidate = sentenceResponses.ambiguous.planning.candidates[0];
const message = 'Trang gần với mô tả "biên bản họp hằng tuần" là "QA". Chọn trang để tiếp tục:';
const ambiguous = {
	...sentenceResponses.ambiguous,
	assistantMessage: message,
	planning: { status: "AMBIGUOUS_PAGE", intent: describedIntent, candidates: [candidate], resolutionMethod: "SEMANTIC" },
} as AiAskResponse;
const plan = {
	...askResponses.plan,
	planning: { ...(askResponses.plan as { planning: object }).planning, intent: describedIntent, resolutionMethod: "SEMANTIC" },
} as AiAskResponse;
const picked = {
	workspaceId, instruction: "Thêm mục họp vào trang ghi biên bản họp hằng tuần", selectedPageId: pageId,
};
const withPlanning = (response: AiAskResponse, planning: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as { planning: object }).planning, ...planning } }) as AiAskResponse;

describe("M6: Pages close to a description", () => {
	it("offers them for an explicit choice, even a single one", () => {
		expect(mapAiAskResponse(ambiguous, { workspaceId, instruction: picked.instruction })).toMatchObject({
			kind: "page-selection", candidates: [candidate], feedback: message,
		});
	});

	it("accepts the draft only for the Page the user picked", () => {
		expect(mapAiAskResponse(plan, picked).kind).toBe("plan");
		expect(mapAiAskResponse(plan, { ...picked, selectedPageId: undefined }).kind).toBe("invalid");
		expect(mapAiAskResponse(plan, { ...picked, selectedPageId: "other" }).kind).toBe("invalid");
	});

	it("accepts a name nothing else matched, looked up as a description", () => {
		const typed = { ...describedIntent, referenceType: "TITLE", pageReference: "ghi biên bản họp", description: undefined };
		expect(mapAiAskResponse(withPlanning(ambiguous, { intent: typed }), picked).kind).toBe("page-selection");
	});

	it("tells the user when no Page is close", () => {
		const missing = withPlanning(askResponses.missing, { intent: describedIntent });
		expect(mapAiAskResponse(missing, picked).kind).toBe("feedback");
	});

	it.each([
		["six Pages", withPlanning(ambiguous, {
			candidates: Array.from({ length: 6 }, (_, index) => ({ ...candidate, pageId: `page-${index}` })) })],
		["a description with a title", withPlanning(ambiguous, { intent: { ...describedIntent, pageReference: "QA" } })],
		["an empty description", withPlanning(ambiguous, { intent: { ...describedIntent, description: " " } })],
		["a description on a title intent", withPlanning(askResponses.ambiguous, {
			intent: { ...describedIntent, referenceType: "TITLE", pageReference: "QA" } })],
		["a described Page found another way", withPlanning(ambiguous, { resolutionMethod: "FUZZY_TITLE" })],
		["a described Page drafted without SEMANTIC", withPlanning(plan, { resolutionMethod: "EXACT_TITLE" })],
		["SEMANTIC for an unresolved Page", withPlanning(ambiguous, {
			intent: { ...describedIntent, referenceType: "UNRESOLVED", needsClarification: true, description: undefined } })],
	])("rejects %s", (_name, payload) => {
		expect(mapAiAskResponse(payload, picked).kind).toBe("invalid");
	});
});
