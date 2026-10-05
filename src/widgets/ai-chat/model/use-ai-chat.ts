"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
	useConfirmPageComposition,
	useCreateAiConversation,
	useDiscardAiGeneration,
	useSubmitAiMessage,
} from "@/entities/ai-assistant/model/ai-assistant.mutations";
import type {
	AiGeneration,
	ConfirmPageCompositionRequest,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";

import type { AiChatMessage } from "./types";
import { useAiChatStore } from "./use-ai-chat-store";

function getWritingText(generation: AiGeneration): string | null {
	const output = generation.output_data;

	if (!output || typeof output !== "object" || Array.isArray(output)) {
		return null;
	}

	const text = (output as Record<string, unknown>).text;

	return typeof text === "string" ? text : null;
}

export function useAiChat() {
	const router = useRouter();

	const { user } = useUser();
	const { data: workspaces = [] } = useWorkspaces();

	const {
		input,
		mode,
		conversationId,
		conversationWorkspaceId,
		addMessage,
		setInput,
		setConversation,
		setMessages,
		newChat,
	} = useAiChatStore();

	const createConversationMutation = useCreateAiConversation();

	const submitMessageMutation = useSubmitAiMessage();

	const confirmMutation = useConfirmPageComposition();

	const discardMutation = useDiscardAiGeneration();

	const currentWorkspaceId = useMemo(() => {
		const lastActiveWorkspaceId = user?.lastActiveWorkspaceId;

		if (
			lastActiveWorkspaceId &&
			workspaces.some(
				(workspace) => workspace.id === lastActiveWorkspaceId,
			)
		) {
			return lastActiveWorkspaceId;
		}

		return workspaces[0]?.id ?? null;
	}, [user?.lastActiveWorkspaceId, workspaces]);

	useEffect(() => {
		if (
			conversationWorkspaceId &&
			currentWorkspaceId &&
			conversationWorkspaceId !== currentWorkspaceId
		) {
			newChat();
		}
	}, [conversationWorkspaceId, currentWorkspaceId, newChat]);

	const isPending =
		createConversationMutation.isPending ||
		submitMessageMutation.isPending ||
		confirmMutation.isPending ||
		discardMutation.isPending;

	const updateGenerationInMessages = (generation: AiGeneration) => {
		setMessages((messages: AiChatMessage[]) =>
			messages.map((message: AiChatMessage) =>
				message.generation?.id === generation.id
					? {
							...message,
							generation,
						}
					: message,
			),
		);
	};

	const sendMessage = async () => {
		const content = input.trim();

		if (!content || isPending) {
			return;
		}

		if (!currentWorkspaceId) {
			toast.error("No workspace available.");
			return;
		}

		const capability = mode;

		const userMessage: AiChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content,
			capability,
			createdAt: new Date().toISOString(),
		};

		addMessage(userMessage);
		setInput("");

		try {
			let activeConversationId = conversationId;

			if (
				!activeConversationId ||
				conversationWorkspaceId !== currentWorkspaceId
			) {
				const conversation =
					await createConversationMutation.mutateAsync({
						workspaceId: currentWorkspaceId,
						title: "AI Assistant",
					});

				activeConversationId = conversation.id;

				setConversation(conversation.id, currentWorkspaceId);
			}

			const generation = await submitMessageMutation.mutateAsync({
				conversationId: activeConversationId,
				input: {
					content,
					capability,
				},
			});

			if (generation.status === "FAILED") {
				throw new Error(
					generation.error_message ?? "AI generation failed.",
				);
			}

			let assistantContent: string;

			if (generation.capability === "GENERATE_PAGE_COMPOSITION") {
				assistantContent =
					"I've prepared a page draft. Review it before creating the page.";
			} else {
				const writingText = getWritingText(generation);

				if (!writingText) {
					throw new Error(
						"AI writing response did not contain text.",
					);
				}

				assistantContent = writingText;
			}

			const assistantMessage: AiChatMessage = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: assistantContent,
				capability: generation.capability,
				generation,
				createdAt: generation.created_at,
			};

			addMessage(assistantMessage);
		} catch (error) {
			toast.error(
				getFriendlyApiErrorMessage(
					error,
					"Unable to get a response from AI.",
				),
			);
		}
	};

	const confirmPageComposition = async (
		generationId: string,
		input: ConfirmPageCompositionRequest = {},
	) => {
		try {
			const result = await confirmMutation.mutateAsync({
				generationId,
				input,
			});

			updateGenerationInMessages(result.generation);

			toast.success("Page created successfully.");

			router.push(`/page/${result.execution.pageId}`);
		} catch (error) {
			toast.error(
				getFriendlyApiErrorMessage(error, "Unable to create the page."),
			);
		}
	};

	const discardGeneration = async (generationId: string) => {
		try {
			const generation = await discardMutation.mutateAsync(generationId);

			updateGenerationInMessages(generation);

			toast.success("AI draft discarded.");
		} catch (error) {
			toast.error(
				getFriendlyApiErrorMessage(
					error,
					"Unable to discard the AI draft.",
				),
			);
		}
	};

	return {
		currentWorkspaceId,
		isPending,
		sendMessage,
		confirmPageComposition,
		discardGeneration,
	};
}
