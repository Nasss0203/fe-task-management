/** Explicit caller-owned Page credential. This never grants authentication or workspace access. */
export interface AiPageAccessContext {
	readonly userId: string;
	readonly workspaceId: string;
	readonly pageId: string;
	readonly shareToken: string;
}

// Session memory only. Exact string equality, collision-free monotonic identities;
// no secret, substring or weak hash in Query keys, chat state or persisted selection.
const identities = new Map<string, string>();
let nextIdentity = 0;
export function getAiAccessIdentity(shareToken?: string): string | undefined {
	if (!shareToken) return undefined;
	let identity = identities.get(shareToken);
	if (!identity) {
		identity = `token-${++nextIdentity}`;
		identities.set(shareToken, identity);
	}
	return identity;
}

export function getBoundAiShareToken(context: AiPageAccessContext | undefined,
	userId: string | undefined, workspaceId: string | null, pageId: string | undefined): string | undefined {
	return context && userId && workspaceId && pageId && context.userId === userId &&
		context.workspaceId === workspaceId && context.pageId === pageId ? context.shareToken || undefined : undefined;
}
