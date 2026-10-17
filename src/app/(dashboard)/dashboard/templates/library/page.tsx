import type { Metadata } from "next";
import { WorkspaceTemplateLibraryPage } from "@/widgets/workspace-template-gallery";

export const metadata: Metadata = {
	title: "Your template library — Taskmanly",
	description: "Templates you claimed from the marketplace.",
};

export default function DashboardTemplateLibraryPage() {
	return <WorkspaceTemplateLibraryPage />;
}
