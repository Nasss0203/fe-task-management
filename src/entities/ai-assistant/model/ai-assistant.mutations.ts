"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { databaseKeys } from "@/entities/database/model/database.queries";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { pageKeys } from "@/entities/page/model/page.queries";

import {
	confirmAiModificationPlan,
	confirmPageComposition,
	createAiConversation,
	discardAiGeneration,
	generateAiModificationPlan,
	generatePagePlanFromInstruction,
	submitAiMessage,
} from "../api/ai-assistant.api";

import type {
	ConfirmPageCompositionRequest,
	CreateAiConversationRequest,
	GenerateAiModificationPlanRequest,
	GeneratePagePlanFromInstructionRequest,
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

interface GenerateAiModificationPlanMutationInput {
	pageId: string;
	input: GenerateAiModificationPlanRequest;
}

export function useGenerateAiModificationPlan() {
	return useMutation({
		mutationFn: ({
			pageId,
			input,
		}: GenerateAiModificationPlanMutationInput) =>
			generateAiModificationPlan(pageId, input),
	});
}

export function useGeneratePagePlanFromInstruction() {
	return useMutation({
		mutationFn: (input: GeneratePagePlanFromInstructionRequest) =>
			generatePagePlanFromInstruction(input),
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

interface ConfirmAiModificationPlanMutationInput {
	generationId: string;
	pageId: string;
}

export function useConfirmAiModificationPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			generationId,
		}: ConfirmAiModificationPlanMutationInput) =>
			confirmAiModificationPlan(generationId),

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
		mutationFn: (generationId: string) => discardAiGeneration(generationId),
	});
}
