import { Rocket, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Banner = () => {
	return (
		<div className='mx-auto grid max-w-7xl items-center gap-16 pt-20 lg:grid-cols-2 lg:pt-32 pb-20'>
			<div className='flex flex-col items-start text-left'>
				<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary backdrop-blur-md transition-colors hover:bg-primary/10'>
					<Rocket className='h-4 w-4' />
					Công việc & Ghi chú, cuối cùng cũng hợp nhất
				</div>

				<h1 className='max-w-2xl text-6xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-[4.5rem]'>
					Nơi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">công việc</span> của bạn thực sự diễn ra.
				</h1>

				<p className='mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-muted-foreground'>
					Một không gian làm việc thống nhất nơi đội ngũ của bạn lập kế hoạch dự án, soạn thảo tài liệu và theo dõi tiến độ mà không cần chuyển đổi ứng dụng.
				</p>

				<div className='mt-10 flex flex-col gap-4 sm:flex-row w-full sm:w-auto'>
					<Button
						size='lg'
						className='h-14 min-w-[180px] rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.98]'
					>
						Bắt đầu ngay <Sparkles className="ml-2 h-4 w-4" />
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='h-14 min-w-[180px] rounded-full border-border bg-background/50 text-base font-semibold text-foreground backdrop-blur-md transition-all hover:bg-muted active:scale-[0.98]'
					>
						Dùng thử miễn phí
					</Button>
				</div>
			</div>

			<div className='relative hidden lg:block'>
				<div className='absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 opacity-60 blur-3xl dark:opacity-30 transition-opacity'></div>
				
				<div className='relative aspect-square rounded-[2rem] border border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden'>
					<div className='flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/20'>
						<div className='flex gap-2'>
							<div className='h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]' />
							<div className='h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.3)]' />
							<div className='h-3 w-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.3)]' />
						</div>
						<div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
							Dự án Alpha
						</div>
					</div>
					<div className='flex-1 grid grid-cols-5 p-6 gap-6 relative'>
						{/* Task List Side */}
						<div className='col-span-2 space-y-5 pt-2'>
							<div className='h-5 w-2/3 bg-foreground/10 rounded-md mb-8 shadow-inner' />
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className='flex items-center gap-4 group cursor-pointer'>
									{i <= 2 ? (
										<CheckCircle2 className="h-5 w-5 text-primary drop-shadow-sm" />
									) : (
										<Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
									)}
									<div className={`h-2.5 rounded-full transition-all ${i <= 2 ? 'w-full bg-primary/40' : 'w-5/6 bg-foreground/5 group-hover:bg-foreground/15'}`} />
								</div>
							))}
						</div>
						{/* Note Side */}
						<div className='col-span-3 border-l border-border/40 pl-6 space-y-6 pt-2'>
							<div className='h-7 w-3/4 bg-foreground/15 rounded-md mb-8 shadow-inner' />
							<div className='space-y-4'>
								<div className='h-2.5 w-full bg-foreground/10 rounded-full' />
								<div className='h-2.5 w-5/6 bg-foreground/10 rounded-full' />
								<div className='h-2.5 w-4/6 bg-foreground/10 rounded-full' />
							</div>
							<div className='mt-10 h-36 w-full rounded-2xl border border-border/50 bg-background/50 p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer'>
								<div className='flex items-center gap-3 mb-5'>
									<div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center'>
										<div className='h-3 w-3 rounded-sm bg-primary' />
									</div>
									<div className='h-3 w-24 bg-foreground/15 rounded-full' />
								</div>
								<div className='h-2.5 w-full bg-foreground/10 rounded-full mb-4' />
								<div className='h-2.5 w-2/3 bg-foreground/10 rounded-full' />
							</div>
						</div>
						
						{/* Floating cursor mockup (micro detail) */}
						<div className="absolute bottom-10 right-10 flex items-center gap-2 drop-shadow-lg">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary translate-y-1">
								<path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.5 3.21Z" fill="currentColor"/>
							</svg>
							<div className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">Alex</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Banner;
