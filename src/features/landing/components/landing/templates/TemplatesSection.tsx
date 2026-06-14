"use client";

import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";
import TemplateCard from "./TemplateCard";
import { useWorkspaceTemplates } from "@/features/workspace-template/hooks/useWorkspaceTemplates";
import { TemplateItem } from "./template-data";

export default function TemplatesSection() {
	const { workspaceTemplatesFindAll } = useWorkspaceTemplates({
		visibility: "PUBLIC",
		status: "PUBLISHED",
	});

	const { data, isLoading } = workspaceTemplatesFindAll;
	const templates = data?.data?.data || [];

	const mappedTemplates: TemplateItem[] = templates.map((template, index) => {
		const variants: ("kanban" | "mindmap" | "checklist" | "timeline" | "planner" | "meeting")[] = [
			"kanban",
			"mindmap",
			"checklist",
			"timeline",
			"planner",
			"meeting",
		];
		// Pick a stable variant based on index or just use a default
		const variant = variants[index % variants.length];

		return {
			id: template.id,
			title: template.name,
			description: template.description || "A complete workspace template for your team.",
			variant,
		};
	});

	return (
		<section className='py-10 md:py-14'>
			<div className='mb-8 flex items-center justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight text-foreground md:text-3xl'>
						Templates
					</h1>
					<p className='mt-2 text-sm text-muted-foreground md:text-base'>
						Start faster with ready-made layouts for planning,
						meetings, and productivity.
					</p>
				</div>

				<Button
					variant='outline'
					className='h-11 rounded-xl border-border bg-background/50 px-4 text-foreground hover:bg-secondary hover:text-foreground'
				>
					<Filter className='mr-2 h-4 w-4' />
					Filter
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
					{mappedTemplates.map((item) => (
						<TemplateCard key={item.id} item={item} />
					))}
					{mappedTemplates.length === 0 && (
						<div className="col-span-full py-10 text-center text-muted-foreground">
							No public templates found.
						</div>
					)}
				</div>
			)}
		</section>
	);
}
