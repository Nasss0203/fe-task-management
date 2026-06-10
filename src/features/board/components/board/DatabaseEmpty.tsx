import { Table } from "lucide-react";

const DatabaseEmpty = () => {
	return (
		<button
			type='button'
			className='group flex h-20 w-full items-center gap-4 rounded-2xl border border-border/50 bg-muted/10 px-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted/30 hover:border-blue-500/30 hover:shadow-sm hover:shadow-blue-500/5 cursor-pointer'
		>
			<div className='flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-600'>
				<Table size={18} />
			</div>

			<div className='flex flex-col'>
				<span className='text-[15px] font-semibold text-foreground mb-0.5'>
					Cơ sở dữ liệu trống
				</span>
				<span className='text-[13px] text-muted-foreground'>
					Bắt đầu với bảng mới
				</span>
			</div>
		</button>
	);
};

export default DatabaseEmpty;
