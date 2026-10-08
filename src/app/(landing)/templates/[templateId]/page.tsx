import type { Metadata } from "next";
import { PublicTemplateDetailPage } from "@/widgets/landing/templates";

interface PageProps {
	params: Promise<{ templateId: string }>;
}

export const metadata: Metadata = {
	title: "Template Detail — Taskmanly",
	description:
		"Explore template details, preview interactive layouts, and jumpstart your Taskmanly workspace.",
};

export default async function Page({ params }: PageProps) {
	const { templateId } = await params;
	return <PublicTemplateDetailPage templateId={templateId} />;
}
