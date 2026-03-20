import { Ellipsis, Plus } from "lucide-react";
import { FaRegStar, FaStar } from "react-icons/fa";
import {
	DialogContentV2,
	DialogDescriptionV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
	DialogV2,
} from "./dialog-custom";

const DialogTask = () => {
	return (
		<DialogV2>
			<DialogTriggerV2 asChild>
				<Plus size={16} className='hover:bg-neutral-700 rounded-xs' />
			</DialogTriggerV2>
			<DialogContentV2 showCloseButton={false}>
				<DialogHeaderV2>
					<DialogTitleV2>
						<div className='flex items-center justify-between'>
							<div className=''>
								<div className='flex items-center gap-3'>
									<div className='font-normal text-lg text-neutral-500'>
										Add to
									</div>
									<div className='text-lg'>
										Project task management
									</div>
								</div>
							</div>
							<div>
								<div className='flex items-center gap-2'>
									<FaRegStar />
									<FaStar className='text-yellow-500' />
									<Ellipsis />
								</div>
							</div>
						</div>
					</DialogTitleV2>
					<DialogDescriptionV2>
						This dialog doesn&apos;t have a close button in the
						top-right corner.
					</DialogDescriptionV2>
				</DialogHeaderV2>
			</DialogContentV2>
		</DialogV2>
	);
};

export default DialogTask;
