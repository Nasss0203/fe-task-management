import apiClient from "@/shared/api/api-client";

import type {
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

// Default timeout for AI runtime requests: 90 seconds.
const AI_RUNTIME_TIMEOUT = 90_000;

// Modification Planner may require multiple LLM generation stages.
// Allow up to 180 seconds for local Qwen3 4B inference.
const AI_MODIFICATION_PLAN_TIMEOUT = 180_000;

export async function createAiConversation(
	input: CreateAiConversationRequest,
): Promise<AiConversation> {
	const response = await apiClient.post<AiApiResponse<AiConversation>>(
		"/ai-assistant/conversations",
		input,
	);

	return response.data.data;
}

export async function listAiConversations(
	filters: AiConversationsFilter,
	cursor?: string,
	signal?: AbortSignal,
): Promise<AiHistoryPage<AiConversation>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiConversation>>>(
		"/ai-assistant/conversations",
		{ params: { ...filters, cursor, limit: 30 }, signal },
	);
	return response.data.data;
}

export async function listAiConversationMessages(
	conversationId: string,
	cursor?: string,
	signal?: AbortSignal,
): Promise<AiHistoryPage<AiHistoryMessage>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiHistoryMessage>>>(
		`/ai-assistant/conversations/${conversationId}/messages`,
		{ params: { cursor, limit: 100 }, signal },
	);
	return response.data.data;
}

export async function listAiConversationGenerations(
	conversationId: string,
	cursor?: string,
	signal?: AbortSignal,
): Promise<AiHistoryPage<AiGeneration>> {
	const response = await apiClient.get<AiApiResponse<AiHistoryPage<AiGeneration>>>(
		`/ai-assistant/conversations/${conversationId}/generations`,
		{ params: { cursor, limit: 100 }, signal },
	);
	return response.data.data;
}

export async function submitAiMessage(
	conversationId: string,
	input: SubmitAiMessageRequest,
): Promise<AiGeneration> {
	const response = await apiClient.post<AiApiResponse<AiGeneration>>(
		`/ai-assistant/conversations/${conversationId}/messages`,
		input,
		{
			timeout: AI_RUNTIME_TIMEOUT,
		},
	);

	return response.data.data;
}

export async function generateAiModificationPlan(
	pageId: string,
	input: GenerateAiModificationPlanRequest,
): Promise<GenerateAiModificationPlanResponse> {
	const response = await apiClient.post<
		AiApiResponse<GenerateAiModificationPlanResponse>
	>(`/ai-assistant/pages/${pageId}/modification-plan`, input, {
		timeout: AI_MODIFICATION_PLAN_TIMEOUT,
	});

	return response.data.data;
}

/** Natural-language Page selection and Preview. Does not Confirm/Execute. */
export async function generatePagePlanFromInstruction(
	input: GeneratePagePlanFromInstructionRequest,
): Promise<GeneratePagePlanFromInstructionResponse> {
	const response = await apiClient.post<
		AiApiResponse<GeneratePagePlanFromInstructionResponse>
	>("/ai-assistant/pages/modification-plan/from-instruction", input, {
		timeout: AI_MODIFICATION_PLAN_TIMEOUT,
	});
	return response.data.data;
}

export async function getAiGeneration(
	generationId: string,
	signal?: AbortSignal,
): Promise<AiGeneration> {
	const response = await apiClient.get<AiApiResponse<AiGeneration>>(
		`/ai-assistant/generations/${generationId}`,
		{
			signal,
		},
	);

	return response.data.data;
}

export async function confirmPageComposition(
	generationId: string,
	input: ConfirmPageCompositionRequest = {},
): Promise<ConfirmPageCompositionResponse> {
	const response = await apiClient.post<
		AiApiResponse<ConfirmPageCompositionResponse>
	>(`/ai-assistant/generations/${generationId}/confirm`, input, {
		timeout: AI_RUNTIME_TIMEOUT,
	});

	return response.data.data;
}

export async function confirmAiModificationPlan(
	generationId: string,
): Promise<ConfirmAiModificationPlanResponse> {
	const response = await apiClient.post<
		AiApiResponse<ConfirmAiModificationPlanResponse>
	>(
		`/ai-assistant/generations/${generationId}/confirm`,
		{},
		{
			timeout: AI_RUNTIME_TIMEOUT,
		},
	);

	return response.data.data;
}

export async function discardAiGeneration(
	generationId: string,
): Promise<AiGeneration> {
	const response = await apiClient.post<AiApiResponse<AiGeneration>>(
		`/ai-assistant/generations/${generationId}/discard`,
	);

	return response.data.data;
}
