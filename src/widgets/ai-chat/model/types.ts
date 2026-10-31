import type {
	AiCapability,
	AiGeneration,
	AiPageResolutionCandidate,
	AiPlanSource,
	AskAiRequest,
	AiModificationPlan,
	AiModificationPlanPreview,
} from "@/entities/ai-assistant/model/ai-assistant.types";

export type AiChatMode = AiCapability;

/** Resource identity only; never retain protected content in a denial marker. */
export interface AiAccessDenial {
	accessId?: string;
	userId: string;
	workspaceId: string;
	conversationId: string | null;
	pageId: string | null;
	generationId?: string;
}

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
	capability: AiCapability | null;
	/** Open wire value is retained without enabling a legacy renderer/action. */
	wireCapability?: string | null;
	origin?: AiMessageOrigin;
	/** Unified continuation is intentionally separate from the legacy candidate renderer. */
	unifiedSelection?: {
		request: AskAiRequest;
		binding: AiThreadBinding;
		selectedConversationId: string | null;
		selectionRevision: number;
		candidates: AiPageResolutionCandidate[];
		turnId: string;
	};
	previewRecovery?: {
		request: AskAiRequest;
		binding: AiThreadBinding;
		generationId: string;
		conversationId: string;
		plan: AiModificationPlan;
		preview: AiModificationPlanPreview;
		turnId: string;
		sources?: AiPlanSource[];
	};
	generation?: AiGeneration;
	/** M8: the Pages a draft was based on (from the Ask response, not the model). */
	sources?: AiPlanSource[];
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
	epoch: number;
	operation: AiOperationToken | null;

	mode: AiChatMode;
	input: string;
	inputRevision: number;
	pendingSubmission: AiPendingSubmission | null;

	conversationId: string | null;
	conversationWorkspaceId: string | null;

	pendingStage: AiChatPendingStage | null;
	activeRequestId: string | null;
}

export interface AiThreadBinding {
	accessId?: string;
	userId: string;
	workspaceId: string;
	pageId: string | null;
	chatScope: string;
	epoch: number;
}

interface AiMessageCorrelation {
	conversationId: string | null;
	turnId?: string;
	requestId?: string;
	generationId?: string;
	originalInstruction?: string;
	binding?: AiThreadBinding;
}

export type AiLocalFeedbackKind =
	| "clarification" | "unsupported" | "page-selection" | "error" | "timeout" | "other";

export type AiMessageOrigin = AiMessageCorrelation & (
	| { source: "persisted"; serverMessageId: string; localId?: string }
	| { source: "optimistic" | "generation-overlay"; localId: string }
	| { source: "feedback"; localId: string; feedbackKind: AiLocalFeedbackKind }
);

export type AiOperationInput = AiThreadBinding & (
	| { type: "ask"; requestId: string; generationId?: never }
	| { type: "confirm" | "discard"; generationId: string; requestId?: never }
);

export type AiOperationToken = Readonly<AiOperationInput & { operationId: string }>;

/** In-memory Home → Chat transfer; never persisted or reused after consumption. */
export interface AiPendingSubmission {
	id: string;
	instruction: string;
	binding: AiThreadBinding;
	selectionRevision: number;
	inputRevision: number;
}

export interface UnifiedAskInput {
	instruction: string;
	selectedText?: string | null;
	selectedPageId?: string | null;
}

export interface QuickActionItem {
	id: string;
	label: string;
	prompt: string;

	iconName:
		| "file-text"
		| "wand"
		| "align-left"
		| "minimize"
		| "maximize"
		| "languages"
		| "list-plus";
}
