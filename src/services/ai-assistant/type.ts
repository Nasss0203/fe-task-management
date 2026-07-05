export interface AiTaskDraftSubtask {
  title: string;
  description: string;
  estimatedHours: number;
}

export interface AiTaskDraftItem {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedHours: number;
  subtasks: AiTaskDraftSubtask[];
  acceptanceCriteria: string[];
  risks: string[];
}

export interface AiTaskDraft {
  tasks: AiTaskDraftItem[];
}

export interface AiWorkspaceTreeDraftTask {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedHours: number;
}

export interface AiWorkspaceTreeDraftProject {
  name: string;
  key: string;
  visibility: "PRIVATE" | "INTERNAL";
  description: string;
  tasks: AiWorkspaceTreeDraftTask[];
}

export interface AiWorkspaceTreeDraftWorkspace {
  name: string;
  slug: string;
  projects: AiWorkspaceTreeDraftProject[];
}

export interface AiWorkspaceTreeDraft {
  workspaces: AiWorkspaceTreeDraftWorkspace[];
}

export type AiGenerationType = "TASK_DRAFT" | "WORKSPACE_DRAFT" | "PROJECT_DRAFT" | "WORKSPACE_TREE_DRAFT";
export type AiGenerationStatus = "PROCESSING" | "GENERATED" | "APPLIED" | "DISCARDED" | "FAILED";

export interface AiGeneration {
  id: string;
  userId: string;
  conversationId: string;
  generationType: AiGenerationType;
  outputData: any; // Can be AiTaskDraft or AiWorkspaceTreeDraft depending on type
  status: AiGenerationStatus;
  appliedResults?: any;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  senderRole?: "USER" | "ASSISTANT";
  role?: "USER" | "ASSISTANT";
  content: string;
  generationId?: string | null;
  generation?: AiGeneration | null;
  createdAt?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  workspaceId?: string | null;
  title: string;
  lastMessageAt: string;
  messages?: AiMessage[];
}

export interface CreateAiConversationDto {
  title: string;
  workspaceId?: string;
}

export interface SendAiMessageDto {
  message: string;
  generationType?: AiGenerationType;
  autoApply?: boolean;
  workspaceId?: string;
  projectId?: string;
}

export interface SendAiMessageResponse {
  userMessage: AiMessage;
  assistantMessage: AiMessage | null;
  generation: AiGeneration | null;
}

export interface AppliedEntityResult {
  entityType: string;
  entityId: string;
  action: string;
}

export interface ApplyAiGenerationResponse {
  id: string;
  status: "APPLIED";
  appliedResults: AppliedEntityResult[];
}
