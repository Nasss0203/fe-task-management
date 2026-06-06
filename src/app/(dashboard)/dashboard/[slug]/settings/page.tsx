"use client";

import WorkspaceSettingsContent from "@/components/workspaces/WorkspaceSettingsContent";
import { useParams } from "next/navigation";

const WorkspaceSettingsPage = () => {
	const params = useParams<{ slug: string }>();

	return <WorkspaceSettingsContent workspaceSlug={params.slug} />;
};

export default WorkspaceSettingsPage;
