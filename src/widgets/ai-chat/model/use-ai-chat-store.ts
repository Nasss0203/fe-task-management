import { create } from "zustand";
import type { AiGeneration, AiHistoryMessage } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiHistoryMessages } from "./ai-history-mapper";
import { reconcileAiHistory, sameAiThreadBinding } from "./ai-history-reconciliation";

import type {
	AiChatMessage,
	AiAccessDenial,
	AiChatMode,
	AiChatPendingStage,
	AiChatThread,
	AiOperationInput,
	AiOperationToken,
	AiThreadBinding,
	AiPendingSubmission,
	QuickActionItem,
} from "./types";

const DEFAULT_AI_MODE: AiChatMode = "writing.improve";

const GLOBAL_CHAT_SCOPE = "global";

/**
 * Each page has its own AI chat scope.
 * The dashboard AI chat uses the global scope.
 */
export function getAiChatScope(
	pageId?: string,
	workspaceId?: string | null,
	userId?: string,
	accessId?: string,
): string {
	// A global thread belongs to one user and one workspace, even before a
	// persisted conversation exists (e.g. an AMBIGUOUS_PAGE prompt).
	if (userId && workspaceId) {
		return pageId
			? `user:${userId}:workspace:${workspaceId}:page:${pageId}${accessId ? `:access:${accessId}` : ""}`
			: `user:${userId}:workspace:${workspaceId}:global${accessId ? `:access:${accessId}` : ""}`;
	}
	return pageId ? `page:${pageId}` : GLOBAL_CHAT_SCOPE;
}

/**
 * Create a fresh chat thread.
 */
function createEmptyThread(epoch = 0): AiChatThread {
	return {
		messages: [],
		epoch,
		operation: null,
		mode: DEFAULT_AI_MODE,
		input: "",
		inputRevision: 0,
		pendingSubmission: null,

		conversationId: null,
		conversationWorkspaceId: null,

		pendingStage: null,
		activeRequestId: null,
	};
}

/**
 * Stable fallback for a thread that does not exist yet.
 * Do not mutate this object directly.
 */
export const EMPTY_AI_CHAT_THREAD: AiChatThread = createEmptyThread();

interface AiChatStore {
	threads: Record<string, AiChatThread>;
	accessDenials: AiAccessDenial[];
	denyAccess: (resource: AiAccessDenial) => void;
	// Drafts the server rejected because their Page changed after planning (409).
	staleGenerationIds: Record<string, true>;
	markGenerationStale: (generationId: string) => void;
	acquireOperation: (input: AiOperationInput) => AiOperationToken | null;
	releaseOperation: (token: AiOperationToken) => void;
	isOperationActive: (token: AiOperationToken) => boolean;
	addOperationMessage: (token: AiOperationToken, message: AiChatMessage, replaceId?: string) => boolean;
	bindOperationConversation: (token: AiOperationToken, conversationId: string) => boolean;
	/** Chat nhiều lượt: move the current turn to the conversation the server opened. */
	switchOperationConversation: (token: AiOperationToken, conversationId: string, turnId: string) => boolean;
	correlateOperationTurn: (token: AiOperationToken, turnId: string) => void;
	acknowledgeOperationInput: (token: AiOperationToken, instruction: string, inputRevision: number) => void;
	queueUnifiedSubmission: (binding: AiThreadBinding, instruction: string, selectionRevision: number) => boolean;
	takeUnifiedSubmission: (binding: AiThreadBinding, selectionRevision: number) => AiPendingSubmission | null;
	clearPendingSubmissions: () => void;
	purgeUserThreads: (userId: string) => void;
	clearAccessThread: (scope: string) => void;
	hydrateHistory: (scope: string, conversationId: string, workspaceId: string,
		messages: AiHistoryMessage[], generations: AiGeneration[], epoch: number) => void;

	setMessages: (
		scope: string,
		messages:
			| AiChatMessage[]
			| ((previous: AiChatMessage[]) => AiChatMessage[]),
	) => void;

	addMessage: (
		scope: string,
		message: AiChatMessage,
		requestId?: string,
	) => void;

	setMode: (scope: string, mode: AiChatMode) => void;

	setInput: (scope: string, input: string) => void;

	setConversation: (
		scope: string,
		conversationId: string,
		workspaceId: string,
	) => void;

	clearConversation: (scope: string) => void;

	newChat: (scope: string) => boolean;

	selectQuickAction: (scope: string, action: QuickActionItem) => void;

	beginRequest: (
		scope: string,
		requestId: string,
		stage: AiChatPendingStage,
	) => boolean;

	setPendingStage: (
		scope: string,
		requestId: string,
		stage: AiChatPendingStage,
	) => void;

