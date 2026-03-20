import Link from "next/link";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<div className='bg-sidebar'>
			<div className='pt-5 block'>
				<Link href={"/"} className='m-5'>
					LOGO
				</Link>
			</div>

			<div className='min-h-screen w-full flex items-center justify-center px-4'>
				{children}
			</div>
		</div>
	);
};

export default layout;
