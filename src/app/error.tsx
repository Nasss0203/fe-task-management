"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, ServerCrash } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Global Application Error:", error);
	}, [error]);

	return (
		<main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background'>
			{/* Ambient Light Blob (Red tint for error) */}
			<div className='pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 opacity-50 blur-[100px] dark:bg-red-500/15 dark:opacity-40' />

			<div className='relative z-10 flex flex-col items-center px-6 text-center'>
				{/* Floating Icon */}
				<div className='mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 shadow-sm ring-1 ring-red-500/20 backdrop-blur-sm'>
					<ServerCrash className='h-12 w-12 text-red-500' />
				</div>

				<h1 className='mb-4 bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-5xl font-black tracking-tighter text-transparent sm:text-7xl'>
					Đã có lỗi xảy ra
				</h1>

				<h2 className='mb-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
					Hệ thống gặp sự cố không mong muốn
				</h2>

				<p className='mb-8 max-w-[480px] text-base leading-relaxed text-muted-foreground'>
					Xin lỗi vì sự bất tiện này. Chúng tôi đã ghi nhận lỗi và sẽ
					khắc phục sớm nhất có thể. Bạn có thể thử tải lại trang hoặc
					quay về trang chủ.
				</p>

				{/* Error Code Details (Useful for debugging) */}
				{error.message && (
					<div className='mb-10 max-w-lg rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left shadow-inner'>
						<p className='mb-1 text-[11px] font-bold uppercase tracking-widest text-red-500/70'>
							Chi tiết lỗi:
						</p>
						<p className='font-mono text-sm text-red-500/90 break-words'>
							{error.message}
						</p>
					</div>
				)}

				<div className='flex flex-col items-center gap-4 sm:flex-row'>
					<Button
						size='lg'
						onClick={() => reset()}
						className='h-12 rounded-full px-8 shadow-lg transition-all hover:shadow-xl hover:bg-red-600 hover:text-white bg-foreground text-background'
					>
						<RefreshCw className='mr-2 h-4 w-4' />
						Thử lại ngay
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
