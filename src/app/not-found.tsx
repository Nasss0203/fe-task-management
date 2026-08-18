import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

import { Button } from "@/shared/ui/button";

export default function NotFound() {
	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center'>
			<div className='flex w-full max-w-md flex-col items-center'>
				<h1 className='select-none text-[100px] font-black leading-none text-muted-foreground/30'>
					404
				</h1>

				<h2 className='mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
					Page not found
				</h2>

				<p className='mt-2 max-w-xs text-sm text-muted-foreground/80'>
					The page you are looking for does not exist or has moved.
				</p>

				<div className='mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row'>
					<Button
						asChild
						className='h-10 rounded-lg bg-foreground px-6 text-background transition-colors hover:bg-foreground/90'
					>
						<Link href='/'>
							<Home className='mr-2 h-4 w-4' />
							Back to home
						</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						className='h-10 rounded-lg border-border px-6 transition-colors hover:bg-accent'
					>
						<Link href='/sign-in'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Sign in
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
