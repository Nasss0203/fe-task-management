"use client";

import { useUser } from "@/features/auth";
import {
	useWorkspace,
	useWorkspaces,
} from "@/entities/workspace/model/workspace.queries";

import { FavoritePagesSection } from "./FavoritePagesSection";
import { HomeQuickActions } from "./HomeQuickActions";
import { RecentContentSection } from "./RecentContentSection";
import { SharedPagesSection } from "./SharedPagesSection";
import { WorkspaceWelcome } from "./WorkspaceWelcome";

export function WorkspaceHome() {
	const { user } = useUser();
	const { data: workspaces = [], isLoading: isWorkspacesLoading } = useWorkspaces();

	const hasLastActiveWorkspace =
		Boolean(user?.lastActiveWorkspaceId) &&
		workspaces.some(
			(workspace) => workspace.id === user?.lastActiveWorkspaceId,
		);

	const activeWorkspaceId = hasLastActiveWorkspace
		? user?.lastActiveWorkspaceId
		: workspaces[0]?.id;

	const { data: activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace(
		activeWorkspaceId ?? "",
	);

	const userName = user?.username || user?.email?.split("@")[0] || "there";
	const isLoading = isWorkspacesLoading || isWorkspaceLoading;

	return (
		<div className='mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6'>
			{/* 1. Workspace Header */}
			<WorkspaceWelcome
				workspaceName={activeWorkspace?.name}
				userName={userName}
				isLoading={isLoading}
			/>

			{/* 2. Quick Actions */}
			<HomeQuickActions workspaceId={activeWorkspaceId ?? undefined} />

			{/* 3. Recently updated */}
			<RecentContentSection workspaceId={activeWorkspaceId ?? undefined} />

			{/* 4. Favorites */}
			<FavoritePagesSection workspaceId={activeWorkspaceId ?? undefined} />

			{/* 5. Shared With Me */}
			<SharedPagesSection workspaceId={activeWorkspaceId ?? undefined} />
		</div>
	);
}
