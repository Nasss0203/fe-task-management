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
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
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
import { NavRecent } from "./nav-recent";
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
	recents: [
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

	const {
		data: pages = [],
		isLoading: isPagesLoading,
		isError: isPagesError,
	} = usePagesByWorkspace(currentWorkspaceId as string);

	const {
		data: teamspaces = [],
		isLoading: isTeamspacesLoading,
		isError: isTeamspacesError,
	} = useTeamspaces(currentWorkspaceId ?? "");

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
							workspaces={workspaces}
							currentWorkspaceId={currentWorkspaceId}
							user={{
								email: user?.email ?? "",
							}}
							onWorkspaceSelect={handleWorkspaceSelect}
						/>
					)}

				<NavMain items={data.navMain} />
			</SidebarHeader>

			<SidebarContent>
				<NavRecent recents={data.recents} />

				<NavFavorites favorites={data.favorites} />

				{!isPagesLoading && !isPagesError && (
					<NavPrivatePages
						workspaceId={currentWorkspaceId as string}
						pages={pages}
						activePageId={activePageId}
					/>
				)}

				{!isPagesLoading &&
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

				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
