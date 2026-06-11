import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";

export default function NotFound() {
	return (
		<main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background'>
			{/* Ambient Light Blob */}
			<div className='pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 opacity-50 blur-[100px] dark:bg-primary/10 dark:opacity-40' />

			<div className='relative z-10 flex flex-col items-center px-6 text-center'>
				{/* Floating Icon */}
				<div className='mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 shadow-sm ring-1 ring-primary/20 backdrop-blur-sm'>
					<FileQuestion className='h-12 w-12 text-primary' />
				</div>

				<h1 className='mb-4 bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl'>
					404
				</h1>

				<h2 className='mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
					Không tìm thấy trang
				</h2>
				<div className='flex flex-col items-center gap-4 sm:flex-row'>
					<Button
						asChild
						size='lg'
						className='h-12 rounded-full px-8 shadow-lg transition-all hover:shadow-xl'
					>
						<Link href='/dashboard'>
							<Home className='mr-2 h-4 w-4' />
							Về Dashboard
						</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						size='lg'
						className='h-12 rounded-full px-8'
					>
						<Link href='/'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Về Trang chủ
						</Link>
					</Button>
				</div>
			</div>

			{/* Decorative dotted pattern */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 dark:opacity-10" />
		</main>
	);
}
