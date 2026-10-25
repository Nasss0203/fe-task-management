import type {
  AiAskGeneration, AiAskResponse, AiModificationPlanPreview,
  GeneratePagePlanFromInstructionResponse,
} from "@/entities/ai-assistant/model/ai-assistant.types";

export const requestId = "11111111-1111-4111-8111-111111111111";
export const workspaceId = "22222222-2222-4222-8222-222222222222";
export const pageId = "33333333-3333-4333-8333-333333333333";
export const conversationId = "44444444-4444-4444-8444-444444444444";
export const generationId = "55555555-5555-4555-8555-555555555555";
const base = { requestId, assistantMessage: "Review the result." };
const intent = {
  intent: "MODIFY_PAGE", referenceType: "TITLE", pageReference: "QA",
  instruction: "Add a QA heading", needsClarification: false,
} as const;
const page = { pageId, workspaceId, title: "QA", parentPageId: null, teamspaceId: null };

export const writingGeneration: AiAskGeneration = {
  id: generationId, conversation_id: conversationId, workspace_id: workspaceId,
  capability: "writing.improve", status: "COMPLETED", output_data: { text: "Improved text" },
  provider: null, model: null, error_code: null, error_message: null,
  applied_at: null, created_at: "2026-10-21T00:00:00Z", updated_at: "2026-10-21T00:00:00Z",
};
const readyPlanning = {
  status: "PLAN_GENERATED", intent, page, resolutionMethod: "EXACT_TITLE",
  plan: {
    generationId, conversationId, schemaVersion: 1, type: "AI_MODIFICATION_PLAN",
    pageId, status: "PLAN_READY", summary: "Add QA",
    operations: [{ type: "INSERT_BLOCKS", parentBlockId: null, afterBlockId: null,
      blocks: [{ type: "HEADER", content: { text: "QA" } }] }],
  },
} satisfies GeneratePagePlanFromInstructionResponse;
const contextPlanning = {
  ...readyPlanning, status: "PLAN_NEEDS_MORE_CONTEXT",
  plan: {
    ...readyPlanning.plan, status: "NEED_MORE_CONTEXT", operations: [],
    contextRequests: [{ reason: "AMBIGUOUS_TARGET", description: "Which block?", question: "Choose a block." }],
  },
} satisfies GeneratePagePlanFromInstructionResponse;
const preview: AiModificationPlanPreview = {
  type: "AI_MODIFICATION_PLAN", pageId, status: "PLAN_READY", summary: "Add QA",
  counts: { operations: 1, blocks: 1, databaseRows: 0 }, operations: readyPlanning.plan.operations,
};

export const askResponses = {
  writing: { ...base, status: "GENERATION_CREATED", intent: "WRITING", capability: "writing.improve",
    conversationId, generationId, generation: writingGeneration },
  composition: { ...base, status: "GENERATION_CREATED", intent: "CREATE_PAGE", capability: "GENERATE_PAGE_COMPOSITION",
    conversationId, generationId, generation: { ...writingGeneration, capability: "GENERATE_PAGE_COMPOSITION",
      output_data: { schemaVersion: 1, type: "PAGE_COMPOSITION", page: { title: "QA" }, blocks: [], databases: [] },
      preview: { type: "PAGE_COMPOSITION", page: { title: "QA", icon: null, cover_url: null },
        summary: { blocks: 0, databases: 0, database_rows: 0 } } } },
  plan: { ...base, status: "PLAN_GENERATED", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    generationId, conversationId, preview, planning: readyPlanning },
  context: { ...base, status: "PLAN_NEEDS_MORE_CONTEXT", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    generationId, conversationId, planning: contextPlanning,
    preview: { ...preview, status: "NEED_MORE_CONTEXT", operations: [],
      counts: { operations: 0, blocks: 0, databaseRows: 0 }, contextRequests: contextPlanning.plan.contextRequests } },
  clarification: { ...base, status: "NEEDS_CLARIFICATION", intent: "UNCLEAR", capability: null, reason: "UNCLEAR_INTENT" },
  pageClarification: { ...base, status: "NEEDS_CLARIFICATION", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "NEEDS_CLARIFICATION", intent, reason: "MISSING_CURRENT_PAGE" } },
  ambiguous: { ...base, status: "AMBIGUOUS_PAGE", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "AMBIGUOUS_PAGE", intent, candidates: [page] } },
  missing: { ...base, status: "PAGE_NOT_FOUND", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "PAGE_NOT_FOUND", intent } },
  unsupported: { ...base, status: "UNSUPPORTED_REQUEST", intent: "OTHER", capability: null, reason: "M0_CAPABILITY_UNAVAILABLE" },
  operation: { ...base, status: "UNSUPPORTED_OPERATION", intent: "MODIFY_PAGE", capability: null, reason: "INSERT_ONLY" },
  planningOperation: { ...base, status: "UNSUPPORTED_OPERATION", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "UNSUPPORTED_OPERATION", intent, reason: "INSERT_ONLY" } },
  notModification: { ...base, status: "NOT_A_PAGE_MODIFICATION", intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "NOT_A_PAGE_MODIFICATION", intent: { ...intent, intent: "OTHER" } } },
} satisfies Record<string, AiAskResponse>;

// M1b: the AI service could not tell where the Page name ends; NestJS found a
// real Page title in the sentence and needs the user to pick it.
const unresolvedIntent = { ...intent, referenceType: "UNRESOLVED", pageReference: null, needsClarification: true } as const;
export const sentenceResponses = {
  ambiguous: { ...base, assistantMessage: 'Ý bạn là trang "QA"? Chọn trang để tiếp tục:', status: "AMBIGUOUS_PAGE",
    intent: "MODIFY_PAGE", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    planning: { status: "AMBIGUOUS_PAGE", intent: unresolvedIntent, candidates: [page], resolutionMethod: "TITLE_IN_SENTENCE" } },
  plan: { ...askResponses.plan,
    planning: { ...readyPlanning, intent: unresolvedIntent, resolutionMethod: "TITLE_IN_SENTENCE" } },
} satisfies Record<string, AiAskResponse>;
