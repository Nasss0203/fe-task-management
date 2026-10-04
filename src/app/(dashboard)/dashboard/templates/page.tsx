import type { Metadata } from "next";
import { AuthenticatedTemplatesPage } from "@/widgets/dashboard-templates";

export const metadata: Metadata = {
	title: "Templates — Taskmanly",
	description: "Discover, reuse, and manage workspace templates.",
};

export default function DashboardTemplatesPage() {
	return <AuthenticatedTemplatesPage />;
}
