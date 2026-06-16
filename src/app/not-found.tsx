import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center'>
			<div className='flex flex-col items-center max-w-md w-full'>
				<h1 className='text-[100px] font-black leading-none text-muted-foreground/30 select-none'>
					404
				</h1>

				<h2 className='mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
					Không tìm thấy trang
				</h2>

				<p className='mt-2 text-sm text-muted-foreground/80 max-w-xs'>
					Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
				</p>

				<div className='mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center'>
					<Button
						asChild
						className='h-10 rounded-lg px-6 bg-foreground text-background hover:bg-foreground/90 transition-colors'
					>
						<Link href='/dashboard'>
							<Home className='mr-2 h-4 w-4' />
							Về Dashboard
						</Link>
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
