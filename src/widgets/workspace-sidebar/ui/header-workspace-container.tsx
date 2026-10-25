"use client";

import { Plus } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useAiHistoryConversations } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { usePage } from "@/entities/page/model/page.queries";
import { usePublicTemplate } from "@/entities/template";
import {
	useWorkspace,
	useWorkspaces,
} from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import {
	getAiChatScope,
	useAiChatStore,
} from "@/widgets/ai-chat/model/use-ai-chat-store";
import {
	aiHistorySelectionKey,
	resetAiChatSelection,
	useSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";

import { HeaderWorkspace } from "./header-workspace";

export function HeaderWorkspaceContainer() {
	const pathname = usePathname();
	const router = useRouter();

	const { user } = useUser();
	const { data: workspaces = [] } = useWorkspaces();

	const params = useParams<{
		pageId?: string;
		templateId?: string;
	}>();

	const isPageRoute = pathname.startsWith("/page/");

	const isAiRoute =
		pathname === "/dashboard/ai" || pathname.startsWith("/dashboard/ai/");

	const isDashboardRoute = pathname === "/dashboard";
	const isTemplatesGalleryRoute =
		pathname === "/dashboard/templates" ||
		pathname === "/dashboard/templates/library";
	const isTemplateDetailRoute =
		pathname.startsWith("/dashboard/templates/") && !isTemplatesGalleryRoute;

	const pageId = isPageRoute ? params.pageId : undefined;

	const templateId = isTemplateDetailRoute ? params.templateId : undefined;

	const { data: page } = usePage(pageId);
	// Buyer detail: public data only, never the creator's private template.
	const { data: templateDetail } = usePublicTemplate(templateId ?? "", {
		enabled: Boolean(templateId),
	});

	const hasLastActiveWorkspace =
		Boolean(user?.lastActiveWorkspaceId) &&
		workspaces.some(
			(workspace) => workspace.id === user?.lastActiveWorkspaceId,
		);

	const fallbackWorkspaceId = hasLastActiveWorkspace
		? user?.lastActiveWorkspaceId
		: workspaces[0]?.id;

	const currentWorkspaceId = page?.workspace_id || fallbackWorkspaceId;
	const dashboardChatScope = getAiChatScope(undefined, currentWorkspaceId, user?.id);
	const dashboardHistoryKey = aiHistorySelectionKey(user?.id, currentWorkspaceId ?? null);
	const selectedDashboardConversationId = useSelectedAiConversation(dashboardHistoryKey);

	const { data: workspace } = useWorkspace(currentWorkspaceId ?? "");

	// Same query keys as useAiChat, so the chat title comes from its cache.
	const isAiChatRoute = isAiRoute && pathname !== "/dashboard/ai";
	const chatFilters = (scope: "GLOBAL" | "PAGE") =>
		isAiChatRoute && currentWorkspaceId ? { workspaceId: currentWorkspaceId, scope } : null;
	const { data: globalChats } = useAiHistoryConversations(user?.id, chatFilters("GLOBAL"));
	const { data: pageChats } = useAiHistoryConversations(user?.id, chatFilters("PAGE"));
	const chatTitle = [...(globalChats?.pages ?? []), ...(pageChats?.pages ?? [])]
		.flatMap((chatPage) => chatPage.items)
		.find((conversation) => conversation.id === selectedDashboardConversationId)?.title;

	const pageTitle = isPageRoute
		? page?.title
		: isAiRoute
			? "Ask AI"
			: isTemplatesGalleryRoute
				? "Templates"
				: isDashboardRoute
					? "Home"
					: undefined;

	const customBreadcrumbs = isTemplateDetailRoute
		? [
				...(workspace?.name ? [{ label: workspace.name }] : []),
				{
					label: "Templates",
					href: "/dashboard/templates",
				},
				{
					label: templateDetail?.name || "Template",
				},
			]
		: isAiChatRoute
			? [
					...(workspace?.name ? [{ label: workspace.name }] : []),
					{ label: "Ask AI", href: "/dashboard/ai" },
					{ label: chatTitle || "New chat" },
				]
			: undefined;

	/**
	 * Read only the Global AI Chat thread.
	 *
	 * Page-specific threads are not affected by
	 * the New Chat button in the dashboard header.
	 */
	const hasMessages = useAiChatStore(
		(state) =>
				(state.threads[dashboardChatScope]?.messages.length ?? 0) > 0,
	);
	const chatBusy = useAiChatStore((state) => Boolean(state.threads[dashboardChatScope]?.activeRequestId || state.threads[dashboardChatScope]?.operation));

	const handleNewChat = () => {
		if (chatBusy || !resetAiChatSelection(dashboardChatScope, dashboardHistoryKey)) return;
		router.push("/dashboard/ai");
	};

	// The Ask AI home is already a new chat; only the chat page needs the button.
	const rightAction = isAiChatRoute ? (
		<Button
			type='button'
			variant='ghost'
			size='sm'
			onClick={handleNewChat}
				disabled={(!hasMessages && !selectedDashboardConversationId) || chatBusy}
			className='h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 disabled:opacity-40'
		>
			<Plus className='size-3.5' />
			<span>New chat</span>
		</Button>
	) : undefined;

	return (
		<HeaderWorkspace
			workspaceName={workspace?.name}
			pageTitle={pageTitle}
			pageId={pageId}
			rightAction={rightAction}
			customBreadcrumbs={customBreadcrumbs}
		/>
	);
}
