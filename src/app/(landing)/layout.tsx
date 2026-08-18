import Footer from "@/widgets/landing/footer";
import { HeaderLanding } from "@/widgets/landing/header";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<main className='min-h-screen bg-background text-foreground selection:bg-primary/30'>
			<div className='relative overflow-clip'>
				{/* Refined Background Mesh */}
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)_12%,transparent_50%),radial-gradient(circle_at_bottom,var(--color-secondary)_2%,transparent_50%)] opacity-20' />
				<div className='absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-30' />

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
