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
			<div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent_70%)]' />
			<div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(59,130,246,0.06),transparent_70%)]' />

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
