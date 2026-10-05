import apiClient from "@/shared/api/api-client";

import type {
	AiApiResponse,
	AiConversation,
	AiGeneration,
	ConfirmPageCompositionRequest,
	ConfirmPageCompositionResponse,
	CreateAiConversationRequest,
	SubmitAiMessageRequest,
} from "../model/ai-assistant.types";

const AI_RUNTIME_TIMEOUT = 90_000;

export async function createAiConversation(
	input: CreateAiConversationRequest,
): Promise<AiConversation> {
	const response = await apiClient.post<AiApiResponse<AiConversation>>(
		"/ai-assistant/conversations",
		input,
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

export async function discardAiGeneration(
	generationId: string,
): Promise<AiGeneration> {
	const response = await apiClient.post<AiApiResponse<AiGeneration>>(
		`/ai-assistant/generations/${generationId}/discard`,
	);

	return response.data.data;
}
