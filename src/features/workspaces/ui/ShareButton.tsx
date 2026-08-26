import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	Clock,
	Copy,
	School,
	SquareArrowOutUpRight,
	Users,
} from "lucide-react";

const ShareButton = () => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button className='flex items-center gap-1 text-xs px-2 py-1.5 hover:bg-neutral-900 rounded-md cursor-pointer'>
					<SquareArrowOutUpRight size={12} />
					Share
				</button>
			</PopoverTrigger>
			<PopoverContent
				align='end'
				side='bottom'
				className='w-[420px] p-0 rounded-md'
			>
				{/* Header */}
				<div className='flex items-center gap-2 px-4 py-3.5 border-b'>
					<Users className='h-4 w-4 text-[#5B4FE0]' />
					<span className='text-[13px] font-medium'>
						Chia sẻ tài liệu
					</span>
				</div>

				<div className='p-4 space-y-3.5'>
					{/* Mời qua email */}
					<div className='flex gap-2'>
						<Input
							placeholder='Nhập email hoặc chọn lớp/nhóm'
							className='flex-1 h-8.5 text-[13px] rounded-md'
						/>
						<Button className='text-[13px] rounded-md bg-[#5B4FE0] hover:bg-[#4B3FD0] text-white'>
							Mời
						</Button>
					</div>

					{/* Chủ sở hữu */}
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2.5'>
							<div className='h-7 w-7 rounded-md bg-[#5B4FE0] text-white flex items-center justify-center text-xs font-medium'>
								N
							</div>
							<div className='text-[13px]'>
								<span className='font-medium'>nguyen nam</span>{" "}
								<span className='text-muted-foreground'>
									(Bạn)
								</span>
								<p className='text-[11px] text-muted-foreground'>
									Chủ sở hữu
								</p>
							</div>
						</div>
						<span className='text-[11px] font-medium text-[#5B4FE0] bg-[#5B4FE0]/10 px-2 py-0.5 rounded'>
							Toàn quyền
						</span>
					</div>

					{/* Chia sẻ theo lớp — tính năng riêng */}
					<div className='border-t border-dashed pt-3'>
						<div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-2'>
							<School className='h-3.5 w-3.5' />
							Chia sẻ theo lớp
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-[13px] font-medium'>
								Lớp CNTT-K18
							</span>
							<Select defaultValue='view'>
								<SelectTrigger className='w-auto h-auto border-none shadow-none text-xs text-muted-foreground p-0 gap-1'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='view'>
										Chỉ xem
									</SelectItem>
									<SelectItem value='comment'>
										Bình luận
									</SelectItem>
									<SelectItem value='edit'>
										Chỉnh sửa
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Link hết hạn — tính năng riêng */}
					<div className='flex items-center justify-between bg-muted rounded-md px-3 py-2.5'>
						<div className='flex items-center gap-2 text-xs'>
							<Clock className='h-3.5 w-3.5 text-muted-foreground' />
							Link hết hạn sau
						</div>
						<Select defaultValue='7d'>
							<SelectTrigger className='w-auto h-auto border-none shadow-none text-xs p-0 gap-1'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='7d'>7 ngày</SelectItem>
								<SelectItem value='30d'>30 ngày</SelectItem>
								<SelectItem value='never'>
									Không giới hạn
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Footer */}
				<div className='border-t px-4 py-2.5 flex justify-end'>
					<Button
						variant='outline'
						size='sm'
						className='gap-1.5 text-xs h-7 rounded-md'
					>
						<Copy className='h-3.5 w-3.5' />
						Sao chép liên kết
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ShareButton;
