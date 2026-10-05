"use client";

import { Plus } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import { usePage } from "@/entities/page/model/page.queries";
import { useTemplateDetail } from "@/entities/template";
import {
	useWorkspace,
	useWorkspaces,
} from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";

import { HeaderWorkspace } from "./header-workspace";

export function HeaderWorkspaceContainer() {
	const pathname = usePathname();
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
	const isTemplatesGalleryRoute = pathname === "/dashboard/templates";
	const isTemplateDetailRoute =
		pathname.startsWith("/dashboard/templates/") &&
		pathname !== "/dashboard/templates";

	const pageId = isPageRoute ? params.pageId : undefined;
	const templateId = isTemplateDetailRoute ? params.templateId : undefined;

	const { data: page } = usePage(pageId);
	const { data: templateDetail } = useTemplateDetail(templateId ?? "", {
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

	const { data: workspace } = useWorkspace(currentWorkspaceId ?? "");

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
				{ label: "Templates", href: "/dashboard/templates" },
				{ label: templateDetail?.name || "Template" },
			]
		: undefined;

	const { messages, newChat } = useAiChatStore();
	const hasMessages = messages.length > 0;

	const rightAction = isAiRoute ? (
		<Button
			type='button'
			variant='ghost'
			size='sm'
			onClick={newChat}
			disabled={!hasMessages}
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
