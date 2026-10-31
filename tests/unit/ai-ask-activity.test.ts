import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { browserTimeZone } from "@/entities/ai-assistant/model/ai-assistant.mutations";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, sentenceResponses, workspaceId, pageId } from "./ai-ask.fixtures";

// M2 (kế hoạch tìm theo hoạt động, B8): a Page named by the user's own edits.
const activityIntent = {
	intent: "MODIFY_PAGE", referenceType: "ACTIVITY", pageReference: null,
	instruction: "Thêm checklist QA", needsClarification: false,
	activity: { relative: "YESTERDAY", days: null, titleHint: null },
} as const;
const candidate = sentenceResponses.ambiguous.planning.candidates[0];
const ambiguous = {
	...sentenceResponses.ambiguous,
	assistantMessage: 'Trang bạn sửa hôm qua là "QA". Chọn trang để tiếp tục:',
	planning: { status: "AMBIGUOUS_PAGE", intent: activityIntent, candidates: [candidate], resolutionMethod: "ACTIVITY" },
} as AiAskResponse;
const plan = {
	...sentenceResponses.plan,
	planning: { ...sentenceResponses.plan.planning, intent: activityIntent, resolutionMethod: "ACTIVITY" },
} as AiAskResponse;
const picked = { workspaceId, instruction: "Thêm checklist QA vào trang tôi sửa hôm qua", selectedPageId: pageId };
const withPlanning = (response: AiAskResponse, planning: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as { planning: object }).planning, ...planning } }) as AiAskResponse;

describe("M2: Pages the user edited", () => {
	it("offers them for an explicit choice, even a single one", () => {
		expect(mapAiAskResponse(ambiguous, { workspaceId, instruction: picked.instruction })).toMatchObject({
			kind: "page-selection", candidates: [candidate],
			feedback: 'Trang bạn sửa hôm qua là "QA". Chọn trang để tiếp tục:',
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
		["ACTIVITY Pages for a title intent", withPlanning(ambiguous, { intent: { ...activityIntent, referenceType: "TITLE", activity: undefined } })],
		["a sentence method for an activity intent", withPlanning(ambiguous, { resolutionMethod: "TITLE_IN_SENTENCE" })],
		["days on another time", withPlanning(ambiguous, { intent: { ...activityIntent, activity: { relative: "TODAY", days: 3, titleHint: null } } })],
		["an unknown time", withPlanning(ambiguous, { intent: { ...activityIntent, activity: { relative: "TOMORROW", days: null, titleHint: null } } })],
		["no activity", withPlanning(ambiguous, { intent: { ...activityIntent, activity: undefined } })],
		["a clarification flag", withPlanning(ambiguous, { intent: { ...activityIntent, needsClarification: true } })],
		["an activity on a title intent", withPlanning(askResponses.plan, { intent: { ...(askResponses.plan as { planning: { intent: object } }).planning.intent, activity: activityIntent.activity } })],
		["an ACTIVITY draft for a title intent", withPlanning(sentenceResponses.plan, { resolutionMethod: "ACTIVITY" })],
		["an exact-title draft for an activity intent", withPlanning(plan, { resolutionMethod: "EXACT_TITLE" })],
	])("rejects %s", (_name, payload) => {
		expect(mapAiAskResponse(payload, picked).kind).toBe("invalid");
	});

	it("reads the browser's time zone for Ask", () => {
		expect(browserTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
	});
});
