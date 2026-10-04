"use client";

import { useParams } from "next/navigation";
import { TemplateDetailPage } from "@/widgets/dashboard-templates";

export default function TemplateDetailRoutePage() {
	const params = useParams<{
		templateId: string;
	}>();

	return <TemplateDetailPage templateId={params.templateId} />;
}
