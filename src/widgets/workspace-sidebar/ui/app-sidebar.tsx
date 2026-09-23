"use client";

import {
	Blocks,
	Command,
	Home,
	Inbox,
	MessageCircleQuestion,
	Search,
	Sparkles,
	Trash2,
} from "lucide-react";
import * as React from "react";

import { usePagesByWorkspace } from "@/entities/page/model/page.queries";
import { useTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import { useSelectWorkspace } from "@/entities/workspace/model/workspace.mutations";
import {
	useWorkspaceAccess,
	useWorkspaces,
} from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";
import { NavFavorites } from "@/widgets/workspace-sidebar/ui/nav-favorites";
import { NavMain } from "@/widgets/workspace-sidebar/ui/nav-main";
import { NavPrivatePages } from "@/widgets/workspace-sidebar/ui/nav-private";
import { NavSecondary } from "@/widgets/workspace-sidebar/ui/nav-secondary";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/widgets/workspace-sidebar/ui/sidebar";
import { TeamSwitcher } from "@/widgets/workspace-sidebar/ui/team-switcher";
import { usePathname } from "next/navigation";
import { NavSharedPages } from "./nav-shared-pages";
import { NavTeamspaces } from "./nav-teamspaces";

// This is sample data.
const data = {
	teams: {
		name: "Acme Inc",
		logo: Command,
		plan: "Enterprise",
	},
	navMain: [
		{
			title: "Search",
			url: "#",
			icon: Search,
		},
		{
			title: "Ask AI",
			url: "#",
			icon: Sparkles,
		},
		{
			title: "Home",
			url: "#",
			icon: Home,
			isActive: true,
		},
		{
			title: "Inbox",
			url: "#",
			icon: Inbox,
			badge: "10",
		},
	],
	navSecondary: [
		{
			title: "Templates",
			url: "#",
			icon: Blocks,
		},
		{
			title: "Trash",
			url: "#",
			icon: Trash2,
			action: "trash" as const,
		},
		{
			title: "Help",
			url: "#",
			icon: MessageCircleQuestion,
		},
	],
	favorites: [
		{
			name: "Project Management & Task Tracking",
			url: "#",
			emoji: "📊",
		},
		{
			name: "Family Recipe Collection & Meal Planning",
			url: "#",
			emoji: "🍳",
		},
	],

	workspaces: [
		{
			name: "Personal Life Management",
			emoji: "🏠",
			pages: [
				{
					name: "Daily Journal & Reflection",
					url: "#",
					emoji: "📔",
				},
				{
					name: "Health & Wellness Tracker",
					url: "#",
					emoji: "🍏",
				},
				{
					name: "Personal Growth & Learning Goals",
					url: "#",
					emoji: "🌟",
				},
			],
		},
		{
			name: "Professional Development",
			emoji: "💼",
			pages: [
				{
					name: "Career Objectives & Milestones",
					url: "#",
					emoji: "🎯",
				},
				{
					name: "Skill Acquisition & Training Log",
					url: "#",
					emoji: "🧠",
				},
				{
					name: "Networking Contacts & Events",
					url: "#",
					emoji: "🤝",
				},
			],
		},
	],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { data: workspaces = [], isLoading, isError } = useWorkspaces();
	const { user } = useUser();

	const selectWorkspaceMutation = useSelectWorkspace();

	const activePageId = pathname.startsWith("/page/")
		? pathname.split("/")[2]
		: undefined;

	const hasLastActiveWorkspace =
		user?.lastActiveWorkspaceId &&
		workspaces.some(
			(workspace) => workspace.id === user.lastActiveWorkspaceId,
		);

	const currentWorkspaceId = hasLastActiveWorkspace
		? user.lastActiveWorkspaceId
		: workspaces[0]?.id;

	const workspaceAccessQuery = useWorkspaceAccess(currentWorkspaceId ?? "");
	const membershipType =
		!isError &&
		workspaceAccessQuery.isSuccess &&
		workspaceAccessQuery.data.workspace_id === currentWorkspaceId
			? workspaceAccessQuery.data.membership_type
			: undefined;
	const isGuest = membershipType === "GUEST";
	const isMember = membershipType === "MEMBER";
	const isAccessLoading =
		isLoading || (Boolean(currentWorkspaceId) && workspaceAccessQuery.isPending);

	const {
		data: pages = [],
		isLoading: isPagesLoading,
		isError: isPagesError,
	} = usePagesByWorkspace(currentWorkspaceId ?? undefined, isMember);

	const {
		data: teamspaces = [],
		isLoading: isTeamspacesLoading,
		isError: isTeamspacesError,
	} = useTeamspaces(currentWorkspaceId ?? "", isMember);

	const handleWorkspaceSelect = async (workspaceId: string) => {
		if (workspaceId === currentWorkspaceId) {
			return;
		}

		await selectWorkspaceMutation.mutateAsync(workspaceId);
	};

	return (
		<Sidebar className='border-r-0' {...props}>
			<SidebarHeader>
				{!isLoading &&
					!isError &&
					currentWorkspaceId &&
					workspaces.length > 0 && (
						<TeamSwitcher
							key={currentWorkspaceId}
							workspaces={workspaces}
							currentWorkspaceId={currentWorkspaceId}
							membershipType={membershipType}
							user={{
								email: user?.email ?? "",
							}}
							onWorkspaceSelect={handleWorkspaceSelect}
						/>
					)}

				{isMember && <NavMain items={data.navMain} />}
			</SidebarHeader>

			<SidebarContent>
				{isAccessLoading ? (
					<p
						role='status'
						className='px-4 py-2 text-sm text-muted-foreground'
					>
						Loading workspace access...
					</p>
				) : !isGuest && !isMember ? (
					<p
						role='alert'
						className='px-4 py-2 text-sm text-muted-foreground'
					>
						{!isError && !currentWorkspaceId
							? "No workspace available."
							: "Unable to load workspace access."}
					</p>
				) : null}

				{isMember && (
					<NavFavorites
						workspaceId={currentWorkspaceId ?? undefined}
						activePageId={activePageId}
						pages={pages}
						teamspaces={teamspaces}
					/>
				)}

				{(isGuest || isMember) && (
					<NavSharedPages activePageId={activePageId} />
				)}

				{isMember && !isPagesLoading && !isPagesError && (
					<NavPrivatePages
						workspaceId={currentWorkspaceId as string}
						pages={pages}
						teamspaces={teamspaces}
						activePageId={activePageId}
					/>
				)}

				{isMember &&
					!isPagesLoading &&
					!isPagesError &&
					!isTeamspacesLoading &&
					!isTeamspacesError &&
					currentWorkspaceId && (
						<NavTeamspaces
							workspaceId={currentWorkspaceId}
							teamspaces={teamspaces}
							pages={pages}
							activePageId={activePageId}
						/>
					)}
				{isMember && (
					<NavSecondary
						workspaceId={currentWorkspaceId as string}
						items={data.navSecondary}
						className='mt-auto'
					/>
				)}
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
