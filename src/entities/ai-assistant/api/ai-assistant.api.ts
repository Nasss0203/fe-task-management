import apiClient from "@/shared/api/api-client";

import type {
	AskAiRequest,
	AiAskResponse,
	AiApiResponse,
	AiConversation,
	AiConversationsFilter,
	AiGeneration,
	AiHistoryMessage,
	AiHistoryPage,
	ConfirmAiModificationPlanResponse,
	ConfirmPageCompositionRequest,
	ConfirmPageCompositionResponse,
	CreateAiConversationRequest,
	GenerateAiModificationPlanRequest,
	GenerateAiModificationPlanResponse,
	GeneratePagePlanFromInstructionRequest,
	GeneratePagePlanFromInstructionResponse,
	SubmitAiMessageRequest,
} from "../model/ai-assistant.types";

// Backend AI contracts accept this credential only as a query parameter.
function shareQuery(shareToken?: string) {
	return shareToken ? { params: { shareToken } } : {};
}

// Default timeout for AI runtime requests: 90 seconds.
const AI_RUNTIME_TIMEOUT = 90_000;

// Modification Planner may require multiple LLM generation stages.
// Allow up to 180 seconds for local Qwen3 4B inference.
const AI_MODIFICATION_PLAN_TIMEOUT = 180_000;

export async function createAiConversation(
	input: CreateAiConversationRequest,
	shareToken?: string,
): Promise<AiConversation> {
	const response = await apiClient.post<AiApiResponse<AiConversation>>(
		"/ai-assistant/conversations",
		input,
		...(shareToken ? [shareQuery(shareToken)] as const : [] as const),
	);

	return response.data.data;
}

export async function getAiConversation(
	conversationId: string,
	signal?: AbortSignal,
	shareToken?: string,
): Promise<AiConversation> {
	const response = await apiClient.get<AiApiResponse<AiConversation>>(
		`/ai-assistant/conversations/${conversationId}`,
		{ signal, ...shareQuery(shareToken) },
	);
	return response.data.data;
}

export async function listAiConversations(
	filters: AiConversationsFilter,
	cursor?: string,
	signal?: AbortSignal,
	shareToken?: string,
): Promise<AiHistoryPage<AiConversation>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiConversation>>>(
		"/ai-assistant/conversations",
		{ params: { ...filters, cursor, limit: 30, ...(shareToken ? { shareToken } : {}) }, signal },
	);
	return response.data.data;
}

export async function listAiConversationMessages(
	conversationId: string,
	cursor?: string,
	signal?: AbortSignal,
	shareToken?: string,
): Promise<AiHistoryPage<AiHistoryMessage>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiHistoryMessage>>>(
		`/ai-assistant/conversations/${conversationId}/messages`,
		{ params: { cursor, limit: 100, ...(shareToken ? { shareToken } : {}) }, signal },
	);
	return response.data.data;
}

export async function listAiConversationGenerations(
	conversationId: string,
	cursor?: string,
	signal?: AbortSignal,
	shareToken?: string,
): Promise<AiHistoryPage<AiGeneration>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiGeneration>>>(
		`/ai-assistant/conversations/${conversationId}/generations`,
		{ params: { cursor, limit: 100, ...(shareToken ? { shareToken } : {}) }, signal },
	);
	return response.data.data;
}

export async function submitAiMessage(
	conversationId: string,
	input: SubmitAiMessageRequest,
	shareToken?: string,
): Promise<AiGeneration> {
	const response = await apiClient.post<AiApiResponse<AiGeneration>>(
		`/ai-assistant/conversations/${conversationId}/messages`,
		input,
		{
			timeout: AI_RUNTIME_TIMEOUT,
			...shareQuery(shareToken),
		},
	);

	return response.data.data;
}

export async function generateAiModificationPlan(
	pageId: string,
	input: GenerateAiModificationPlanRequest,
	shareToken?: string,
): Promise<GenerateAiModificationPlanResponse> {
	const response = await apiClient.post<
		AiApiResponse<GenerateAiModificationPlanResponse>
	>(`/ai-assistant/pages/${pageId}/modification-plan`, input, {
		timeout: AI_MODIFICATION_PLAN_TIMEOUT,
		...shareQuery(shareToken),
	});

	return response.data.data;
}

/** Natural-language Page selection and Preview. Does not Confirm/Execute. */
export async function generatePagePlanFromInstruction(
	input: GeneratePagePlanFromInstructionRequest,
	shareToken?: string,
): Promise<GeneratePagePlanFromInstructionResponse> {
	const response = await apiClient.post<
		AiApiResponse<GeneratePagePlanFromInstructionResponse>
	>("/ai-assistant/pages/modification-plan/from-instruction", input, {
		timeout: AI_MODIFICATION_PLAN_TIMEOUT,
		...shareQuery(shareToken),
	});
	return response.data.data;
}

export async function getAiGeneration(
	generationId: string,
	signal?: AbortSignal,
	shareToken?: string,
): Promise<AiGeneration> {
	const response = await apiClient.get<AiApiResponse<AiGeneration>>(
		`/ai-assistant/generations/${generationId}`,
		{
			signal,
			...shareQuery(shareToken),
		},
	);

	return response.data.data;
}

export async function confirmPageComposition(
	generationId: string,
	input: ConfirmPageCompositionRequest = {},
	shareToken?: string,
): Promise<ConfirmPageCompositionResponse> {
	const response = await apiClient.post<
		AiApiResponse<ConfirmPageCompositionResponse>
	>(`/ai-assistant/generations/${generationId}/confirm`, input, {
		timeout: AI_RUNTIME_TIMEOUT,
		...shareQuery(shareToken),
	});

	return response.data.data;
}

export async function confirmAiModificationPlan(
	generationId: string,
	shareToken?: string,
): Promise<ConfirmAiModificationPlanResponse> {
	const response = await apiClient.post<
		AiApiResponse<ConfirmAiModificationPlanResponse>
	>(
		`/ai-assistant/generations/${generationId}/confirm`,
		{},
		{
			timeout: AI_RUNTIME_TIMEOUT,
			...shareQuery(shareToken),
		},
	);

	return response.data.data;
}

export async function discardAiGeneration(
	generationId: string,
	shareToken?: string,
): Promise<AiGeneration> {
	const response = await apiClient.post<AiApiResponse<AiGeneration>>(
		`/ai-assistant/generations/${generationId}/discard`,
		...(shareToken ? [undefined, shareQuery(shareToken)] as const : [] as const),
	);

	return response.data.data;
}

// Initial budget for intent classification followed by generation/planning.
// A timeout does not mean the server stopped; requestId is not an idempotency key.
const AI_ASK_TIMEOUT = 180_000;

export async function askAi(input: AskAiRequest, shareToken?: string): Promise<AiAskResponse> {
  const response = await apiClient.post<AiApiResponse<AiAskResponse>>(
    "/ai-assistant/ask",
    input,
    { timeout: AI_ASK_TIMEOUT, ...shareQuery(shareToken) },
  );
  return response.data.data;
}
