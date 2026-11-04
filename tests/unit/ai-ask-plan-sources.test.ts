import { describe, expect, it } from "vitest";
import type { AiAskResponse, AiGeneration, AiHistoryMessage } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiHistoryMessages } from "@/widgets/ai-chat/model/ai-history-mapper";
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

// M8: reopening a saved draft (history reload) still shows what it was based on.
describe("M8: sources of a reopened draft", () => {
	const generation = (changes: Record<string, unknown> = {}) => ({
		id: "generation-1", capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED",
		conversation_id: "conversation-1", output_data: { pageId }, sources, ...changes,
	}) as unknown as AiGeneration;
	const messages: AiHistoryMessage[] = [
		{ id: "m-user", conversation_id: "conversation-1", role: "USER", content: "thêm checklist",
			metadata: { generationId: "generation-1" }, created_at: "2026-10-31T10:00:00.000Z" },
		{ id: "m-assistant", conversation_id: "conversation-1", role: "ASSISTANT", content: "Bản nháp",
			metadata: { generationId: "generation-1" }, created_at: "2026-10-31T10:00:01.000Z" },
	];

	it("puts the saved sources on the draft's message only", () => {
		const [user, assistant] = mapAiHistoryMessages(messages, [generation()]);
		expect(assistant.sources).toEqual(sources);
		expect(user).not.toHaveProperty("sources");
	});

	it.each([
		["no saved sources", generation({ sources: undefined })],
		["the edited Page as its own source", generation({ sources: [{ pageId, title: "QA" }] })],
		["a source without an ID", generation({ sources: [{ title: "Bug tracker" }] })],
		["another capability", generation({ capability: "GENERATE_PAGE_COMPOSITION" })],
	])("shows nothing for %s", (_name, saved) => {
		expect(mapAiHistoryMessages(messages, [saved])[1]).not.toHaveProperty("sources");
	});
});
