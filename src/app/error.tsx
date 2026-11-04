"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
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
			<div className='flex flex-col items-center max-w-md w-full rounded-xl border border-border bg-card p-6 sm:p-8'>
				<h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
					Đã có lỗi xảy ra
				</h1>

				<h2 className='mt-1.5 text-sm font-medium text-muted-foreground'>
					Hệ thống gặp sự cố không mong muốn
				</h2>

				<p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
					Xin lỗi vì sự bất tiện này. Chúng tôi đã ghi nhận lỗi và sẽ
					khắc phục sớm nhất có thể. Bạn có thể thử tải lại trang hoặc
					quay về trang chủ.
				</p>

				<div className='mt-5 w-full rounded-lg border border-border bg-muted/40 p-3.5 text-left'>
					<p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
						Trạng thái:
					</p>
					<p className='text-xs text-foreground leading-relaxed'>
						Không thể tải nội dung lúc này. Vui lòng thử lại sau ít phút.
					</p>
				</div>

				<div className='mt-6 flex flex-col sm:flex-row gap-2.5 w-full justify-center'>
					<Button
						onClick={() => reset()}
						className='h-9 rounded-lg px-5 bg-foreground text-background hover:bg-foreground/90 transition-colors'
					>
						<RefreshCw className='mr-2 h-3.5 w-3.5' />
						Thử lại ngay
					</Button>

					<Button
						asChild
						variant='outline'
						className='h-9 rounded-lg px-5 border-border hover:bg-accent transition-colors'
					>
						<Link href='/'>
							<ArrowLeft className='mr-2 h-3.5 w-3.5' />
							Về Trang chủ
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
