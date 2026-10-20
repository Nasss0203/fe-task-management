import type { PageCompositionDraft } from "./page-composition.types";

export type AiWritingCapability =
  | "writing.improve"
  | "writing.translate"
  | "writing.shorten"
  | "writing.expand"
  | "writing.summarize"
  | "writing.continue";

export type AiCapability =
  | AiWritingCapability
  | "GENERATE_PAGE_COMPOSITION"
  | "GENERATE_PAGE_MODIFICATION_PLAN";

export type AiGenerationStatus =
  "PROCESSING" | "COMPLETED" | "APPLIED" | "DISCARDED" | "FAILED";

export interface CreateAiConversationRequest {
  workspaceId?: string | null;
  title?: string | null;
  scope?: "GLOBAL" | "PAGE";
  pageId?: string | null;
}

export interface AiConversation {
  id: string;
  workspace_id: string | null;
  scope: "GLOBAL" | "PAGE" | "LEGACY";
  page_id: string | null;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AiHistoryPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AiHistoryMessage {
  id: string;
  conversation_id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AiConversationsFilter {
  workspaceId: string;
  scope: "GLOBAL" | "PAGE";
  pageId?: string;
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

export type AiModificationPlanStatus = "PLAN_READY" | "NEED_MORE_CONTEXT";

export type AiModificationContextRequestReason =
  | "ROWS_TRUNCATED"
  | "TEXT_TRUNCATED"
  | "AMBIGUOUS_TARGET"
  | "MISSING_RESOURCE_CONTEXT";

export interface AiModificationContextRequest {
  reason: AiModificationContextRequestReason;
  description: string;

  databaseId?: string;
  blockId?: string;
  question?: string;
}

export interface AiModificationBlockInput {
  type: "TEXT" | "HEADER" | "QUOTE" | "TODO" | "TOGGLE";
  content: Record<string, unknown>;
}

export interface AiInsertBlocksOperation {
  type: "INSERT_BLOCKS";

  parentBlockId: string | null;
  afterBlockId: string | null;

  blocks: AiModificationBlockInput[];
}

export interface AiCreateDatabaseRowsOperation {
  type: "CREATE_DATABASE_ROWS";

  databaseId: string;

  rows: Array<{
    values: Record<string, unknown>;
  }>;
}

export type AiModificationOperation =
  AiInsertBlocksOperation | AiCreateDatabaseRowsOperation;

interface AiModificationPlanBase {
  schemaVersion: 1;
  type: "AI_MODIFICATION_PLAN";

  pageId: string;

  summary: string;
}

export interface AiModificationPlanReady extends AiModificationPlanBase {
  status: "PLAN_READY";

  operations: AiModificationOperation[];
}

export interface AiModificationPlanNeedMoreContext extends AiModificationPlanBase {
  status: "NEED_MORE_CONTEXT";

  operations: [];

  contextRequests: AiModificationContextRequest[];
}

export type AiModificationPlan =
  AiModificationPlanReady | AiModificationPlanNeedMoreContext;

export interface GenerateAiModificationPlanRequest {
  instruction: string;
  requestId?: string;
  conversationId?: string;
}

export type GenerateAiModificationPlanResponse = AiModificationPlan & {
  generationId: string;
  conversationId: string;
};

export interface AiPageResolutionCandidate {
  pageId: string;
  workspaceId: string;
  title: string;
  parentPageId: string | null;
  teamspaceId: string | null;
}

export interface AiPageIntent {
  intent: "MODIFY_PAGE" | "OTHER" | "UNCLEAR";
  referenceType: "TITLE" | "CURRENT_PAGE" | "UNRESOLVED";
  pageReference: string | null;
  instruction: string | null;
  needsClarification: boolean;
}

export interface GeneratePagePlanFromInstructionRequest {
  workspaceId: string;
  instruction: string;
  currentPageId?: string;
  selectedPageId?: string;
  requestId?: string;
  conversationId?: string;
}

export type GeneratePagePlanFromInstructionResponse =
  | { status: "NOT_A_PAGE_MODIFICATION"; intent: AiPageIntent }
  | {
      status: "NEEDS_CLARIFICATION";
      reason: "UNCLEAR_INTENT" | "UNRESOLVED_PAGE" | "MISSING_CURRENT_PAGE";
      intent: AiPageIntent;
    }
  | { status: "PAGE_NOT_FOUND"; intent: AiPageIntent }
  | {
      status: "AMBIGUOUS_PAGE";
      intent: AiPageIntent;
      candidates: AiPageResolutionCandidate[];
    }
  | {
      status: "PLAN_GENERATED" | "PLAN_NEEDS_MORE_CONTEXT";
      intent: AiPageIntent;
      page: AiPageResolutionCandidate;
      resolutionMethod: "CURRENT_CONTEXT" | "EXACT_TITLE";
      plan: GenerateAiModificationPlanResponse;
    };

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

export interface AiModificationPlanPreview {
  type: "AI_MODIFICATION_PLAN";

  pageId: string;

  status: AiModificationPlanStatus;

  summary: string;

  counts: {
    operations: number;
    blocks: number;
    databaseRows: number;
  };

  operations: AiModificationOperation[];
}

export type AiGenerationOutputData =
  | AiWritingOutput
  | PageCompositionDraft
  | AiModificationPlan
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export interface AiGeneration {
  id: string;

  conversation_id: string | null;

  workspace_id: string | null;

  capability: AiCapability;

  status: AiGenerationStatus;

  output_data: AiGenerationOutputData;

  preview?: PageCompositionPreview | AiModificationPlanPreview | null;

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

export interface AiModificationPlanExecutionResult {
  createdBlockIds: string[];
  createdRowIds: string[];
}

export interface ConfirmAiModificationPlanResponse {
  generation: AiGeneration;

  execution: AiModificationPlanExecutionResult;
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
