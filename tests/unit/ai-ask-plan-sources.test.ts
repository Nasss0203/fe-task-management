import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, pageId, workspaceId } from "./ai-ask.fixtures";

// M8 (kế hoạch ngữ cảnh RAG, I7): a draft based on other Pages lists them.
const sources = [{ pageId: "bug-tracker", title: "Bug tracker" }];
const planning = (askResponses.plan as unknown as { planning: { intent: Record<string, unknown> } }).planning;
const withPlanning = (response: AiAskResponse, changes: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as unknown as { planning: object }).planning, ...changes } }) as AiAskResponse;
const based = withPlanning(askResponses.plan, {
	intent: { ...planning.intent, basedOn: "trang Bug tracker" },
	sources,
});
const request = { workspaceId, instruction: "thêm checklist vào trang QA dựa trên trang Bug tracker" };

describe("M8: a draft based on other Pages", () => {
	it("keeps the sources for the preview", () => {
		expect(mapAiAskResponse(based, request)).toMatchObject({ kind: "plan", sources });
	});

	it("has no sources when none were named", () => {
		expect(mapAiAskResponse(askResponses.plan, request)).not.toHaveProperty("sources");
	});

	it("tells the user when the source held nothing readable", () => {
		const missing = {
			...askResponses.pageClarification,
			planning: { status: "NEEDS_CLARIFICATION", intent: { ...planning.intent, basedOn: "ghi chú QA" }, reason: "MISSING_SOURCE" },
		} as AiAskResponse;
		expect(mapAiAskResponse(missing, request).kind).toBe("feedback");
	});

	it.each([
		["the edited Page as its own source", withPlanning(based, { sources: [{ pageId, title: "QA" }] })],
		["an empty list", withPlanning(based, { sources: [] })],
		["nine sources", withPlanning(based, {
			sources: Array.from({ length: 9 }, (_, index) => ({ pageId: `p${index}`, title: "P" })) })],
		["a source without an ID", withPlanning(based, { sources: [{ title: "Bug tracker" }] })],
		["an empty source name", withPlanning(based, { intent: { ...planning.intent, basedOn: " " } })],
		["a source on a request that edits nothing", withPlanning(askResponses.notModification, {
			intent: { intent: "OTHER", referenceType: "UNRESOLVED", pageReference: null, instruction: null,
				needsClarification: false, basedOn: "trang Bug tracker" } })],
	])("rejects %s", (_name, payload) => {
		expect(mapAiAskResponse(payload, request).kind).toBe("invalid");
	});
});
