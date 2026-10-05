import React from "react";
import Footer from "@/widgets/landing/footer";
import { HeaderLanding } from "@/widgets/landing/header";

export default function LandingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 relative overflow-x-hidden'>
			{/* Subtle ambient lighting mesh */}
			<div
				aria-hidden='true'
				className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent_70%)]'
			/>

			{/* Sticky Header */}
			<div className='pt-3 px-4 sm:px-6 sticky top-0 z-50'>
				<HeaderLanding />
			</div>

			{/* Main Content Area */}
			<main className='flex-1 relative z-10'>{children}</main>

			{/* Public Footer */}
			<Footer />
		</div>
	);
}
