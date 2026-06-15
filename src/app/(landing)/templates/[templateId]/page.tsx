"use client";

import { useWorkspaceTemplate } from "@/features/workspace-template/hooks/useWorkspaceTemplates";
import { ArrowLeft, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import TemplatePreview from "@/features/landing/components/landing/templates/TemplatePreview";
import MockKanbanBoard from "@/features/landing/components/landing/templates/MockKanbanBoard";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TemplateReviewPage() {
	const params = useParams();
	const templateId = params.templateId as string;

	const { workspaceTemplateFindOne } = useWorkspaceTemplate(templateId);
	const { data, isLoading, error } = workspaceTemplateFindOne;
	const template = data?.data; // Unpack the Axios response

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-40">
				<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="py-40 text-center">
				<h1 className="text-2xl font-bold">Template not found</h1>
				<p className="mt-2 text-muted-foreground">The template you are looking for does not exist or is private.</p>
				<Link href="/#templates" className="mt-6 inline-block">
					<Button variant="outline">Back to Home</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="py-10 md:py-16 max-w-5xl mx-auto">
			<Link href="/#templates" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Templates
			</Link>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				{/* Left Column: Details */}
				<div className="flex flex-col gap-6">
					<div>
						<div className="flex items-center gap-3 mb-4">
							<Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
								{template.category || "General"}
							</Badge>
						</div>
						<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
							{template.name}
						</h1>
						<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
							{template.description || "A comprehensive workspace template designed to jumpstart your team's productivity and streamline workflows."}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 mt-4">
						<Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold">
							Use Template
						</Button>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" className="h-12 px-8 rounded-xl border-border bg-background/50 hover:bg-secondary text-base font-medium">
									<PlayCircle className="mr-2 h-5 w-5" />
									Preview Workflow
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-[95vw] md:max-w-[85vw] h-[85vh] border-border bg-background p-0 overflow-hidden rounded-2xl flex flex-col">
								<DialogHeader className="p-6 pb-2 shrink-0">
									<DialogTitle className="text-xl flex items-center gap-2">
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Sandbox Mode</Badge>
										{template.name}
									</DialogTitle>
									<DialogDescription>
										This is a live interactive sandbox. Drag and drop tasks to try out the workflow. All changes will be reset when you close this window.
									</DialogDescription>
								</DialogHeader>
								<div className="flex-1 w-full bg-muted/10 overflow-hidden relative">

								</div>
							</DialogContent>
						</Dialog>
					</div>

					<div className="mt-8 border-t border-border pt-8">
						<h3 className="font-semibold text-foreground mb-4">What's included in this template:</h3>
						<ul className="space-y-3">
							{[
								"Pre-configured task boards and statuses",
								"Custom labels and priority tags",
								"Sample data to get you started quickly",
								"Optimized for team collaboration",
							].map((feature, i) => (
								<li key={i} className="flex items-center gap-3 text-muted-foreground">
									<div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Right Column: Visual Preview */}
				<div className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden aspect-[4/3] group">
					<TemplatePreview variant="kanban" />
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
				</div>
			</div>
		</div>
	);
}
