import Footer from "@/components/landing/footer/Footer";
import { HeaderLanding } from "@/components/landing/header";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<main className='min-h-screen bg-black text-white'>
			<section className='relative overflow-hidden'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_45%)]' />
				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[56px_56px] opacity-35' />
				<div className='absolute left-1/2 -top-30 h-65 w-65 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]' />
				<div className='relative mx-auto max-w-7xl px-6 pb-0 pt-6 lg:px-8'>
					<HeaderLanding></HeaderLanding>
					{children}
					<Footer></Footer>
				</div>
			</section>
		</main>
	);
};

export default layout;
