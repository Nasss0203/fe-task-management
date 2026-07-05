import instance from "../axios";
import { ApiResponse } from "../types";
import {
  AiConversation,
  CreateAiConversationDto,
  SendAiMessageDto,
  SendAiMessageResponse,
  ApplyAiGenerationResponse,
  AiGeneration
} from "./type";

export const createAiConversationApi = async (
  data: CreateAiConversationDto
): Promise<AiConversation> => {
  const response = await instance.post<ApiResponse<AiConversation>>("/ai/conversations", data);
  return response.data.data;
};

export const listAiConversationsApi = async (): Promise<AiConversation[]> => {
  const response = await instance.get<ApiResponse<AiConversation[]>>("/ai/conversations");
  return response.data.data;
};

export const getAiConversationApi = async (
  conversationId: string
): Promise<AiConversation> => {
  const response = await instance.get<ApiResponse<AiConversation>>(`/ai/conversations/${conversationId}`);
  return response.data.data;
};

export const sendAiMessageApi = async (
  conversationId: string,
  data: SendAiMessageDto
): Promise<SendAiMessageResponse> => {
  const response = await instance.post<ApiResponse<SendAiMessageResponse>>(
    `/ai/conversations/${conversationId}/messages`,
    data,
    { timeout: 60000 } // Bơm timeout lên 60s cho xử lý AI
  );
  return response.data.data;
};

export const applyAiGenerationApi = async (
  generationId: string
): Promise<ApplyAiGenerationResponse> => {
  const response = await instance.post<ApiResponse<ApplyAiGenerationResponse>>(
    `/ai/generations/${generationId}/apply`,
    {},
    { timeout: 60000 } // Bơm timeout lên 60s cho việc khởi tạo DB lớn
  );
  return response.data.data;
};

export const discardAiGenerationApi = async (
  generationId: string
): Promise<AiGeneration> => {
  const response = await instance.patch<ApiResponse<AiGeneration>>(
    `/ai/generations/${generationId}/discard`
  );
  return response.data.data;
};
