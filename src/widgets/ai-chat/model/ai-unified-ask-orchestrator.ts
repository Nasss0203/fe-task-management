import type { AiAskResponse, AiConversation, AiGeneration, AskAiRequest } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse, isValidAiGeneration, sameAiPayload, type MappedAiAskResponse } from "./ai-ask-response-mapper";
import { isAiModificationPlan, isRecord } from "./ai-capability";
import { canReuseVerifiedAiConversation, getAiConversationVerification, isVerifiedAiConversationContext } from "./ai-history-conversations";
import { getAiChatErrorMessage, getUnifiedAskError } from "./ai-chat-error";
import { AiModificationActionError } from "./ai-modification-action";
import { acquireAiChatOperation, operationBinding, type AiChatOperation, type AiChatView } from "./ai-unified-ask-context";
import { sameAiThreadBinding } from "./ai-history-reconciliation";
import { getAiSelectionRevision, aiHistorySelectionKey, getSelectedAiConversation } from "./ai-history-selection";
import { useAiChatStore } from "./use-ai-chat-store";
import type { AiAccessDenial, AiChatMessage, AiLocalFeedbackKind, AiOperationToken, UnifiedAskInput } from "./types";

type PlanResult = Extract<MappedAiAskResponse, { kind: "plan" | "needs-context" }>;

const CONVERSATION_SWITCH_NOTICE = "Started a new conversation for this request. Your previous conversation is still in History.";

/** Validation only: these are editable template markers, never intent hints. */
export function getUnifiedAskInstructionError(instruction: string): string | null {
	if (!instruction.trim()) return "Enter a request before sending.";
	if (instruction.length > 4000) return "Use 4,000 characters or fewer. Your text has not been shortened.";
	if (["[topic]", "[sections]", "[text to improve]", "[text to summarize]", "[text to expand]"]
		.some((marker) => instruction.includes(marker))) return "Replace the template placeholders before sending.";
	return null;
}

export function validateUnifiedPlanGeneration(generation: AiGeneration, expected: Pick<PlanResult, "generationId" | "conversationId" | "plan">, request: AskAiRequest): boolean {
	if (!isValidAiGeneration(generation) || generation.id !== expected.generationId || generation.conversation_id !== expected.conversationId ||
		generation.workspace_id !== request.workspaceId || generation.capability !== "GENERATE_PAGE_MODIFICATION_PLAN" ||
		!["COMPLETED", "APPLIED", "DISCARDED"].includes(generation.status) || !isAiModificationPlan(generation.output_data)) return false;
	const output = generation.output_data;
	const plan = expected.plan;
	return output.pageId === plan.pageId && (!request.currentPageId || output.pageId === request.currentPageId) &&
		(!request.selectedPageId || output.pageId === request.selectedPageId) && output.status === plan.status &&
		output.summary === plan.summary && sameAiPayload(output.operations, plan.operations) &&
		(output.status !== "NEED_MORE_CONTEXT" || plan.status === "NEED_MORE_CONTEXT" && sameAiPayload(output.contextRequests, plan.contextRequests));
}

interface Dependencies {
	view: AiChatView;
	liveView: () => AiChatView | null;
	ask: (request: AskAiRequest) => Promise<AiAskResponse>;
	readConversation: (id: string) => Promise<AiConversation>;
	getGeneration: (id: string) => Promise<AiGeneration>;
	refreshHistory: (id: string, token: AiOperationToken) => Promise<unknown>;
	denyAccess: (error: unknown, resource: AiAccessDenial) => boolean;
}

