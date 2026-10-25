"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { databaseKeys } from "@/entities/database/model/database.queries";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { pageKeys } from "@/entities/page/model/page.queries";

import {
	askAi,
	confirmAiModificationPlan,
	confirmPageComposition,
	createAiConversation,
	discardAiGeneration,
	generateAiModificationPlan,
	generatePagePlanFromInstruction,
	submitAiMessage,
} from "../api/ai-assistant.api";

import type {
	AskAiRequest,
	ConfirmPageCompositionRequest,
	CreateAiConversationRequest,
	GenerateAiModificationPlanRequest,
	GeneratePagePlanFromInstructionRequest,
	SubmitAiMessageRequest,
} from "./ai-assistant.types";

export function useCreateAiConversation() {
	return useMutation({
		retry: false,
		mutationFn: ({ shareToken, ...input }: CreateAiConversationRequest & { shareToken?: string }) =>
			createAiConversation(input, ...(shareToken ? [shareToken] as const : [] as const)),
	});
}

interface SubmitAiMessageMutationInput {
	shareToken?: string;
	conversationId: string;
	input: SubmitAiMessageRequest;
}

export function useSubmitAiMessage() {
	return useMutation({
		retry: false,
		mutationFn: ({ conversationId, input, shareToken }: SubmitAiMessageMutationInput) =>
			submitAiMessage(conversationId, input, ...(shareToken ? [shareToken] as const : [] as const)),
	});
}

interface GenerateAiModificationPlanMutationInput {
	shareToken?: string;
	pageId: string;
	input: GenerateAiModificationPlanRequest;
}

export function useGenerateAiModificationPlan() {
	return useMutation({
		retry: false,
		mutationFn: ({
			pageId,
			input,
			shareToken,
		}: GenerateAiModificationPlanMutationInput) =>
			generateAiModificationPlan(pageId, input, ...(shareToken ? [shareToken] as const : [] as const)),
	});
}

export function useGeneratePagePlanFromInstruction() {
	return useMutation({
		retry: false,
		mutationFn: ({ shareToken, ...input }: GeneratePagePlanFromInstructionRequest & { shareToken?: string }) =>
			generatePagePlanFromInstruction(input, ...(shareToken ? [shareToken] as const : [] as const)),
	});
}

interface ConfirmPageCompositionMutationInput {
	shareToken?: string;
	generationId: string;
	input?: ConfirmPageCompositionRequest;
}

export function useConfirmPageComposition() {
	const queryClient = useQueryClient();

	return useMutation({
		retry: false,
		mutationFn: ({
			generationId,
			input = {},
			shareToken,
		}: ConfirmPageCompositionMutationInput) =>
			confirmPageComposition(generationId, input, ...(shareToken ? [shareToken] as const : [] as const)),

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

interface ConfirmAiModificationPlanMutationInput {
	shareToken?: string;
	generationId: string;
	pageId: string;
}

export function useConfirmAiModificationPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		retry: false,
		mutationFn: ({
			generationId,
			shareToken,
		}: ConfirmAiModificationPlanMutationInput) =>
			confirmAiModificationPlan(generationId, ...(shareToken ? [shareToken] as const : [] as const)),

		onSuccess: async (result, variables) => {
			const plan: unknown = result.generation.output_data;

			const databaseIds = new Set<string>();

			// Find databases modified by CREATE_DATABASE_ROWS.
			if (
				typeof plan === "object" &&
				plan !== null &&
				"type" in plan &&
				plan.type === "AI_MODIFICATION_PLAN" &&
				"operations" in plan &&
				Array.isArray(plan.operations)
			) {
				for (const operation of plan.operations) {
					if (
						typeof operation === "object" &&
						operation !== null &&
						"type" in operation &&
						operation.type === "CREATE_DATABASE_ROWS" &&
						"databaseId" in operation &&
						typeof operation.databaseId === "string" &&
						operation.databaseId.length > 0
					) {
						databaseIds.add(operation.databaseId);
					}
				}
			}

			// Prefer the page ID returned by the backend.
			const targetPageId =
				typeof plan === "object" &&
				plan !== null &&
				"type" in plan &&
				plan.type === "AI_MODIFICATION_PLAN" &&
				"pageId" in plan &&
				typeof plan.pageId === "string" &&
				plan.pageId.length > 0
					? plan.pageId
					: variables.pageId;

			// Invalidate Page, Page Blocks and affected Database Rows.
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.detail(targetPageId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageBlockKeys.byPage(targetPageId),
				}),

				...Array.from(databaseIds, (databaseId) =>
					queryClient.invalidateQueries({
						queryKey: databaseKeys.rows(databaseId),
					}),
				),
			]);
		},
	});
}

export function useDiscardAiGeneration() {
	return useMutation({
		retry: false,
		mutationFn: (variables: string | { generationId: string; shareToken?: string }) =>
			typeof variables === "string" ? discardAiGeneration(variables) :
				discardAiGeneration(variables.generationId, ...(variables.shareToken ? [variables.shareToken] as const : [] as const)),
	});
}

/** Ask only prepares a response/draft; history synchronization belongs to the caller. */
export function useAskAi() {
  return useMutation({
		retry: false,
    mutationFn: ({ shareToken, ...input }: AskAiRequest & { shareToken?: string }) =>
			askAi(input, ...(shareToken ? [shareToken] as const : [] as const)),
  });
}
