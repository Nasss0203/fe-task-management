import type { Metadata } from "next";
import { HeroSection } from "@/widgets/landing/ui/hero-section";
import { FeaturesGrid } from "@/widgets/landing/ui/features-grid";
import { FeatureShowcases } from "@/widgets/landing/ui/feature-showcases";
import { HomeTemplatesShowcase } from "@/widgets/landing/ui/home-templates-showcase";
import { HomeAiShowcase } from "@/widgets/landing/ui/home-ai-showcase";
import { HomePublishShowcase } from "@/widgets/landing/ui/home-publish-showcase";
import { CtaSection } from "@/widgets/landing/ui/cta-section";

export const metadata: Metadata = {
	title: "Taskmanly — Collaborative Workspace for Pages, Databases & AI",
	description:
		"Taskmanly combines flexible documents, structured relational databases, teamspaces, web publishing, and AI in one connected workspace.",
};

export default function HomePage() {
	return (
		<div className='flex flex-col gap-0'>
			{/* 1. Hero & Interactive Product Preview Mockup */}
			<HeroSection />

			{/* 2. Everything In One Place Section (6 Core Features) */}
			<FeaturesGrid />

			{/* 3. Alternating Workflow Showcases (Pages, Database, Collaboration) */}
			<FeatureShowcases />

			{/* 4. Templates Showcase */}
			<HomeTemplatesShowcase />

			{/* 5. AI Assistant Showcase */}
			<HomeAiShowcase />

			{/* 6. Web Publishing Showcase */}
			<HomePublishShowcase />

			{/* 7. Final Call to Action */}
			<CtaSection />
		</div>
	);
}
