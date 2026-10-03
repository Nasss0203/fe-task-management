import type { Metadata } from "next";
import { AiPageContent } from "./ui/ai-page-content";

export const metadata: Metadata = {
	title: "AI Assistant — Taskmanly Workspace Intelligence",
	description:
		"Taskmanly AI understands workspace context and helps users create documents, extract action items, summarize information, and organize knowledge with ease.",
};

export default function AiPage() {
	return <AiPageContent />;
}
