import type {
	AiCapability,
	AiGeneration,
	AiPageResolutionCandidate,
} from "@/entities/ai-assistant/model/ai-assistant.types";

export type AiChatMode = AiCapability;

export type AiChatPendingStage =
	| "preparing"
	| "writing"
	| "composing-page"
	| "planning-modification"
	| "loading-preview";

export interface AiChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	capability: AiCapability;
	generation?: AiGeneration;
	/** Page candidates returned by NestJS. Selection is reauthorized there. */
	pageSelection?: {
		instruction: string;
		workspaceId: string;
		candidates: AiPageResolutionCandidate[];
	};
	/** Phase 4 previews never show an Apply action; execution is Phase 5. */
	previewOnly?: boolean;
	createdAt: string;
}

/**
 * Each Page or Global Chat has its own state.
 */
export interface AiChatThread {
	messages: AiChatMessage[];

	mode: AiChatMode;
	input: string;

	conversationId: string | null;
	conversationWorkspaceId: string | null;

	pendingStage: AiChatPendingStage | null;
	activeRequestId: string | null;
}

export interface QuickActionItem {
	id: string;
	label: string;
	prompt: string;
	mode: AiChatMode;

	iconName:
		| "file-text"
		| "wand"
		| "align-left"
		| "minimize"
		| "maximize"
		| "languages"
		| "list-plus";
}
