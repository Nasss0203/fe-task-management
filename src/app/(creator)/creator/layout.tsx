import type { ReactNode } from "react";

import { CreatorLayout } from "@/widgets/creator-layout";

export default function Layout({ children }: { children: ReactNode }) {
	return <CreatorLayout>{children}</CreatorLayout>;
}
