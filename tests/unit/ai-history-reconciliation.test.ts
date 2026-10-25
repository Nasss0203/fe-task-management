import { describe, expect, it } from "vitest";
import { mapAiHistoryMessages } from "@/widgets/ai-chat/model/ai-history-mapper";
import { reconcileAiHistory } from "@/widgets/ai-chat/model/ai-history-reconciliation";
import type { AiChatMessage } from "@/widgets/ai-chat/model/types";
import { foundationContext, foundationGeneration, localMessage, serverMessage } from "./ai-foundation.fixtures";
import { generationId, conversationId, workspaceId } from "./ai-ask.fixtures";

const map = mapAiHistoryMessages;
const reconcile = (before: AiChatMessage[], incoming: AiChatMessage[]) => reconcileAiHistory(before, incoming, foundationContext);
const overlay = () => localMessage("local-assistant", "assistant", "request-1", {
	generation: foundationGeneration, origin: { source: "generation-overlay", localId: "local-assistant",
		conversationId, generationId, requestId: "request-1", turnId: "turn-1" },
});

describe("history reconciliation", () => {
	it.each(["clarification", "unsupported", "error", "timeout", "page-selection"] as const)("preserves local %s over stale success/refetch", (feedbackKind) => {
		const persisted = map([serverMessage("u1", "USER"),
			{ ...serverMessage("a1", "ASSISTANT"), created_at: "2026-10-21T00:00:01Z" }], []);
		const user = localMessage("u2", "user");
		const feedback = localMessage("a2", "assistant");
		if (feedback.origin?.source === "feedback") feedback.origin.feedbackKind = feedbackKind;
		const result = reconcile([...persisted, user, feedback], persisted);
		expect(result.map((message) => message.id)).toEqual(["u1", "a1", "u2", "a2"]);
		expect(result.at(-1)?.origin?.source).toBe("feedback");
		expect(reconcile(result, persisted)).toEqual(result);
	});

	it("hydrates a unique optimistic USER by conversation/request/role and keeps its UI identity", () => {
		const local = localMessage("local-user", "user");
		const incoming = map([serverMessage("server-user", "USER", { requestId: "request-1" })], []);
		const result = reconcile([local], incoming);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ id: "local-user", origin: { source: "persisted", serverMessageId: "server-user", localId: "local-user" } });
		expect(reconcile(result, incoming)[0].id).toBe("local-user");
	});

	it("does not merge planner USER and ASSISTANT sharing a generation id", () => {
		const incoming = map([serverMessage("server-user", "USER", { requestId: "request-1", generationId }),
			serverMessage("server-assistant", "ASSISTANT", { requestId: "request-1", generationId })], [foundationGeneration]);
		const result = reconcile([localMessage("local-user", "user"), overlay()], incoming);
		expect(result).toHaveLength(2);
		expect(result.map((message) => message.id).sort()).toEqual(["local-assistant", "local-user"]);
		expect(result.filter((message) => message.role === "assistant")).toHaveLength(1);
	});

	it("keeps all server records when request correlation is not unique", () => {
		const incoming = map([serverMessage("server-user-1", "USER", { requestId: "request-1" }),
			serverMessage("server-user-2", "USER", { requestId: "request-1" })], []);
		const result = reconcile([localMessage("local-user", "user")], incoming);
		expect(result.map((message) => message.id)).toContain("local-user");
		expect(result.filter((message) => message.origin?.source === "persisted")).toHaveLength(2);
	});

	it("does not deduplicate equal content/timestamps or multiple optimistic candidates", () => {
		const first = localMessage("local-1", "user");
		const second = localMessage("local-2", "user");
		const saved = map([serverMessage("server-user", "USER", { requestId: "request-1" })], []);
		expect(reconcile([first, second], saved)).toHaveLength(3);
		expect(map([serverMessage("1", "USER"), { ...serverMessage("2", "USER"), content: "1" }], [])).toHaveLength(2);
	});

	it("deduplicates pagination by server id and preserves existing loaded records", () => {
		const first = serverMessage("first", "USER");
		const second = serverMessage("second", "ASSISTANT");
		const incoming = map([first, first, second], []);
		expect(incoming).toHaveLength(2);
		expect(reconcile(incoming, map([first], []))).toHaveLength(2);
	});

	it("retains a Generation overlay while server message is absent", () => {
		const local = overlay();
		expect(reconcile([local], [])[0]).toBe(local);
		const onlyGenerationLoaded = map([], [foundationGeneration]);
		expect(reconcile([local], onlyGenerationLoaded)).toHaveLength(1);
	});

	it("hydrates independent message/generation pages without duplicate preview or lost overlay", () => {
		const raw = serverMessage("server-assistant", "ASSISTANT", { generationId, requestId: "request-1" });
		const result = reconcile([overlay()], map([raw], []));
		expect(result).toHaveLength(1);
		expect(result[0].generation?.id).toBe(generationId);
		expect(result[0].id).toBe("local-assistant");
		const hydrated = reconcile(result, map([raw], [foundationGeneration]));
		expect(hydrated).toHaveLength(1);
		expect(hydrated[0].generation?.id).toBe(generationId);
	});

	it.each(["APPLIED", "DISCARDED"] as const)("does not regress terminal %s even with stale history having a newer timestamp", (status) => {
		const raw = serverMessage("server-assistant", "ASSISTANT", { generationId });
		const before = map([raw], [{ ...foundationGeneration, status }]);
		const stale = map([raw], [{ ...foundationGeneration, updated_at: "2099-01-01T00:00:00Z", status: "COMPLETED" }]);
		expect(reconcile(before, stale)[0].generation?.status).toBe(status);
	});

	it("filters different conversation/workspace and binding identity", () => {
		const foreignConversation = localMessage("foreign-conversation", "user", "request-1", {
			origin: { source: "optimistic", localId: "foreign-conversation", conversationId: "other" },
		});
		const foreignWorkspace = { ...overlay(), generation: { ...foundationGeneration, workspace_id: "other" } };
		expect(reconcile([foreignConversation, foreignWorkspace], [])).toEqual([]);
		const binding = { userId: "user-1", workspaceId, pageId: null, chatScope: "scope", epoch: 1 };
		for (const changed of [{ userId: "user-2" }, { workspaceId: "other" }, { pageId: "page-2" }, { epoch: 2 }]) {
			const local = localMessage("bound", "user");
			local.origin = { source: "optimistic", localId: "bound", conversationId, binding: { ...binding, ...changed } };
			expect(reconcileAiHistory([local], [], { ...foundationContext, binding })).toEqual([]);
		}
	});

	it("maps unknown/missing capabilities without fake Writing or executable Generation", () => {
		const raw = serverMessage("unknown", "ASSISTANT", { generationId, capability: "future.action" });
		const unknown = { ...foundationGeneration, capability: "future.action" } as unknown as typeof foundationGeneration;
		expect(map([raw], [unknown])[0]).toMatchObject({ capability: null, wireCapability: "future.action" });
		expect(map([raw], [unknown])[0].generation).toBeUndefined();
		expect(map([serverMessage("no-capability", "USER")], [])[0].capability).toBeNull();
	});
});
