import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<div className='bg-sidebar'>
			<div className='pt-5 block pl-5'>
				<Link href='/' className='flex items-center gap-2'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10'>
						<LayoutGrid className='h-4 w-4 text-white' />
					</div>
					<span className='text-sm font-semibold tracking-wide'>
						Taskmanly
					</span>
				</Link>
			</div>

			<div className='min-h-screen w-full flex items-center justify-center px-4'>
				{children}
			</div>
		</div>
	);
};

export default layout;
