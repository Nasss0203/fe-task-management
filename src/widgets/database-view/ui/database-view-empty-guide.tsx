import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DatabaseViewEmptyGuideProps {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: ReactNode;
}

/** Explains what a view needs (e.g. a Status or Date property) and offers to create it. */
export function DatabaseViewEmptyGuide({
	icon: Icon,
	title,
	description,
	children,
}: DatabaseViewEmptyGuideProps) {
	return (
		<div className='flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center'>
			<span className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
				<Icon className='size-5' />
			</span>
			<div className='max-w-sm space-y-1'>
				<p className='text-sm font-medium'>{title}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
			{children && (
				<div className='flex flex-wrap justify-center gap-2'>{children}</div>
			)}
		</div>
	);
}
