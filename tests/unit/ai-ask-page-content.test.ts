import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, sentenceResponses, workspaceId, pageId } from "./ai-ask.fixtures";

// M7 (kế hoạch tìm theo nội dung, H6): Pages whose text holds the words, with an excerpt.
const contentIntent = {
	intent: "MODIFY_PAGE", referenceType: "CONTENT", pageReference: null,
	instruction: "thêm checklist gồm test, review", needsClarification: false, topic: "OAuth",
} as const;
const candidate = { ...sentenceResponses.ambiguous.planning.candidates[0], excerpt: "Implement OAuth login with Google" };
const message = 'Trang có nhắc tới "OAuth" là "QA". Chọn trang để tiếp tục:';
const ambiguous = {
	...sentenceResponses.ambiguous,
	assistantMessage: message,
	planning: { status: "AMBIGUOUS_PAGE", intent: contentIntent, candidates: [candidate], resolutionMethod: "CONTENT" },
} as AiAskResponse;
const plan = {
	...askResponses.plan,
	planning: { ...(askResponses.plan as { planning: object }).planning, intent: contentIntent, resolutionMethod: "CONTENT" },
} as AiAskResponse;
const picked = {
	workspaceId, instruction: "Tìm page có nói về OAuth rồi thêm checklist gồm test, review", selectedPageId: pageId,
};
const withPlanning = (response: AiAskResponse, planning: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as { planning: object }).planning, ...planning } }) as AiAskResponse;

describe("M7: Pages that hold the words", () => {
	it("offers them with the matching words, even a single one", () => {
		expect(mapAiAskResponse(ambiguous, { workspaceId, instruction: picked.instruction })).toMatchObject({
			kind: "page-selection", candidates: [candidate], feedback: message,
		});
	});

	it("accepts the draft only for the Page the user picked", () => {
		expect(mapAiAskResponse(plan, picked).kind).toBe("plan");
		expect(mapAiAskResponse(plan, { ...picked, selectedPageId: undefined }).kind).toBe("invalid");
	});

	it("lets a described Page (M6) carry an excerpt too", () => {
		const described = {
			intent: "MODIFY_PAGE", referenceType: "DESCRIPTION", pageReference: null,
			instruction: "thêm checklist", needsClarification: false, description: "cải thiện đăng nhập",
		};
		expect(mapAiAskResponse(withPlanning(ambiguous, { intent: described, resolutionMethod: "SEMANTIC" }), picked).kind)
			.toBe("page-selection");
	});

	it.each([
		["a content intent found another way", withPlanning(ambiguous, { resolutionMethod: "SEMANTIC" })],
		["CONTENT for a description", withPlanning(ambiguous, {
			intent: { ...contentIntent, referenceType: "DESCRIPTION", topic: undefined, description: "OAuth" } })],
		["a content draft without CONTENT", withPlanning(plan, { resolutionMethod: "EXACT_TITLE" })],
		["no topic", withPlanning(ambiguous, { intent: { ...contentIntent, topic: " " } })],
		["a topic on a title intent", withPlanning(askResponses.ambiguous, {
			intent: { ...contentIntent, referenceType: "TITLE", pageReference: "QA" } })],
		["an excerpt on same-named Pages", withPlanning(askResponses.ambiguous, { candidates: [candidate] })],
		["a very long excerpt", withPlanning(ambiguous, { candidates: [{ ...candidate, excerpt: "x".repeat(201) }] })],
	])("rejects %s", (_name, payload) => {
		expect(mapAiAskResponse(payload, picked).kind).toBe("invalid");
	});
});
