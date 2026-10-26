import type { Metadata } from "next";

import { JoinTeamspaceByLinkPage } from "@/features/teamspace/join-by-link/ui/join-teamspace-by-link-page";

export const metadata: Metadata = {
	title: "Join teamspace — Taskmanly",
};

export default function JoinTeamspaceRoute() {
	return <JoinTeamspaceByLinkPage />;
}