/** Unified orchestration shared by Chat UI, handoff and candidate continuation. */
export function createUnifiedAskOrchestrator(deps: Dependencies) {
	const store = () => useAiChatStore.getState();
	const context = (operation: AiChatOperation) => ({ userId: operation.token.userId,
		workspaceId: operation.token.workspaceId, currentPageId: operation.token.pageId });
	const deny = (error: unknown, operation: AiChatOperation, conversationId: string | null, generationId?: string) =>
		operation.isCurrent() && deps.denyAccess(error, { userId: operation.token.userId, workspaceId: operation.token.workspaceId,
			pageId: operation.token.pageId, accessId: operation.token.accessId, conversationId, ...(generationId ? { generationId } : {}) });
	const verify = async (id: string, operation: AiChatOperation) => {
		let metadata: AiConversation;
		try { metadata = await deps.readConversation(id); }
		catch (error) {
			if (deny(error, operation, id)) throw new AiModificationActionError(getAiChatErrorMessage(error, "This conversation is unavailable."));
			throw error;
		}
		const verified = getAiConversationVerification(operation.token.userId, id, { isSuccess: true, isError: false, data: metadata });
		if (!isVerifiedAiConversationContext(verified, context(operation))) throw new AiModificationActionError(
			"This conversation cannot continue in the current context. Select another conversation or start a new chat.");
		return verified;
	};
	const refresh = (id: string, operation: AiChatOperation) => {
		if (operation.isCurrent()) void deps.refreshHistory(id, operation.token).catch(() => { /* The draft already exists; refresh failure never retries Ask. */ });
	};
	const put = (operation: AiChatOperation, turnId: string, content: string, kind: AiLocalFeedbackKind,
		extra: Partial<AiChatMessage> = {}, replaceId?: string) => {
		if (!operation.isCurrent()) return false;
		const id = replaceId ?? crypto.randomUUID();
		return store().addOperationMessage(operation.token, {
			id, role: "assistant", content, capability: null, createdAt: new Date().toISOString(),
			origin: { source: "feedback", feedbackKind: kind, localId: id, turnId,
				conversationId: store().threads[operation.token.chatScope]?.conversationId ?? null,
				requestId: operation.token.requestId, binding: operationBinding(operation.token) }, ...extra,
		}, replaceId);
	};
	const planPreview = async (operation: AiChatOperation, turnId: string,
		mapped: Pick<PlanResult, "generationId" | "conversationId" | "plan" | "preview" | "sources">,
		request: AskAiRequest, replaceId?: string) => {
		if (!mapped.generationId || !mapped.conversationId) return false;
		store().setPendingStage(operation.token.chatScope, operation.token.requestId!, "loading-preview");
		try {
			const generation = await deps.getGeneration(mapped.generationId);
			if (!operation.isCurrent()) return false;
			if (!validateUnifiedPlanGeneration(generation, mapped, request)) throw new AiModificationActionError("The draft did not match this request.");
			return put(operation, turnId, mapped.plan.status === "PLAN_READY" ? "Review the proposed changes before applying. No changes have been applied."
				: "More context is needed. Submit a complete instruction with the additional details.", "other", {
				capability: "GENERATE_PAGE_MODIFICATION_PLAN", generation,
				...(mapped.sources ? { sources: mapped.sources } : {}),
				origin: { source: "generation-overlay", localId: replaceId ?? crypto.randomUUID(), turnId,
					conversationId: mapped.conversationId, generationId: mapped.generationId, requestId: request.requestId ?? undefined },
			}, replaceId);
		} catch (error) {
			if (deny(error, operation, mapped.conversationId, mapped.generationId)) return false;
			return put(operation, turnId, "The draft was created, but its preview could not be loaded or verified. Retry loading the preview; do not resend the request.", "error", {
				previewRecovery: { request, binding: operationBinding(operation.token), generationId: mapped.generationId,
					conversationId: mapped.conversationId, plan: mapped.plan, preview: mapped.preview, turnId,
					...(mapped.sources ? { sources: mapped.sources } : {}) },
			}, replaceId);
		}
	};
	const route = async (operation: AiChatOperation, request: AskAiRequest, mapped: MappedAiAskResponse, turnId: string, replaceId?: string) => {
		if (!operation.isCurrent()) return false;
		if (mapped.kind === "invalid" || mapped.kind === "unknown-capability") return put(operation, turnId,
			"This AI response could not be verified. No draft actions are available. Check conversation history before sending again.", "error", {}, replaceId);
		if (mapped.kind === "feedback") return put(operation, turnId, mapped.feedback,
			mapped.status === "NEEDS_CLARIFICATION" ? "clarification" : mapped.status.startsWith("UNSUPPORTED") ? "unsupported" : "other", {}, replaceId);
		if (mapped.kind === "page-selection") return put(operation, turnId, mapped.feedback, "page-selection", {
			unifiedSelection: { request, binding: operationBinding(operation.token), selectedConversationId: operation.initialConversationId,
				selectionRevision: operation.selectionRevision(), candidates: mapped.candidates, turnId },
		}, replaceId);
		if (!mapped.conversationId || !mapped.generationId) return false;
		const verified = await verify(mapped.conversationId, operation);
		if (!operation.isCurrent()) return false;
		const intent = mapped.kind === "generation" ? mapped.capability === "GENERATE_PAGE_COMPOSITION" ? "CREATE_PAGE" : "WRITING" : "MODIFY_PAGE";
		if (!canReuseVerifiedAiConversation(verified, context(operation), intent, mapped.kind === "generation" ? undefined : mapped.plan.pageId)) {
			return put(operation, turnId, "The returned draft does not match this conversation scope or page. Select the appropriate conversation before continuing.", "error", {}, replaceId);
		}
		// Chat nhiều lượt: the server opened a new conversation because the sent one
		// did not fit (verified above like any other); this turn moves with it.
		let resultReplaceId = replaceId;
		if (mapped.conversationSwitched) {
			if (!operation.switchConversation(mapped.conversationId, turnId)) return false;
			// The notice takes the candidate list's place; the result follows it.
			put(operation, turnId, CONVERSATION_SWITCH_NOTICE, "other", {}, replaceId);
			resultReplaceId = undefined;
		} else if (!operation.bindConversation(mapped.conversationId)) return false;
		if (mapped.kind !== "generation") {
			const result = await planPreview(operation, turnId, mapped, request, resultReplaceId);
			refresh(mapped.conversationId, operation);
			return result;
		}
		const generation = mapped.generation;
		if (generation.status === "FAILED" || generation.status === "PROCESSING") {
			put(operation, turnId, "The draft is not ready. Check conversation history for its latest status.", "error", {}, resultReplaceId);
		} else {
			const text = isRecord(generation.output_data) && typeof generation.output_data.text === "string" ? generation.output_data.text : "A page draft is ready for review. The page has not been created.";
			put(operation, turnId, text, "other", { capability: generation.capability, generation,
				origin: { source: "generation-overlay", localId: resultReplaceId ?? crypto.randomUUID(), turnId,
					conversationId: mapped.conversationId, generationId: mapped.generationId, requestId: request.requestId ?? undefined },
			}, resultReplaceId);
		}
		refresh(mapped.conversationId, operation);
		return true;
	};

	const send = async (input: UnifiedAskInput, continuation?: { messageId: string; turnId: string }) => {
		if (typeof input.instruction !== "string" || getUnifiedAskInstructionError(input.instruction) ||
			(input.selectedText != null && (typeof input.selectedText !== "string" || !input.selectedText.trim() || input.selectedText.length > 8000)) ||
			!deps.view.userId || !deps.view.workspaceId ||
			(deps.view.shareToken && input.selectedPageId && input.selectedPageId !== deps.view.pageId)) return false;
		const inputRevision = store().threads[deps.view.chatScope]?.inputRevision ?? 0;
		const operation = acquireAiChatOperation(deps.view, deps.liveView, { type: "ask", requestId: crypto.randomUUID() });
		if (!operation) return false;
		const turnId = continuation?.turnId ?? crypto.randomUUID();
		try {
			if (operation.initialConversationId) {
				await verify(operation.initialConversationId, operation);
				if (!operation.isCurrent() || !operation.bindConversation(operation.initialConversationId)) return false;
			}
			const request: AskAiRequest = { workspaceId: operation.token.workspaceId, instruction: input.instruction,
				requestId: operation.token.requestId,
				...(operation.token.pageId ? { currentPageId: operation.token.pageId } : {}),
				...(operation.initialConversationId ? { conversationId: operation.initialConversationId } : {}),
				...(input.selectedText !== undefined ? { selectedText: input.selectedText } : {}),
				...(input.selectedPageId !== undefined ? { selectedPageId: input.selectedPageId } : {}),
			};
			if (!operation.isCurrent()) return false;
			if (continuation) store().correlateOperationTurn(operation.token, turnId);
			else store().addOperationMessage(operation.token, { id: crypto.randomUUID(), role: "user", capability: null,
				content: input.instruction, createdAt: new Date().toISOString(), origin: { source: "optimistic", localId: crypto.randomUUID(),
					turnId, requestId: request.requestId ?? undefined, conversationId: operation.initialConversationId, originalInstruction: input.instruction } });
			// Dispatch acknowledgement is distinct from the final boolean outcome.
			// Clear only the submitted draft, after preflight, and never restore it on timeout/error.
			if (!continuation) store().acknowledgeOperationInput(operation.token, input.instruction, inputRevision);
			const response = await deps.ask(request);
			if (!operation.isCurrent()) return false;
			return await route(operation, request, mapAiAskResponse(response, request), turnId, continuation?.messageId);
		} catch (error) {
			if (deny(error, operation, operation.conversationId())) return false;
			const feedback = getUnifiedAskError(error);
			put(operation, turnId, feedback.message, feedback.kind, {}, continuation?.messageId);
			return false;
		} finally { store().releaseOperation(operation.token); }
	};

	const selectCandidate = (messageId: string, selectedPageId: string) => {
		const thread = store().threads[deps.view.chatScope];
		const selection = thread?.messages.find((message) => message.id === messageId)?.unifiedSelection;
		const key = aiHistorySelectionKey(deps.view.userId, deps.view.workspaceId, deps.view.pageId ?? undefined, deps.view.accessId);
		if (!selection || !deps.view.userId || !deps.view.workspaceId || !sameAiThreadBinding(selection.binding, {
			userId: deps.view.userId, workspaceId: deps.view.workspaceId, pageId: deps.view.pageId,
			chatScope: deps.view.chatScope, accessId: deps.view.accessId, epoch: thread.epoch,
		}) || getSelectedAiConversation(key) !== selection.selectedConversationId || getAiSelectionRevision(key) !== selection.selectionRevision ||
			!selection.candidates.some((candidate) => candidate.pageId === selectedPageId && candidate.workspaceId === deps.view.workspaceId)) return Promise.resolve(false);
		return send({ instruction: selection.request.instruction, selectedPageId,
			...(selection.request.selectedText !== undefined ? { selectedText: selection.request.selectedText } : {}),
		}, { messageId, turnId: selection.turnId });
	};
	const retryPreview = async (messageId: string) => {
		const thread = store().threads[deps.view.chatScope];
		const recovery = thread?.messages.find((message) => message.id === messageId)?.previewRecovery;
		if (!recovery || !deps.view.userId || !deps.view.workspaceId || !sameAiThreadBinding(recovery.binding, {
			userId: deps.view.userId, workspaceId: deps.view.workspaceId, pageId: deps.view.pageId,
			chatScope: deps.view.chatScope, accessId: deps.view.accessId, epoch: thread.epoch,
		})) return false;
		const operation = acquireAiChatOperation(deps.view, deps.liveView, { type: "ask", requestId: recovery.request.requestId ?? crypto.randomUUID() });
		if (!operation) return false;
		try {
			if (operation.initialConversationId !== recovery.conversationId) return false;
			const verified = await verify(recovery.conversationId, operation);
			if (!operation.isCurrent() || !canReuseVerifiedAiConversation(verified, context(operation), "MODIFY_PAGE", recovery.plan.pageId)) return false;
			const result = await planPreview(operation, recovery.turnId, recovery, recovery.request, messageId);
			refresh(recovery.conversationId, operation);
			return result;
		} catch (error) {
			deny(error, operation, recovery.conversationId);
			return false;
		} finally { store().releaseOperation(operation.token); }
	};
	return { send, selectCandidate, retryPreview };
}
