export type AiChatMode = "text" | "image";

export interface AiChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	imageUrl?: string;
	mode?: AiChatMode;
	createdAt?: string;
}

export interface QuickActionItem {
	id: string;
	label: string;
	prompt: string;
	mode: AiChatMode;
	iconName: "image" | "file-text" | "lightbulb" | "align-left";
}
