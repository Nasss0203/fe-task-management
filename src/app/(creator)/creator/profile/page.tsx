import type { Metadata } from "next";

import { CreatorProfilePage } from "@/widgets/creator-profile";

export const metadata: Metadata = {
	title: "Profile · Creator Studio",
};

export default function Page() {
	return <CreatorProfilePage />;
}
