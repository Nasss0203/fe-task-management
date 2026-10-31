import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import type { AiChatMessage, AiThreadBinding } from "./types";

export function sameAiThreadBinding(a: AiThreadBinding, b: AiThreadBinding): boolean {
	return a.accessId === b.accessId && a.userId === b.userId && a.workspaceId === b.workspaceId && a.pageId === b.pageId &&
		a.chatScope === b.chatScope && a.epoch === b.epoch;
}

function preferGeneration(previous?: AiGeneration, incoming?: AiGeneration): AiGeneration | undefined {
	if (!previous) return incoming;
	if (!incoming || previous.id !== incoming.id) return previous;
	// A refresh started before Confirm/Discard must never revive a settled draft.
	if (previous.status === "APPLIED" || previous.status === "DISCARDED") return previous;
	if (incoming.status === "APPLIED" || incoming.status === "DISCARDED") return incoming;
	return previous.updated_at > incoming.updated_at ? previous : incoming;
}

function matches(local: AiChatMessage, saved: AiChatMessage): boolean {
	const a = local.origin;
	const b = saved.origin;
	if (!a || !b || a.source === "persisted" || b.source !== "persisted" ||
		a.source === "feedback" || !a.conversationId || a.conversationId !== b.conversationId || local.role !== saved.role) return false;
	if (local.role === "assistant") return Boolean(a.generationId && a.generationId === b.generationId);
	return Boolean(a.requestId && a.requestId === b.requestId);
}

/** Reconcile only the loaded window. Absence from a page is never evidence of deletion. */
export function reconcileAiHistory(
	previous: AiChatMessage[],
	incoming: AiChatMessage[],
	context: { conversationId: string; workspaceId: string; binding?: AiThreadBinding },
): AiChatMessage[] {
	const belongs = (message: AiChatMessage) => {
		if (message.origin?.conversationId && message.origin.conversationId !== context.conversationId) return false;
		if (message.origin?.binding && context.binding && !sameAiThreadBinding(message.origin.binding, context.binding)) return false;
		return !message.generation?.workspace_id || message.generation.workspace_id === context.workspaceId;
	};
	const before = previous.filter(belongs);
	const saved = new Map<string, AiChatMessage>();
	for (const message of [...before, ...incoming.filter(belongs)]) {
		if (message.origin?.source !== "persisted") continue;
		const key = message.origin.serverMessageId;
		const old = saved.get(key);
		saved.set(key, old ? {
			...message, id: old.id,
			origin: { ...message.origin, localId: old.origin?.localId },
			generation: preferGeneration(old.generation, message.generation),
			// M8: the server's history holds no sources; keep the ones this chat saw.
			...(old.sources && !message.sources ? { sources: old.sources } : {}),
		} : message);
	}
	const records = [...saved.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) ||
		(a.origin?.source === "persisted" ? a.origin.serverMessageId : a.id).localeCompare(
			b.origin?.source === "persisted" ? b.origin.serverMessageId : b.id));
	const replaced = new Map<string, AiChatMessage>();
	const claimed = new Set<string>();
	for (const local of before.filter((message) => message.origin?.source !== "persisted")) {
		const candidates = records.filter((message) => matches(local, message));
		// Correlation is not unique by contract. Never consume ambiguous records.
		if (candidates.length !== 1) continue;
		const counterpart = candidates[0];
		if (before.filter((message) => matches(message, counterpart)).length !== 1 || claimed.has(counterpart.id)) continue;
		claimed.add(counterpart.id);
		const generation = preferGeneration(local.generation, counterpart.generation);
		const hydrated: AiChatMessage = {
			...counterpart, id: local.id,
			generation,
			...(local.sources ? { sources: local.sources } : {}),
			origin: { ...counterpart.origin!, source: "persisted", serverMessageId: counterpart.origin!.source === "persisted"
				? counterpart.origin!.serverMessageId : counterpart.id,
				localId: local.origin?.localId ?? local.id, turnId: local.origin?.turnId,
				originalInstruction: local.origin?.originalInstruction, binding: local.origin?.binding },
		};
		replaced.set(local.id, hydrated);
		saved.set(counterpart.origin!.source === "persisted" ? counterpart.origin!.serverMessageId : counterpart.id, hydrated);
	}
	// Anchor ephemeral turns to their nearest preceding persisted/hydrated message.
	const buckets = new Map<string | null, AiChatMessage[]>();
	let anchor: string | null = null;
	for (const message of before) {
		const hydrated = replaced.get(message.id);
		if (message.origin?.source === "persisted" || hydrated) {
			const origin = hydrated?.origin ?? message.origin;
			anchor = origin?.source === "persisted" ? origin.serverMessageId : null;
		} else {
			buckets.set(anchor, [...(buckets.get(anchor) ?? []), message]);
		}
	}
	const result = [...(buckets.get(null) ?? [])];
	for (const record of records) {
		const key = record.origin!.source === "persisted" ? record.origin!.serverMessageId : record.id;
		result.push(saved.get(key)!, ...(buckets.get(key) ?? []));
	}
	return result;
}
