import type { ReactNode } from "react";

export default function PublicLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<main className='min-h-screen bg-background text-foreground'>
			{children}
		</main>
	);
}
