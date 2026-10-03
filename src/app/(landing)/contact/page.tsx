import type { Metadata } from "next";
import { TemplatesFaqSection } from "@/widgets/landing/templates";

export const metadata: Metadata = {
	title: "Contact & FAQ — Taskmanly",
	description:
		"Get in touch with the Taskmanly team or find answers to frequently asked questions about our collaborative workspace platform.",
};

export default function ContactPage() {
	return (
		<>
			<TemplatesFaqSection />
		</>
	);
}
