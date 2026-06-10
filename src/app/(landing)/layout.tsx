import Footer from "@/features/landing/components/landing/footer/Footer";
import { HeaderLanding } from "@/features/landing/components/landing/header";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<main className='min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30'>
			<div className='relative overflow-hidden'>
				{/* Refined Background Mesh */}
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_50%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.02),transparent_50%)]' />
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]' />

				<div className='relative mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8'>
					<HeaderLanding />
					{children}
					<Footer />
				</div>
			</div>
		</main>
	);
};

export default layout;
