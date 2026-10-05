import type { PageCompositionDraft } from "./page-composition.types";

export type AiWritingCapability =
	| "writing.improve"
	| "writing.translate"
	| "writing.shorten"
	| "writing.expand"
	| "writing.summarize"
	| "writing.continue";

export type AiCapability = AiWritingCapability | "GENERATE_PAGE_COMPOSITION";

export type AiGenerationStatus =
	| "PROCESSING"
	| "COMPLETED"
	| "APPLIED"
	| "DISCARDED"
	| "FAILED";

export interface CreateAiConversationRequest {
	workspaceId?: string | null;
	title?: string | null;
}

export interface AiConversation {
	id: string;
	workspace_id: string | null;
	title: string | null;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface SubmitAiMessageRequest {
	content: string;
	capability: AiCapability;
	requestId?: string;
	input?: Record<string, unknown>;
	context?: Record<string, unknown>;
}

export interface AiWritingOutput {
	text: string;
}

export interface PageCompositionPreview {
	type: "PAGE_COMPOSITION";

	page: {
		title: string;
		icon: string | null;
		cover_url: string | null;
	};

	summary: {
		blocks: number;
		databases: number;
		database_rows: number;
	};
}

export type AiGenerationOutputData =
	| AiWritingOutput
	| PageCompositionDraft
	| Record<string, unknown>
	| unknown[]
	| string
	| number
	| boolean
	| null;

export interface AiGeneration {
	id: string;
	conversation_id: string;
	workspace_id: string | null;

	capability: AiCapability;
	status: AiGenerationStatus;

	output_data: AiGenerationOutputData;

	preview?: PageCompositionPreview | null;

	provider: string | null;
	model: string | null;

	error_code: string | null;
	error_message: string | null;

	applied_at: string | null;

	created_at: string;
	updated_at: string;
}

export interface ConfirmPageCompositionRequest {
	teamspaceId?: string | null;
	parentPageId?: string | null;
}

export interface PageCompositionExecutionResult {
	pageId: string;

	blockIds: Record<string, string>;

	databaseIds: Record<string, string>;

	propertyIds: Record<string, string>;

	optionIds: Record<string, Record<string, string>>;

	viewIds: Record<string, Record<string, string>>;

	rowIds: Record<string, Record<string, string>>;
}

export interface ConfirmPageCompositionResponse {
	generation: AiGeneration;
	execution: PageCompositionExecutionResult;
}

export interface AiUsage {
	prompt_tokens: number | null;
	completion_tokens: number | null;
	total_tokens: number | null;
}

export interface AiApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}
