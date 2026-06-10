"use client";

import WorkspaceSettingsContent from "@/features/workspace/components/workspaces/WorkspaceSettingsContent";
import { useParams } from "next/navigation";

const WorkspaceSettingsPage = () => {
	const params = useParams<{ slug: string }>();

	return <WorkspaceSettingsContent workspaceSlug={params.slug} />;
};

export default WorkspaceSettingsPage;
