import { ChevronDown, Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";

const BacklogSection = () => {
	return (
		<div className='overflow-hidden rounded-md border border-[#2b2e36] bg-[#191b20]'>
			<div className='flex items-center justify-between gap-4 border-b border-[#2f323a] bg-[#15171b] p-3'>
				<div className='flex items-center gap-3 text-sm px-4'>
					<Checkbox />
					<ChevronDown size={16} className='text-[#9ca3af]' />

					<div className='flex items-center gap-2 text-[#e5e7eb]'>
						<span className='font-semibold'>Backlog</span>
						<span className='text-[#a1a1aa]'>(2 work items)</span>
					</div>
				</div>

				<div className='flex items-center gap-3'>
					<button className='rounded-md border border-[#3b3f48] bg-[#1b1d22] px-4 py-1.5 text-sm font-medium text-[#d4d4d8] hover:bg-[#23262d]'>
						Create sprint
					</button>

					<button className='text-[#a1a1aa] hover:text-white'>
						<MoreHorizontal size={18} />
					</button>
				</div>
			</div>

			<div className='p-3 flex flex-col gap-y-2'>
				<div className='flex flex-col'>
					{/* <div className='min-h-24 rounded-sm border border-dashed border-[#3b3f48] bg-[#23252c]' /> */}
					{Array(4)
						.fill(0)
						.map((item, index) => (
							<div
								className='flex flex-col px-4 py-1 border-[#3b3f48] bg-[#23252c] border '
								key={index}
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Checkbox></Checkbox>
										<div className='text-sm'>Title</div>
									</div>
									<div className='flex items-center gap-10'>
										<div className='flex items-center gap-2'>
											<NativeSelect>
												<NativeSelectOption value='apple'>
													Todo
												</NativeSelectOption>
												<NativeSelectOption value='banana'>
													In progress
												</NativeSelectOption>
												<NativeSelectOption value='blueberry'>
													Done
												</NativeSelectOption>
											</NativeSelect>
											<NativeSelect>
												<NativeSelectOption value='apple'>
													Todo
												</NativeSelectOption>
												<NativeSelectOption value='banana'>
													In progress
												</NativeSelectOption>
												<NativeSelectOption value='blueberry'>
													Done
												</NativeSelectOption>
											</NativeSelect>
										</div>
										<div className='flex items-center gap-2'>
											<Avatar>
												<AvatarImage
													src='https://github.com/shadcn.png'
													alt='@shadcn'
												/>
												<AvatarFallback>
													CN
												</AvatarFallback>
												<AvatarBadge className='bg-green-600 dark:bg-green-800' />
											</Avatar>

											<Ellipsis />
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
				<div className='p-2 flex items-center gap-2 hover:bg-accent rounded-md cursor-pointer'>
					<Plus size={14}></Plus>
					<div>Create</div>
				</div>
			</div>
		</div>
	);
};

export default BacklogSection;
