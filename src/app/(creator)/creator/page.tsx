import type { Metadata } from "next";

import { CreatorOverviewPage } from "@/widgets/creator-overview";

export const metadata: Metadata = {
	title: "Creator Studio · Taskmanly",
};

export default function Page() {
	return <CreatorOverviewPage />;
}
