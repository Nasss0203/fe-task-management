import type { Metadata } from "next";

import { WorkspaceHome } from "@/widgets/workspace-home";

export const metadata: Metadata = {
	title: "Home - Taskmanly",
	description: "Workspace overview, quick actions, recent pages, and favorites.",
};

export default function HomePage() {
	return <WorkspaceHome />;
}
