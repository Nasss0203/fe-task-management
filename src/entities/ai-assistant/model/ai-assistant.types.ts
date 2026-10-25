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

/** M1b: TITLE_IN_SENTENCE is a real Page found in the sentence, planned only after the user picked it. */
export type AiPageResolutionMethod = "CURRENT_CONTEXT" | "EXACT_TITLE" | "TITLE_IN_SENTENCE";

export type GeneratePagePlanFromInstructionResponse =
  | {
      status: "UNSUPPORTED_OPERATION";
      intent: AiPageIntent;
      reason: "INSERT_ONLY";
    }
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
      /** Present when the candidates were found in the sentence (M1b). */
      resolutionMethod?: "TITLE_IN_SENTENCE";
    }
  | {
      status: "PLAN_GENERATED";
      intent: AiPageIntent;
      page: AiPageResolutionCandidate;
      resolutionMethod: AiPageResolutionMethod;
      plan: Extract<GenerateAiModificationPlanResponse, { status: "PLAN_READY" }>;
    }
  | {
      status: "PLAN_NEEDS_MORE_CONTEXT";
      intent: AiPageIntent;
      page: AiPageResolutionCandidate;
      resolutionMethod: AiPageResolutionMethod;
      plan: Extract<GenerateAiModificationPlanResponse, { status: "NEED_MORE_CONTEXT" }>;
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
  contextRequests?: AiModificationContextRequest[];
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

/** Public NestJS Ask body. Authentication is supplied by the shared API client. */
export interface AskAiRequest {
  workspaceId: string;
  instruction: string;
  selectedText?: string | null;
  currentPageId?: string | null;
  selectedPageId?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
}

export type AiAskIntent =
  | "CREATE_PAGE"
  | "MODIFY_PAGE"
  | "WRITING"
  | "OTHER"
  | "UNCLEAR";

/** Wire capability is open-ended; consumers must validate before using legacy UI. */
export type AiAskGeneration = Omit<AiGeneration, "capability"> & {
  capability: string;
};

interface AiAskResponseBase {
  requestId: string;
  intent: AiAskIntent;
  assistantMessage: string;
}

/** Chat nhiều lượt: the sent conversation did not fit, so the server opened a new one. */
interface AiAskConversationSwitch {
  conversationSwitched?: boolean;
}

type AiAskPlanningResponse = {
  [Status in GeneratePagePlanFromInstructionResponse["status"]]: {
    status: Status;
    capability: "GENERATE_PAGE_MODIFICATION_PLAN";
    planning: Extract<GeneratePagePlanFromInstructionResponse, { status: Status }>;
  } & (Status extends "PLAN_GENERATED" | "PLAN_NEEDS_MORE_CONTEXT"
    ? {
        generationId: string;
        conversationId: string;
        preview: AiModificationPlanPreview;
      } & AiAskConversationSwitch
    : object);
}[GeneratePagePlanFromInstructionResponse["status"]];

/** Narrow overlapping statuses with capability or the presence of planning. */
export type AiAskResponse = AiAskResponseBase & (
  | {
      status: "NEEDS_CLARIFICATION" | "UNSUPPORTED_REQUEST" | "UNSUPPORTED_OPERATION";
      capability: null;
      reason: string;
    }
  | ({
      status: "GENERATION_CREATED";
      capability: string;
      generationId: string;
      conversationId: string;
      generation: AiAskGeneration;
    } & AiAskConversationSwitch)
  | AiAskPlanningResponse
);
