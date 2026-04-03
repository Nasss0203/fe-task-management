import { Database } from "lucide-react";
import { useState } from "react";
import { BoardViewType } from "../block/ProjectBlock";
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

			<DialogContentV2 className='flex! h-[calc(100%-10%)] max-w-[calc(100%-40%)]! flex-col! overflow-hidden p-0'>
				<DialogHeaderV2 className='shrink-0 mt-5'>
					<DialogTitleV2 className='pl-10'>
						Chọn cơ sở dữ liệu
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 min-h-0'>
					<ScrollArea className='h-full'>
						<div className='mx-auto flex max-w-5xl flex-col gap-8 py-8 px-32 pb-10'>
							<div className='grid grid-cols-2 gap-4'>
								<DatabaseEmpty />
								<DatabaseEmpty />
							</div>

							<div className='flex flex-col gap-3'>
								<div className='text-sm font-medium text-neutral-300'>
									Được đề xuất
								</div>

								<div className='grid grid-cols-2 gap-4'>
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

				<DialogFooterV2 className='shrink-0 mt-5' />
			</DialogContentV2>
		</DialogV2>
	);
}

export default DialogSelectBoard;
