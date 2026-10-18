import type { Metadata } from "next";

import { CreatorAnalyticsPage } from "@/widgets/creator-analytics";

export const metadata: Metadata = {
	title: "Analytics · Creator Studio",
};

export default function Page() {
	return <CreatorAnalyticsPage />;
}