	finishRequest: (scope: string, requestId: string) => void;
}

/**
 * Read an existing thread or return the empty fallback.
 */
function getThread(state: AiChatStore, scope: string): AiChatThread {
	return state.threads[scope] ?? EMPTY_AI_CHAT_THREAD;
}

/**
 * Update a single thread without modifying other threads.
 */
function updateThread(
	state: AiChatStore,
	scope: string,
	updater: (thread: AiChatThread) => AiChatThread,
): Pick<AiChatStore, "threads"> {
	const currentThread = getThread(state, scope);

	return {
		threads: {
			...state.threads,
			[scope]: updater(currentThread),
		},
	};
}

/** Legacy writers gain provenance without changing their capability dispatch. */
function withMessageOrigins(thread: AiChatThread, messages: AiChatMessage[], requestId?: string): AiChatMessage[] {
	return messages.map((message) => {
		const previous = thread.messages.find((item) => item.id === message.id);
		const oldOrigin = message.origin ?? previous?.origin;
		if (oldOrigin?.source === "persisted") return { ...message, origin: oldOrigin };
		const correlation = {
			...oldOrigin,
			conversationId: message.generation?.conversation_id ?? oldOrigin?.conversationId ?? thread.conversationId,
			requestId: requestId ?? oldOrigin?.requestId ?? thread.activeRequestId ?? undefined,
			turnId: oldOrigin?.turnId ?? (message.role === "user" ? message.id :
				thread.messages.findLast((item) => item.role === "user")?.origin?.turnId),
			generationId: message.generation?.id ?? oldOrigin?.generationId,
			originalInstruction: oldOrigin?.originalInstruction ?? (message.role === "user" ? message.content : undefined),
			localId: oldOrigin?.localId ?? message.id,
		};
		return {
			...message,
			origin: message.generation ? { ...correlation, source: "generation-overlay" as const } :
				message.role === "user" ? { ...correlation, source: "optimistic" as const } :
					{ ...correlation, source: "feedback" as const,
						feedbackKind: oldOrigin?.source === "feedback" ? oldOrigin.feedbackKind :
							message.pageSelection ? "page-selection" as const : "other" as const },
		};
	});
}

function operationMatches(thread: AiChatThread, token: AiOperationToken): boolean {
	return thread.operation?.operationId === token.operationId &&
		sameAiThreadBinding(thread.operation, token) && thread.epoch === token.epoch &&
		thread.operation.type === token.type && thread.operation.requestId === token.requestId &&
		thread.operation.generationId === token.generationId;
}

export function isAiAccessDenied(denials: AiAccessDenial[], resource: AiAccessDenial): boolean {
	return denials.some((denial) => denial.userId === resource.userId && denial.workspaceId === resource.workspaceId && denial.accessId === resource.accessId &&
		(denial.generationId ? denial.generationId === resource.generationId &&
			(!denial.conversationId || denial.conversationId === resource.conversationId) :
			denial.conversationId ? denial.conversationId === resource.conversationId :
			Boolean(denial.pageId && denial.pageId === resource.pageId)));
}

export function getAiGenerationPageId(generation?: AiGeneration): string | null {
	const output = generation?.output_data;
	return output && typeof output === "object" && !Array.isArray(output) && "pageId" in output &&
		typeof output.pageId === "string" ? output.pageId : null;
}

