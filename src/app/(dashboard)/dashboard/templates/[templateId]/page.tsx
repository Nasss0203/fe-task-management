"use client";

import { useParams } from "next/navigation";

import { PublicTemplateDetailPage } from "@/widgets/landing/templates";

/** Buyer detail inside the workspace: public data only, no creator tools. */
export default function TemplateDetailRoutePage() {
	const params = useParams<{
		templateId: string;
	}>();

	return (
		<PublicTemplateDetailPage
			templateId={params.templateId}
			basePath='/dashboard/templates'
		/>
	);
}
