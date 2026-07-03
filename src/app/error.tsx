"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Global Application Error:", error);
	}, [error]);

	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center'>
			<div className='flex flex-col items-center max-w-md w-full'>
				<h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
					Đã có lỗi xảy ra
				</h1>

				<h2 className='mt-2 text-lg font-medium text-muted-foreground'>
					Hệ thống gặp sự cố không mong muốn
				</h2>

				<p className='mt-4 text-sm leading-relaxed text-muted-foreground/80'>
					Xin lỗi vì sự bất tiện này. Chúng tôi đã ghi nhận lỗi và sẽ
					khắc phục sớm nhất có thể. Bạn có thể thử tải lại trang hoặc
					quay về trang chủ.
				</p>

				<div className='mt-6 w-full rounded-lg border border-border bg-muted/40 p-4 text-left shadow-sm'>
					<p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5'>
						Trạng thái:
					</p>
					<p className='text-sm text-foreground leading-relaxed'>
						Không thể tải nội dung lúc này. Vui lòng thử lại sau ít phút.
					</p>
				</div>

				<div className='mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center'>
					<Button
						onClick={() => reset()}
						className='h-10 rounded-lg px-6 bg-foreground text-background hover:bg-foreground/90 transition-colors'
					>
						<RefreshCw className='mr-2 h-4 w-4' />
						Thử lại ngay
					</Button>

					<Button
						asChild
						variant='outline'
						className='h-10 rounded-lg px-6 border-border hover:bg-accent transition-colors'
					>
						<Link href='/'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Về Trang chủ
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
