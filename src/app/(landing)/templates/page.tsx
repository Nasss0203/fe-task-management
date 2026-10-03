import type { Metadata } from "next";
import {
	TemplatesFaqSection,
	TemplatesSection,
} from "@/widgets/landing/templates";

export const metadata: Metadata = {
	title: "Starter Templates — Team Wikis, Notes & Database Views | Taskmanly",
	description:
		"Explore curated templates for engineering wikis, meeting notes, knowledge bases, and content planning to jumpstart your Taskmanly workspace.",
};

export default function TemplatesPage() {
	return (
		<>
			<TemplatesSection />
			<TemplatesFaqSection />
		</>
	);
}