/** Drop whole objects, including raw instructions, recovery plans and provenance. */
function readableMessages(state: AiChatStore, scope: string, thread: AiChatThread, messages: AiChatMessage[]) {
	const related = state.accessDenials.filter((denial) => scope.startsWith(`user:${denial.userId}:workspace:${denial.workspaceId}:`) &&
		(denial.accessId ? scope.endsWith(`:access:${denial.accessId}`) : !scope.includes(":access:")));
	return messages.filter((message) => !related.some((denial) => isAiAccessDenied([denial], {
		...denial, conversationId: message.generation?.conversation_id ?? message.previewRecovery?.conversationId ?? message.origin?.conversationId ?? thread.conversationId,
		generationId: message.generation?.id ?? message.previewRecovery?.generationId ?? message.origin?.generationId,
		pageId: getAiGenerationPageId(message.generation) ?? message.previewRecovery?.plan.pageId ??
			message.unifiedSelection?.request.currentPageId ?? message.unifiedSelection?.request.selectedPageId ??
			(scope === getAiChatScope(denial.pageId ?? undefined, denial.workspaceId, denial.userId, denial.accessId) ? denial.pageId : null),
	})));
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
	threads: {},
	clearAccessThread: (scope) => set((state) => updateThread(state, scope, (thread) => createEmptyThread(thread.epoch + 1))),
	accessDenials: [],
	staleGenerationIds: {},
	markGenerationStale: (generationId) => set((state) => state.staleGenerationIds[generationId] ? state
		: { staleGenerationIds: { ...state.staleGenerationIds, [generationId]: true } }),
	denyAccess: (resource) => set((state) => {
		if (state.accessDenials.some((denial) => denial.userId === resource.userId && denial.workspaceId === resource.workspaceId && denial.accessId === resource.accessId &&
			denial.conversationId === resource.conversationId && denial.pageId === resource.pageId && denial.generationId === resource.generationId)) return state;
		const next = { ...state, accessDenials: [...state.accessDenials, resource] };
		return { accessDenials: next.accessDenials, threads: Object.fromEntries(Object.entries(state.threads).map(([scope, thread]) => {
			if (!scope.startsWith(`user:${resource.userId}:workspace:${resource.workspaceId}:`) ||
				(resource.accessId ? !scope.endsWith(`:access:${resource.accessId}`) : scope.includes(":access:"))) return [scope, thread];
			const messages = readableMessages(next, scope, thread, thread.messages);
			const removed = thread.messages.filter((message) => !messages.includes(message));
			const turnIds = new Set(removed.flatMap((message) => message.origin?.turnId ? [message.origin.turnId] : []));
			const requestIds = new Set(removed.flatMap((message) => message.origin?.requestId ? [message.origin.requestId] : []));
			const remaining = messages.filter((message) => !(message.origin?.turnId && turnIds.has(message.origin.turnId)) &&
				!(message.origin?.requestId && requestIds.has(message.origin.requestId)) &&
				!(resource.generationId && thread.activeRequestId && message.origin?.requestId === thread.activeRequestId));
			const affected = messages.length !== thread.messages.length ||
				(resource.conversationId ? thread.conversationId === resource.conversationId &&
					(!resource.generationId || thread.operation?.generationId === resource.generationId || Boolean(thread.activeRequestId)) :
					scope === getAiChatScope(resource.pageId ?? undefined, resource.workspaceId, resource.userId, resource.accessId));
			if (!affected) return [scope, thread];
			// A security transition bypasses the normal busy-reset veto, invalidating
			// every writer from the previous epoch before any async cache cleanup.
			// A different generation's action in this same conversation keeps its token.
			if (resource.generationId && thread.operation?.generationId && thread.operation.generationId !== resource.generationId)
				return [scope, { ...thread, messages: remaining }];
			return [scope, { ...thread, messages: remaining, epoch: thread.epoch + 1, operation: null,
				activeRequestId: null, pendingStage: null, pendingSubmission: null, input: "", inputRevision: thread.inputRevision + 1 }];
		})) };
	}),

	acquireOperation: (input) => {
		const thread = getThread(get(), input.chatScope);
		const generation = thread.messages.find((message) => message.generation?.id === input.generationId)?.generation;
		if (!input.userId || !input.workspaceId || input.chatScope !==
			getAiChatScope(input.pageId ?? undefined, input.workspaceId, input.userId, input.accessId) ||
			thread.epoch !== input.epoch || thread.operation || thread.activeRequestId ||
			!["ask", "confirm", "discard"].includes(input.type) ||
			(thread.conversationWorkspaceId && thread.conversationWorkspaceId !== input.workspaceId) ||
			(input.type === "ask" ? !input.requestId : !input.generationId) || isAiAccessDenied(get().accessDenials, {
				...input, conversationId: thread.conversationId, pageId: getAiGenerationPageId(generation) ?? input.pageId,
			})) return null;
		const token: AiOperationToken = Object.freeze({ ...input, operationId: crypto.randomUUID() });
		set((state) => updateThread(state, input.chatScope, (current) => ({
			...current, operation: token,
			...(token.type === "ask" ? { activeRequestId: token.requestId, pendingStage: "preparing" as const } : {}),
		})));
		return token;
	},
	releaseOperation: (token) => set((state) => {
		const thread = getThread(state, token.chatScope);
		if (!operationMatches(thread, token)) return state;
		return updateThread(state, token.chatScope, (current) => ({
			...current, operation: null,
			...(token.type === "ask" ? { activeRequestId: null, pendingStage: null } : {}),
		}));
	}),
	isOperationActive: (token) => operationMatches(getThread(get(), token.chatScope), token),
	addOperationMessage: (token, message, replaceId) => {
		const thread = getThread(get(), token.chatScope);
		if (!operationMatches(thread, token) ||
			(message.generation?.workspace_id && message.generation.workspace_id !== token.workspaceId) ||
			(message.origin?.binding && !sameAiThreadBinding(message.origin.binding, token)) ||
			(message.origin?.conversationId && thread.conversationId && message.origin.conversationId !== thread.conversationId) ||
			(replaceId && !thread.messages.some((item) => item.id === replaceId)) ||
			!readableMessages(get(), token.chatScope, thread, [message]).length) return false;
		const [local] = withMessageOrigins(thread, [message], token.requestId);
		const boundMessage = { ...local, origin: local.origin ? { ...local.origin, binding: {
			userId: token.userId, workspaceId: token.workspaceId, pageId: token.pageId, accessId: token.accessId,
			chatScope: token.chatScope, epoch: token.epoch,
		} } : undefined };
		set((state) => updateThread(state, token.chatScope, (current) => ({ ...current,
			messages: replaceId ? current.messages.map((item) => item.id === replaceId ? { ...boundMessage, id: replaceId } : item)
				: [...current.messages, boundMessage],
		})));
		return true;
	},
	bindOperationConversation: (token, conversationId) => {
		const thread = getThread(get(), token.chatScope);
		if (!operationMatches(thread, token) || !conversationId ||
			(thread.conversationId && thread.conversationId !== conversationId) ||
			isAiAccessDenied(get().accessDenials, { ...token, conversationId })) return false;
		set((state) => updateThread(state, token.chatScope, (current) => ({ ...current,
			conversationId, conversationWorkspaceId: token.workspaceId,
			messages: current.messages.map((message) => message.origin && !message.origin.conversationId
				? { ...message, origin: { ...message.origin, conversationId } } : message),
		})));
		return true;
	},
	switchOperationConversation: (token, conversationId, turnId) => {
		const thread = getThread(get(), token.chatScope);
		if (!operationMatches(thread, token) || !conversationId || thread.conversationId === conversationId ||
			isAiAccessDenied(get().accessDenials, { ...token, conversationId })) return false;
		set((state) => updateThread(state, token.chatScope, (current) => ({ ...current,
			conversationId, conversationWorkspaceId: token.workspaceId,
			// Earlier turns stay in the previous conversation, reachable from History.
			messages: current.messages.filter((message) => message.origin?.turnId === turnId)
				.map((message) => ({ ...message, origin: { ...message.origin!, conversationId } })),
		})));
		return true;
	},
	correlateOperationTurn: (token, turnId) => set((state) => {
		if (!operationMatches(getThread(state, token.chatScope), token)) return state;
		return updateThread(state, token.chatScope, (current) => ({ ...current,
			messages: current.messages.map((message) => message.role === "user" && message.origin?.source === "optimistic" &&
				message.origin.turnId === turnId ? { ...message, origin: { ...message.origin, requestId: token.requestId } } : message),
		}));
	}),
	acknowledgeOperationInput: (token, instruction, inputRevision) => set((state) => {
		const thread = getThread(state, token.chatScope);
		if (!operationMatches(thread, token) || thread.input !== instruction || thread.inputRevision !== inputRevision) return state;
		return updateThread(state, token.chatScope, (current) => ({
			...current, input: "", inputRevision: current.inputRevision + 1,
		}));
	}),
	queueUnifiedSubmission: (binding, instruction, selectionRevision) => {
		const thread = getThread(get(), binding.chatScope);
		if (!binding.userId || !binding.workspaceId || binding.chatScope !== getAiChatScope(binding.pageId ?? undefined, binding.workspaceId, binding.userId, binding.accessId) ||
			thread.epoch !== binding.epoch || thread.operation || thread.activeRequestId || thread.conversationId ||
			Object.values(get().threads).some((item) => item.pendingSubmission)) return false;
		const inputRevision = thread.inputRevision + 1;
		set((state) => updateThread(state, binding.chatScope, (current) => ({
			...current, input: instruction, inputRevision,
			pendingSubmission: { id: crypto.randomUUID(), instruction, binding, selectionRevision, inputRevision },
		})));
		return true;
	},
	clearPendingSubmissions: () => set((state) => {
		if (!Object.values(state.threads).some((thread) => thread.pendingSubmission)) return state;
		return { threads: Object.fromEntries(Object.entries(state.threads).map(([scope, thread]) =>
			[scope, thread.pendingSubmission ? { ...thread, pendingSubmission: null } : thread])) };
	}),
	takeUnifiedSubmission: (binding, selectionRevision) => {
		const thread = getThread(get(), binding.chatScope);
		const pending = thread.pendingSubmission;
		const valid = pending && sameAiThreadBinding(pending.binding, binding) &&
			pending.selectionRevision === selectionRevision && pending.inputRevision === thread.inputRevision &&
			pending.instruction === thread.input && !thread.operation && !thread.activeRequestId && !thread.conversationId;
		get().clearPendingSubmissions();
		return valid ? pending : null;
	},
	// Explicit auth cleanup invalidates tokens; normal navigation never cancels an operation.
	purgeUserThreads: (userId) => set((state) => ({ threads: Object.fromEntries(
		Object.entries(state.threads).map(([scope, thread]) => [scope,
			scope.startsWith(`user:${userId}:`) ? createEmptyThread(thread.epoch + 1) : thread]),
	) })),
	hydrateHistory: (scope, conversationId, workspaceId, messages, generations, epoch) => set((state) => {
		const thread = getThread(state, scope);
		if (thread.epoch !== epoch || thread.activeRequestId || thread.operation || thread.conversationId !== conversationId ||
			thread.conversationWorkspaceId !== workspaceId) return state;
		return updateThread(state, scope, (current) => ({ ...current, messages: readableMessages(state, scope, current, reconcileAiHistory(
			current.messages,
			mapAiHistoryMessages(messages.filter((message) => message.conversation_id === conversationId),
				generations.filter((generation) => !generation.workspace_id || generation.workspace_id === workspaceId)),
			{ conversationId, workspaceId },
		)) }));
	}),

	/**
	 * Replace or update messages in a specific thread.
	 */
	setMessages: (scope, messages) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				messages: readableMessages(state, scope, thread, withMessageOrigins(thread,
					typeof messages === "function"
						? messages(thread.messages)
						: messages,
				)),
			})),
		),

	/**
	 * Append a message to the correct thread.
	 * If requestId is provided, ignore stale requests.
	 */
	addMessage: (scope, message, requestId) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (requestId && thread.activeRequestId !== requestId) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				messages: readableMessages(state, scope, current, [...current.messages, ...withMessageOrigins(current, [message], requestId)]),
			}));
		}),

	setMode: (scope, mode) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				mode,
			})),
		),

	setInput: (scope, input) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				input,
				inputRevision: thread.inputRevision + 1,
			})),
		),

	/**
	 * Save conversation information for one thread.
	 */
	setConversation: (scope, conversationId, workspaceId) =>
		set((state) => {
			const thread = getThread(state, scope);
			const switching = Boolean(thread.conversationId && thread.conversationId !== conversationId);
			if (thread.operation && (switching || (thread.conversationWorkspaceId && thread.conversationWorkspaceId !== workspaceId))) return state;
			const messages = switching ? thread.messages.filter((message) =>
				thread.activeRequestId && message.origin?.requestId === thread.activeRequestId) : thread.messages;
			return updateThread(state, scope, (current) => ({
				...current, conversationId, conversationWorkspaceId: workspaceId,
				epoch: switching && !thread.activeRequestId ? thread.epoch + 1 : thread.epoch,
				messages: messages.map((message) => message.origin && message.origin.source !== "persisted"
					? { ...message, origin: { ...message.origin, conversationId } } : message),
			}));
		}),

	clearConversation: (scope) =>
		set((state) => getThread(state, scope).operation ? state :
			updateThread(state, scope, (thread) => ({ ...createEmptyThread(thread.epoch + 1), mode: thread.mode }))),

	/**
	 * Reset only the selected thread.
	 * Other page conversations remain unchanged.
	 */
	newChat: (scope) => {
		const thread = getThread(get(), scope);
		if (thread.operation || thread.activeRequestId) return false;
		set((state) => ({ threads: { ...state.threads, [scope]: createEmptyThread(thread.epoch + 1) } }));
		return true;
	},

	selectQuickAction: (scope, action) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				input: action.prompt,
				inputRevision: thread.inputRevision + 1,
			})),
		),

	/**
	 * Start a request within one chat scope.
	 * Reject duplicate requests in that scope.
	 */
	beginRequest: (scope, requestId, stage) => {
		const thread = getThread(get(), scope);

		if (thread.activeRequestId !== null || thread.operation) {
			return false;
		}

		set((state) =>
			updateThread(state, scope, (current) => ({
				...current,
				activeRequestId: requestId,
				pendingStage: stage,
			})),
		);

		return true;
	},

	/**
	 * Update loading stage only for the active request.
	 */
	setPendingStage: (scope, requestId, stage) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (thread.activeRequestId !== requestId) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				pendingStage: stage,
			}));
		}),

	/**
	 * Finish a request and remove the loading state.
	 */
	finishRequest: (scope, requestId) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (thread.activeRequestId !== requestId || thread.operation) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				pendingStage: null,
				activeRequestId: null,
			}));
		}),
}));
