import type { Metadata } from "next";
import { WorkspaceTemplateGalleryPage } from "@/widgets/workspace-template-gallery";

export const metadata: Metadata = {
	title: "Templates — Taskmanly",
	description: "Browse marketplace templates and add them to your workspace.",
};

export default function DashboardTemplatesPage() {
	return <WorkspaceTemplateGalleryPage />;
}
