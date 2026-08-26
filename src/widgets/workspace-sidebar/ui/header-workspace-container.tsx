"use client";

import { useParams, usePathname } from "next/navigation";

import { usePage } from "@/entities/page/model/page.queries";
import { useWorkspace } from "@/entities/workspace/model/workspace.queries";

import { HeaderWorkspace } from "./header-workspace";

export function HeaderWorkspaceContainer() {
	const pathname = usePathname();

	const params = useParams<{
		pageId?: string;
	}>();

	const isPageRoute = pathname.startsWith("/page/");

	const pageId = isPageRoute ? params.pageId : undefined;

	const { data: page } = usePage(pageId);

	const { data: workspace } = useWorkspace(page?.workspace_id ?? "");

	return (
		<HeaderWorkspace
			workspaceName={workspace?.name}
			pageTitle={page?.title}
		/>
	);
}
