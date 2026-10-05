import type {
	AiCapability,
	AiGeneration,
} from "@/entities/ai-assistant/model/ai-assistant.types";

export type AiChatMode = AiCapability;

export interface AiChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	capability: AiCapability;
	generation?: AiGeneration;
	createdAt: string;
}

export interface QuickActionItem {
	id: string;
	label: string;
	prompt: string;
	mode: AiChatMode;
	iconName:
		| "file-text"
		| "wand"
		| "align-left"
		| "minimize"
		| "maximize"
		| "languages"
		| "list-plus";
}
