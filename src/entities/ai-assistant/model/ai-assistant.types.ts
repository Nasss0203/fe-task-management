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

/** Kế hoạch tích to-do: only the checkbox of an existing to-do changes. */
export interface AiSetTodoCheckedOperation {
  type: "SET_TODO_CHECKED";

  blockId: string;

  /** The to-do's current text, shown in the draft; the server checks it. */
  text: string;

  checked: boolean;
}

/** Kế hoạch sửa chữ block: only the text of an existing block changes. */
export interface AiSetBlockTextOperation {
  type: "SET_BLOCK_TEXT";

  blockId: string;

  /** The block's current text; the server checks it. */
  oldText: string;

  newText: string;
}

/** Kế hoạch xoá block: soft-deletes a block and everything nested in it. */
export interface AiDeleteBlockOperation {
  type: "DELETE_BLOCK";

  blockId: string;

  /** The block's current text; the server checks it. */
  text: string;

  /** Blocks nested in it, deleted with it; the server checks it. */
  childCount: number;
}

export type AiModificationOperation =
  | AiInsertBlocksOperation
  | AiCreateDatabaseRowsOperation
  | AiSetTodoCheckedOperation
  | AiSetBlockTextOperation
  | AiDeleteBlockOperation;

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

/** M2: the Page was named by the user's own edits ("trang tôi sửa hôm qua"). */
export interface AiPageActivity {
  relative: "LATEST" | "TODAY" | "YESTERDAY" | "N_DAYS_AGO" | "LAST_WEEK" | "RECENT";
  days: number | null;
  titleHint: string | null;
}

export interface AiPageIntent {
  intent: "MODIFY_PAGE" | "OTHER" | "UNCLEAR";
  referenceType: "TITLE" | "CURRENT_PAGE" | "UNRESOLVED" | "ACTIVITY" | "DESCRIPTION";
  pageReference: string | null;
  instruction: string | null;
  needsClarification: boolean;
  /** Only with referenceType ACTIVITY. */
  activity?: AiPageActivity;
  /** M4: where a TITLE Page is, an ancestor Page's title or a teamspace. */
  scope?: { parentTitle: string | null; teamspaceName: string | null };
  /** M6: only with referenceType DESCRIPTION, what the Page is for in the user's words. */
  description?: string;
}

export interface GeneratePagePlanFromInstructionRequest {
  workspaceId: string;
  instruction: string;
  currentPageId?: string;
  selectedPageId?: string;
  requestId?: string;
  conversationId?: string;
}

/**
 * M1b: TITLE_IN_SENTENCE is a real Page found in the sentence; M2: ACTIVITY is a
 * Page the user edited; M3: FUZZY_TITLE is a title close to a misspelled name;
 * M6: SEMANTIC is a Page close to a description. All four are planned only
 * after the user picked the Page.
 */
export type AiPageResolutionMethod =
  | "CURRENT_CONTEXT" | "EXACT_TITLE" | "TITLE_IN_SENTENCE" | "ACTIVITY" | "FUZZY_TITLE" | "SEMANTIC";

export type GeneratePagePlanFromInstructionResponse =
  | {
      status: "UNSUPPORTED_OPERATION";
      intent: AiPageIntent;
      reason: "INSERT_ONLY";
    }
  | { status: "NOT_A_PAGE_MODIFICATION"; intent: AiPageIntent }
  | {
      status: "NEEDS_CLARIFICATION";
      // MISSING_CHECKLIST_ITEMS (gp02): "thêm checklist" with neither items nor a topic.
      reason: "UNCLEAR_INTENT" | "UNRESOLVED_PAGE" | "MISSING_CURRENT_PAGE" | "MISSING_CHECKLIST_ITEMS";
      intent: AiPageIntent;
    }
  | { status: "PAGE_NOT_FOUND"; intent: AiPageIntent }
  | {
      status: "AMBIGUOUS_PAGE";
      intent: AiPageIntent;
      candidates: AiPageResolutionCandidate[];
      /**
       * Found in the sentence (M1b), among the user's own edits (M2), close to a
       * misspelled name (M3), or close to a description (M6).
       */
      resolutionMethod?: "TITLE_IN_SENTENCE" | "ACTIVITY" | "FUZZY_TITLE" | "SEMANTIC";
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
    /** SET_TODO_CHECKED operations. */
    todoUpdates?: number;
    /** SET_BLOCK_TEXT operations. */
    blockEdits?: number;
    /** DELETE_BLOCK operations. */
    blockDeletes?: number;
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
  updatedBlockIds?: string[];
  deletedBlockIds?: string[];
}

export interface UndoAiModificationPlanResponse {
  restoredBlockIds: string[];
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
  /** M2: the browser's IANA zone, so "hôm qua" is the user's yesterday. */
  timeZone?: string | null;
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
