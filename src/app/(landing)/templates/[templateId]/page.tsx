import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MARKETING_TEMPLATES } from "@/widgets/landing/data/marketing-data";
import { TemplateReviewPage } from "@/widgets/landing/templates";

interface PageProps {
	params: Promise<{ templateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { templateId } = await params;
	const template = MARKETING_TEMPLATES.find(
		(t) => t.id === templateId || t.slug === templateId
	);

	if (!template) {
		return {
			title: "Template Not Found — Taskmanly",
		};
	}

	return {
		title: `${template.name} — Taskmanly Workspace Template`,
		description: template.description,
	};
}

export default async function Page({ params }: PageProps) {
	const { templateId } = await params;
	const template = MARKETING_TEMPLATES.find(
		(t) => t.id === templateId || t.slug === templateId
	);

	if (!template) {
		notFound();
	}

	return <TemplateReviewPage template={template} />;
}
