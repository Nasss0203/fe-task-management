import type { Metadata } from "next";

import { PublicCreatorPage } from "@/widgets/landing/templates";

interface PageProps {
	params: Promise<{ handle: string }>;
}

export const metadata: Metadata = {
	title: "Creator — Taskmanly",
	description: "Templates published by this creator on the Taskmanly marketplace.",
};

export default async function Page({ params }: PageProps) {
	const { handle } = await params;
	return <PublicCreatorPage handle={decodeURIComponent(handle)} />;
}
