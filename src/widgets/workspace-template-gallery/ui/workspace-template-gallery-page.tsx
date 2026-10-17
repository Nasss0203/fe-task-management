"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PublicTemplateGallery } from "@/widgets/landing/templates";

/**
 * Workspace view of the marketplace: the same public gallery as /templates,
 * linking to the in-workspace buyer detail. Creator tools live in Creator Studio.
 */
export function WorkspaceTemplateGalleryPage() {
	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
			<header className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>Templates</h1>
					<p className='text-sm text-muted-foreground'>
						Browse templates published on the Taskmanly marketplace and add them
						to your workspace.
					</p>
				</div>
				<Link
					href='/creator/templates'
					className='inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
				>
					Manage your own templates
					<ArrowRight className='size-3.5' />
				</Link>
			</header>

			<PublicTemplateGallery
				detailHref={(templateId) => `/dashboard/templates/${templateId}`}
			/>
		</div>
	);
}
