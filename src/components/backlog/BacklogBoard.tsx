"use client";

import { Filter, Search } from "lucide-react";
import BacklogSection from "./BacklogSection";

const BacklogBoard = () => {
	return (
		<div className=' text-white'>
			<div className='flex flex-col gap-5 p-2'>
				{/* toolbar */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-57.5 items-center gap-2 rounded-md border border-[#343741] bg-[#22242b] px-3 text-[#9ca3af]'>
							<Search size={18} />
							<input
								placeholder='Search backlog'
								className='w-full bg-transparent text-sm text-[#e5e7eb] outline-none placeholder:text-[#9ca3af]'
							/>
						</div>

						<button className='inline-flex h-10 items-center gap-2 rounded-md border border-[#343741] bg-[#22242b] px-4 text-sm font-medium text-[#d4d4d8] hover:bg-[#2a2d35]'>
							<Filter size={16} />
						</button>
					</div>
				</div>

				{/* sections */}
				<div className='flex flex-col gap-7'>
					{/* {sprints.map((sprint: SprintItem) => (
						<SprintSection key={sprint.id} sprint={sprint} />
					))} */}

					<BacklogSection />
				</div>
			</div>
		</div>
	);
};

export default BacklogBoard;
