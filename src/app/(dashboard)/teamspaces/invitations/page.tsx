import type { Metadata } from "next";
import { TeamspaceInvitationsPage } from "@/widgets/teamspace-invitations";

export const metadata: Metadata = {
	title: "Teamspace invitations — Taskmanly",
	description: "Review and respond to your teamspace invitations.",
};

export default function TeamspaceInvitationsRoute() {
	return <TeamspaceInvitationsPage />;
}
