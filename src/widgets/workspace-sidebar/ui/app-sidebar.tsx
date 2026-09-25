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
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useWorkspaceSubscription } from "@/entities/billing/model/billing.queries";
import { usePagesByWorkspace } from "@/entities/page/model/page.queries";
import { useTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import { useSelectWorkspace } from "@/entities/workspace/model/workspace.mutations";
import {
	useWorkspaceAccess,
	useWorkspaces,
} from "@/entities/workspace/model/workspace.queries";

import { useUser } from "@/features/auth";

import { NavFavorites } from "@/widgets/workspace-sidebar/ui/nav-favorites";
import {
	NavMain,
	type NavMainAction,
	type NavMainItem,
} from "@/widgets/workspace-sidebar/ui/nav-main";
import { NavPrivatePages } from "@/widgets/workspace-sidebar/ui/nav-private";
import { NavSecondary } from "@/widgets/workspace-sidebar/ui/nav-secondary";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/widgets/workspace-sidebar/ui/sidebar";
import { TeamSwitcher } from "@/widgets/workspace-sidebar/ui/team-switcher";

import { useUnreadNotificationCount } from "@/entities/notification/model/notification.queries";
import { InboxSidebar } from "./inbox-sidebar";
import { NavSharedPages } from "./nav-shared-pages";
import { NavTeamspaces } from "./nav-teamspaces";

/**
 * Phải khớp với permission mà:
 *
 * GET /workspaces/:workspaceId/access
 *
 * trả về trong permissions[].
 *
 * Nếu backend của bạn trả string khác,
 * chỉ cần sửa constant này.
 */
const WORKSPACE_MEMBER_ADD_PERMISSION = "WORKSPACE_MEMBER_ADD";

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
			action: "home",
		},
		{
			title: "Inbox",
			url: "#",
			icon: Inbox,
			action: "inbox",
		},
	] satisfies NavMainItem[],

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
};

const SidebarView = {
	WORKSPACE: "workspace",
	INBOX: "inbox",
} as const;

type SidebarView = (typeof SidebarView)[keyof typeof SidebarView];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	const { data: workspaces = [], isLoading, isError } = useWorkspaces();

	const { user } = useUser();

	const selectWorkspaceMutation = useSelectWorkspace();

	const { data: unreadNotificationCount } = useUnreadNotificationCount();

	const [view, setView] = useState<SidebarView>(SidebarView.WORKSPACE);

	const activePageId = pathname.startsWith("/page/")
		? pathname.split("/")[2]
		: undefined;

	/**
	 * Workspace hiện tại.
	 */
	const hasLastActiveWorkspace =
		Boolean(user?.lastActiveWorkspaceId) &&
		workspaces.some(
			(workspace) => workspace.id === user?.lastActiveWorkspaceId,
		);

	const currentWorkspaceId = hasLastActiveWorkspace
		? user?.lastActiveWorkspaceId
		: workspaces[0]?.id;

	const { data: workspaceSubscription } = useWorkspaceSubscription(
		currentWorkspaceId ?? "",
	);

	/**
	 * Workspace access.
	 *
	 * Response:
	 *
	 * {
	 *   membership_type: "MEMBER" | "GUEST",
	 *   roles: [],
	 *   permissions: []
	 * }
	 */
	const workspaceAccessQuery = useWorkspaceAccess(currentWorkspaceId ?? "");

	const membershipType =
		!isError &&
		workspaceAccessQuery.isSuccess &&
		workspaceAccessQuery.data.workspace_id === currentWorkspaceId
			? workspaceAccessQuery.data.membership_type
			: undefined;

	const workspacePermissions =
		workspaceAccessQuery.isSuccess &&
		workspaceAccessQuery.data.workspace_id === currentWorkspaceId
			? workspaceAccessQuery.data.permissions
			: [];

	const isGuest = membershipType === "GUEST";

	const isMember = membershipType === "MEMBER";

	/**
	 * Không dựa vào role OWNER/MEMBER.
	 *
	 * UI dựa trực tiếp vào permission
	 * mà backend cấp.
	 */
	const canInviteMembers =
		isMember &&
		workspacePermissions.includes(WORKSPACE_MEMBER_ADD_PERMISSION);

	const isAccessLoading =
		isLoading ||
		(Boolean(currentWorkspaceId) && workspaceAccessQuery.isPending);

	/**
	 * MEMBER mới load toàn bộ pages
	 * của workspace.
	 *
	 * GUEST chỉ xem Shared Pages.
	 */
	const {
		data: pages = [],
		isLoading: isPagesLoading,
		isError: isPagesError,
	} = usePagesByWorkspace(currentWorkspaceId ?? undefined, isMember);

	/**
	 * Teamspaces chỉ load đối với MEMBER.
	 */
	const {
		data: teamspaces = [],
		isLoading: isTeamspacesLoading,
		isError: isTeamspacesError,
	} = useTeamspaces(currentWorkspaceId ?? "", isMember);

	/**
	 * Switch workspace.
	 */
	const handleWorkspaceSelect = async (workspaceId: string) => {
		if (workspaceId === currentWorkspaceId) {
			return;
		}

		await selectWorkspaceMutation.mutateAsync(workspaceId);
	};

	/**
	 * Main navigation actions.
	 */
	const handleMainAction = (action: NavMainAction) => {
		switch (action) {
			case "home":
				setView(SidebarView.WORKSPACE);
				break;

			case "inbox":
				setView(SidebarView.INBOX);
				break;
		}
	};

	const activeMainAction: NavMainAction =
		view === SidebarView.INBOX ? "inbox" : "home";

	/**
	 * Inbox unread badge.
	 */
	const unreadCount = unreadNotificationCount?.count ?? 0;

	const navMainItems: NavMainItem[] = data.navMain.map((item) => {
		if (item.action !== "inbox") {
			return item;
		}

		return {
			...item,
			badge: unreadCount > 0 ? String(unreadCount) : undefined,
		};
	});

	/**
	 * Guest chỉ được thấy Inbox trong
	 * nav chính.
	 */
	const guestNavMainItems = navMainItems.filter(
		(item) => item.action === "inbox",
	);

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
							subscription={workspaceSubscription}
							membershipType={membershipType}
							canInviteMembers={canInviteMembers}
							user={{
								email: user?.email ?? "",
							}}
							onWorkspaceSelect={handleWorkspaceSelect}
						/>
					)}

				{isMember && (
					<NavMain
						items={navMainItems}
						activeAction={activeMainAction}
						onAction={handleMainAction}
					/>
				)}

				{isGuest && (
					<NavMain
						items={guestNavMainItems}
						activeAction={
							view === SidebarView.INBOX ? "inbox" : undefined
						}
						onAction={handleMainAction}
					/>
				)}
			</SidebarHeader>

			<SidebarContent>
				{view === SidebarView.INBOX ? (
					<InboxSidebar />
				) : (
					<>
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
					</>
				)}
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
