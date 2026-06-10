import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
	return (
		<div className='rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground'>
			{children}
		</div>
	);
}
