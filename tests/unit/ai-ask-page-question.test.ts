import { describe, expect, it } from "vitest";
import type { AiAskResponse, AskAiRequest } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { reconcileAiHistory } from "@/widgets/ai-chat/model/ai-history-reconciliation";

const workspaceId = "workspace-1";
const answered = {
	requestId: "request-1",
	intent: "PAGE_QUESTION",
	status: "ANSWERED",
	capability: "PAGE_QUESTION",
	reason: "TODO_STATUS",
	conversationId: "conversation-1",
	page: { pageId: "page-1", title: "Hội họp tuần" },
	usedModel: false,
	assistantMessage: "Trang \"Hội họp tuần\" còn 3 việc chưa xong",
} as AiAskResponse;
const candidate = { pageId: "page-2", workspaceId, title: "Họp", parentPageId: null, teamspaceId: null };
const choose = {
	requestId: "request-1",
	intent: "PAGE_QUESTION",
	status: "AMBIGUOUS_PAGE",
	capability: "PAGE_QUESTION",
	candidates: [candidate],
	resolutionMethod: "TITLE_IN_SENTENCE",
	assistantMessage: "Ý bạn là trang \"Họp\"? Chọn trang để AI trả lời:",
} as AiAskResponse;
const request: AskAiRequest = { requestId: "request-1", workspaceId, instruction: "trang Họp còn việc nào chưa xong?" };

describe("page questions (AI-Q1)", () => {
	it("maps an answer to a read-only message without draft actions", () => {
		expect(mapAiAskResponse(answered, request)).toMatchObject({
			kind: "answer", hasGeneration: false, canConfirm: false, canDiscard: false,
			conversationId: "conversation-1", page: { pageId: "page-1" }, reason: "TODO_STATUS",
			feedback: "Trang \"Hội họp tuần\" còn 3 việc chưa xong",
		});
	});

	it("maps Pages to choose from to a page selection", () => {
		expect(mapAiAskResponse(choose, request)).toMatchObject({ kind: "page-selection", candidates: [candidate] });
	});

	it("keeps business feedback for a question as feedback", () => {
		const feedback = { requestId: "request-1", intent: "PAGE_QUESTION", status: "NEEDS_CLARIFICATION",
			reason: "PAGE_NOT_FOUND", capability: null, assistantMessage: "Không tìm thấy trang" } as AiAskResponse;
		expect(mapAiAskResponse(feedback, request).kind).toBe("feedback");
	});

	it.each([
		["no conversation", { ...answered, conversationId: undefined }],
		["a generation", { ...answered, generationId: "generation-1" }],
		["another intent", { ...answered, intent: "MODIFY_PAGE" }],
		["no page", { ...answered, page: undefined }],
		["a page other than the chosen one", answered, { ...request, selectedPageId: "page-9" }],
		["candidates of another workspace", { ...choose, candidates: [{ ...candidate, workspaceId: "other" }] }],
		["an unknown status", { ...answered, status: "PLAN_GENERATED" }],
	] as [string, unknown, AskAiRequest?][])("refuses %s", (_label, response, context = request) => {
		expect(mapAiAskResponse(response as AiAskResponse, context).kind).toBe("invalid");
	});
});

describe("page answers in history (AI-Q1)", () => {
	const base = { role: "assistant" as const, content: "Trang còn 3 việc", capability: null, createdAt: "2026-11-07T10:00:00.000Z" };
	const saved = { ...base, id: "server-2",
		origin: { source: "persisted" as const, serverMessageId: "server-2", conversationId: "conversation-1", requestId: "request-1" } };

	it("shows the saved answer once in place of the local one", () => {
		const local = { ...base, id: "local-2",
			origin: { source: "feedback" as const, localId: "local-2", feedbackKind: "other" as const,
				conversationId: "conversation-1", requestId: "request-1" } };
		const result = reconcileAiHistory([local], [saved], { conversationId: "conversation-1", workspaceId });
		expect(result.filter((message) => message.role === "assistant")).toHaveLength(1);
		expect(result[0]).toMatchObject({ id: "local-2", origin: { source: "persisted", serverMessageId: "server-2" } });
	});

	it("never pairs another request or a saved draft message", () => {
		const origin = { source: "feedback" as const, feedbackKind: "other" as const, conversationId: "conversation-1" };
		const other = { ...base, id: "local-4", origin: { ...origin, localId: "local-4", requestId: "request-9" } };
		const local = { ...base, id: "local-5", origin: { ...origin, localId: "local-5", requestId: "request-1" } };
		const draft = { ...saved, id: "server-5", origin: { ...saved.origin, serverMessageId: "server-5", generationId: "generation-1" } };
		expect(reconcileAiHistory([other], [saved], { conversationId: "conversation-1", workspaceId })).toHaveLength(2);
		expect(reconcileAiHistory([local], [draft], { conversationId: "conversation-1", workspaceId })).toHaveLength(2);
	});
});
