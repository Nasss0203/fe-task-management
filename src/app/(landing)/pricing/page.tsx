import type { Metadata } from "next";
import { PricingPageContent } from "./ui/pricing-page-content";

export const metadata: Metadata = {
	title: "Pricing Plans — Simple, Transparent SaaS Pricing | Taskmanly",
	description:
		"Choose the Taskmanly plan that fits your team: Free forever, Pro for growing squads, or Team for scaled organizations. Start free today.",
};

export default function PricingPage() {
	return <PricingPageContent />;
}
