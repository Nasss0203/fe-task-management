import type { Metadata } from "next";

import { AiChat } from "@/widgets/ai-chat";

export const metadata: Metadata = {
	title: "Ask AI - Taskmanly",
	description: "Workspace AI assistant for notes, brainstorming, and image generation.",
};

export default function DashboardAiPage() {
	return <AiChat />;
}
