"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	confirmPageComposition,
	createAiConversation,
	discardAiGeneration,
	submitAiMessage,
} from "../api/ai-assistant.api";
import { pageKeys } from "@/entities/page/model/page.queries";

import type {
	ConfirmPageCompositionRequest,
	CreateAiConversationRequest,
	SubmitAiMessageRequest,
} from "./ai-assistant.types";

export function useCreateAiConversation() {
	return useMutation({
		mutationFn: (input: CreateAiConversationRequest) =>
			createAiConversation(input),
	});
}

interface SubmitAiMessageMutationInput {
	conversationId: string;
	input: SubmitAiMessageRequest;
}

export function useSubmitAiMessage() {
	return useMutation({
		mutationFn: ({ conversationId, input }: SubmitAiMessageMutationInput) =>
			submitAiMessage(conversationId, input),
	});
}

interface ConfirmPageCompositionMutationInput {
	generationId: string;
	input?: ConfirmPageCompositionRequest;
}

export function useConfirmPageComposition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			generationId,
			input = {},
		}: ConfirmPageCompositionMutationInput) =>
			confirmPageComposition(generationId, input),

		onSuccess: async (result) => {
			const workspaceId = result.generation.workspace_id;

			if (!workspaceId) {
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: pageKeys.byWorkspace(workspaceId),
			});
		},
	});
}

export function useDiscardAiGeneration() {
	return useMutation({
		mutationFn: (generationId: string) => discardAiGeneration(generationId),
	});
}
