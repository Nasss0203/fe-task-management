import React from "react";
import { LayoutTemplate } from "lucide-react";

export function TemplatesHeader() {
	return (
		<div className='flex flex-col gap-1.5'>
			<div className='inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-0.5'>
				<LayoutTemplate className='size-3.5' />
				<span>Template Gallery</span>
			</div>
			<h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
				Templates
			</h1>
			<p className='text-sm text-muted-foreground'>
				Discover, reuse, and manage templates.
			</p>
		</div>
	);
}
