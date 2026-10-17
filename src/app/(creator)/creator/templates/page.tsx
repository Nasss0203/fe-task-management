import type { Metadata } from "next";

import { CreatorTemplatesPage } from "@/widgets/creator-templates";

export const metadata: Metadata = {
	title: "My templates · Creator Studio",
};

export default function Page() {
	return <CreatorTemplatesPage />;
}
