import { Check, ChevronRight, Users, X } from "lucide-react";
import type { MemberOption } from "../drawer/task-detail/task-detail-types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface PopoverAssignMember {
	assigneeOpen: boolean;
	isUpdatingTask: boolean;
	firstAssignee: MemberOption;
	firstAssigneeName: string;
	extraAssigneeCount: number;
	selectedMembers: MemberOption[];
	members: MemberOption[];
	selectedAssigneeIds: string[];
	getInitials: (name?: string) => string;
	setAssigneeOpen: React.Dispatch<React.SetStateAction<boolean>>;
	handleToggleAssignee: (memberId: string) => Promise<void>;
}

const PopoverAssignMember = ({
	assigneeOpen,
	setAssigneeOpen,
	isUpdatingTask,
	firstAssignee,
	firstAssigneeName,
	extraAssigneeCount,
	getInitials,
	selectedMembers,
	handleToggleAssignee,
	members,
	selectedAssigneeIds,
}: PopoverAssignMember) => {
	return (
		<Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					disabled={isUpdatingTask}
					className='flex min-h-10 w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-medium text-neutral-200 transition-colors hover:bg-white/4 disabled:opacity-60'
				>
					{firstAssignee ? (
						<>
							<Avatar className='size-7 border border-white/10'>
								<AvatarImage
									src={firstAssignee.avatarUrl ?? undefined}
									alt={firstAssigneeName}
								/>
								<AvatarFallback className='bg-neutral-800 text-[11px] text-neutral-200'>
									{getInitials(firstAssigneeName)}
								</AvatarFallback>
							</Avatar>
							<span className='truncate'>
								{firstAssigneeName}
							</span>
							{extraAssigneeCount > 0 ? (
								<span className='text-neutral-400'>
									+ {extraAssigneeCount}
								</span>
							) : null}
						</>
					) : (
						<span className='text-neutral-500'>Trống</span>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				align='start'
				sideOffset={10}
				className='w-80 rounded-xl border border-white/10 bg-[#232323] p-0 shadow-2xl'
			>
				<div className='border-b border-white/8 px-3 py-3'>
					<div className='flex flex-wrap gap-2'>
						{selectedMembers.length > 0 ? (
							selectedMembers.map((member) => (
								<div
									key={member.id}
									className='inline-flex items-center gap-2 rounded-full bg-white/4 px-2 py-1 text-sm text-neutral-100'
								>
									<Avatar className='size-6 border border-white/10'>
										<AvatarImage
											src={member.avatarUrl ?? undefined}
											alt={member.name}
										/>
										<AvatarFallback className='bg-neutral-800 text-[10px] text-neutral-200'>
											{getInitials(member.name)}
										</AvatarFallback>
									</Avatar>
									<span className='max-w-28 truncate'>
										{member.name}
									</span>
									<button
										type='button'
										onClick={(event) => {
											event.stopPropagation();
											void handleToggleAssignee(
												member.id,
											);
										}}
										className='text-neutral-500 transition-colors hover:text-white'
									>
										<X className='size-3.5' />
									</button>
								</div>
							))
						) : (
							<span className='text-sm text-neutral-500'>
								Chưa có người được giao
							</span>
						)}
					</div>
				</div>

				<Command className='bg-transparent'>
					<CommandInput placeholder='Tìm người...' className='h-11' />

					<CommandList className='max-h-64'>
						<CommandEmpty>
							Không có kết quả phù hợp trong workspace.
						</CommandEmpty>

						<CommandGroup heading='Người' className='px-2 pb-2'>
							{members.map((member) => {
								const checked = selectedAssigneeIds.includes(
									member.id,
								);

								return (
									<CommandItem
										key={member.id}
										value={`${member.name} ${member.email ?? ""}`}
										onSelect={() => {
											void handleToggleAssignee(
												member.id,
											);
										}}
										className='cursor-pointer rounded-lg px-2 py-2'
									>
										<Avatar className='size-7 border border-white/10'>
											<AvatarImage
												src={
													member.avatarUrl ??
													undefined
												}
											/>
											<AvatarFallback className='bg-neutral-800 text-[10px] text-neutral-200'>
												{getInitials(member.name)}
											</AvatarFallback>
										</Avatar>

										<div className='min-w-0 flex-1'>
											<div className='truncate text-sm font-medium text-neutral-100'>
												{member.name}
												{member.isMe ? (
													<span className='ml-1 text-neutral-500'>
														(Bạn)
													</span>
												) : null}
											</div>
											{member.email ? (
												<div className='truncate text-xs text-neutral-500'>
													{member.email}
												</div>
											) : null}
										</div>

										<div className='flex size-5 items-center justify-center'>
											{checked ? (
												<Check className='size-4 text-blue-400' />
											) : null}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>

				<div className='border-t border-white/8 p-2'>
					<button
						type='button'
						className='flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/4 hover:text-white'
					>
						<div className='flex size-8 items-center justify-center rounded-full border border-white/10 text-neutral-400'>
							<Users className='size-4' />
						</div>
						<span className='flex-1 text-left'>Mời người dùng</span>
						<ChevronRight className='size-4 text-neutral-500' />
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PopoverAssignMember;
