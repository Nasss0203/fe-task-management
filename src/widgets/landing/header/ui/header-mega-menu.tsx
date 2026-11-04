import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";

export type MegaMenuItemType = {
	title: string;
	description: string;
	icon: ReactNode;
	href: string;
};

type HeaderMegaMenuProps = {
	label: string;
	items: MegaMenuItemType[];
};

export default function HeaderMegaMenu({ label, items }: HeaderMegaMenuProps) {
	return (
		<div className='group relative flex items-center gap-1 py-4'>
			{/* Trigger */}
			<button className='flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group-hover:text-foreground outline-none'>
				<span>{label}</span>
				<ChevronDown className='h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:rotate-180' />
			</button>

			{/* Dropdown Content */}
			<div className='absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 invisible transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 w-max max-w-sm sm:max-w-md lg:max-w-lg'>
				<div className='overflow-hidden rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-soft p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
					{items.map((item) => (
						<Link
							key={item.title}
							href={item.href}
							className='flex items-start gap-3 rounded-lg p-2.5 hover:bg-secondary/80 transition-colors'
						>
							<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/80 bg-secondary/70 text-foreground'>
								{item.icon}
							</div>
							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-foreground'>
									{item.title}
								</span>
								<span className='text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5'>
									{item.description}
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
