import { Database } from "lucide-react";
import { useState } from "react";

import { BoardViewType } from "@/services/board/type";
import DatabaseEmpty from "../board/DatabaseEmpty";
import DatabaseRecommend from "../board/DatabaseRecommend";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
	DialogContentV2,
	DialogFooterV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
	DialogV2,
} from "./dialog-custom";

function DialogSelectBoard({
	onSelect,
	disabled,
}: {
	onSelect: (viewType: BoardViewType) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);

	const handleSelect = async (viewType: BoardViewType) => {
		if (disabled) return;

		await onSelect(viewType);
		setOpen(false);
	};

	return (
		<DialogV2 open={open} onOpenChange={setOpen}>
			<DialogTriggerV2 asChild>
				<Button variant='outline' disabled={disabled}>
					<Database />
					Cơ sở dữ liệu
				</Button>
			</DialogTriggerV2>

			<DialogContentV2 className='max-w-4xl! overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl p-0 shadow-2xl sm:rounded-2xl text-foreground'>
				<div className='flex h-[600px] flex-col'>
					{/* Header section with gradient background */}
					<div className='relative overflow-hidden border-b border-border/50 bg-muted/30 px-8 py-8 shrink-0'>
						<div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-transparent' />
						<div className='relative'>
							<DialogHeaderV2 className='mb-0 space-y-2'>
								<DialogTitleV2 className='text-2xl font-bold tracking-tight text-foreground'>
									Chọn cơ sở dữ liệu
								</DialogTitleV2>
								<div className="text-[14px] text-muted-foreground">
									Khởi tạo dự án của bạn từ một dữ liệu mẫu hoặc bắt đầu từ trang trắng.
								</div>
							</DialogHeaderV2>
						</div>
					</div>

					<div className='flex-1 min-h-0'>
						<ScrollArea className='h-full'>
							<div className='mx-auto flex max-w-5xl flex-col gap-10 py-10 px-10 pb-12'>
								<div className='grid grid-cols-2 gap-5'>
									<DatabaseEmpty />
									<DatabaseEmpty />
								</div>

								<div className='flex flex-col gap-4'>
									<div className='text-[13px] font-semibold text-foreground uppercase tracking-wider'>
										Được đề xuất
									</div>

									<div className='grid grid-cols-2 gap-5'>
										<DatabaseRecommend
											title='Board'
											onClick={() =>
												handleSelect(BoardViewType.BOARD)
											}
										/>
									</div>
								</div>
							</div>
						</ScrollArea>
					</div>
				</div>
			</DialogContentV2>
		</DialogV2>
	);
}

export default DialogSelectBoard;
