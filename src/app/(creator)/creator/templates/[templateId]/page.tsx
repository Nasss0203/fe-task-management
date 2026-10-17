"use client";

import { useParams } from "next/navigation";

import { CreatorTemplateDetailPage } from "@/widgets/creator-templates";

export default function Page() {
	const { templateId } = useParams<{ templateId: string }>();

	return <CreatorTemplateDetailPage templateId={templateId} />;
}
