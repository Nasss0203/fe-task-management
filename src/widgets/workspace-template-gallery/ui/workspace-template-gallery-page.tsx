"use client";

import { PublicTemplateGallery } from "@/widgets/landing/templates";

import { WorkspaceTemplatesHeader } from "./workspace-templates-header";

/**
 * Workspace view of the marketplace: the same public gallery as /templates,
 * linking to the in-workspace buyer detail. Creator tools live in Creator Studio.
 */
export function WorkspaceTemplateGalleryPage() {
	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
			<WorkspaceTemplatesHeader description='Browse templates published on the Taskmanly marketplace and add them to your workspace.' />

			<PublicTemplateGallery
				detailHref={(templateId) => `/dashboard/templates/${templateId}`}
			/>
		</div>
	);
}
