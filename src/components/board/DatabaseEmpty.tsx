import { Table } from "lucide-react";

const DatabaseEmpty = () => {
	return (
		<button
			type='button'
			className='flex h-18 w-full items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-left transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-900 cursor-pointer'
		>
			<div className='flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300'>
				<Table size={14} />
			</div>

			<div className='flex flex-col'>
				<span className='text-sm font-medium text-white'>
					Cơ sở dữ liệu trống
				</span>
				<span className='text-xs text-neutral-500'>
					Bắt đầu với bảng mới
				</span>
			</div>
		</button>
	);
};

export default DatabaseEmpty;
