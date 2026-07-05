"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAiConversationApi,
  listAiConversationsApi,
  getAiConversationApi,
  sendAiMessageApi,
  applyAiGenerationApi,
  discardAiGenerationApi,
} from "@/services/ai-assistant/ai-assistant.service";
import { CreateAiConversationDto, SendAiMessageDto } from "@/services/ai-assistant/type";

export const AI_ASSISTANT_KEY = {
  CONVERSATIONS: "ai_conversations",
  CONVERSATION_DETAIL: "ai_conversation_detail",
};

export const useAiAssistant = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: [AI_ASSISTANT_KEY.CONVERSATIONS],
    queryFn: listAiConversationsApi,
  });

  const conversationDetailQuery = useQuery({
    queryKey: [AI_ASSISTANT_KEY.CONVERSATION_DETAIL, conversationId],
    queryFn: () => getAiConversationApi(conversationId!),
    enabled: !!conversationId,
  });

  const createConversation = useMutation({
    mutationFn: (data: CreateAiConversationDto) => createAiConversationApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AI_ASSISTANT_KEY.CONVERSATIONS],
      });
    },
  });

  const sendAiMessage = useMutation({
    mutationFn: ({ convId, data }: { convId: string; data: SendAiMessageDto }) =>
      sendAiMessageApi(convId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AI_ASSISTANT_KEY.CONVERSATION_DETAIL, variables.convId],
      });
      queryClient.invalidateQueries({
        queryKey: [AI_ASSISTANT_KEY.CONVERSATIONS],
      });
    },
  });

  const applyGeneration = useMutation({
    mutationFn: (generationId: string) => applyAiGenerationApi(generationId),
    onSuccess: () => {
      // Invalidate active conversation detail to show applied state
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: [AI_ASSISTANT_KEY.CONVERSATION_DETAIL, conversationId],
        });
      }
      // Also invalidate core workspace/project/task queries so that the main views refresh
      queryClient.invalidateQueries();
    },
  });

  const discardGeneration = useMutation({
    mutationFn: (generationId: string) => discardAiGenerationApi(generationId),
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: [AI_ASSISTANT_KEY.CONVERSATION_DETAIL, conversationId],
        });
      }
    },
  });

  return {
    conversationsQuery,
    conversationDetailQuery,
    createConversation,
    sendAiMessage,
    applyGeneration,
    discardGeneration,
  };
};
