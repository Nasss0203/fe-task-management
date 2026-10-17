"use client";

import { useParams } from "next/navigation";

import { CreatorListingEditorPage } from "@/widgets/creator-templates";

export default function Page() {
	const { templateId } = useParams<{ templateId: string }>();

	return <CreatorListingEditorPage templateId={templateId} />;
}
