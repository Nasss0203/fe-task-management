import { DetailRow } from "@/components/drawer/task-detail/task-detail-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { getInitials } from "@/utils";
import { Check, ChevronDown, Users, X } from "lucide-react";
import { MemberOption } from "../types/type";

interface TaskAssigneeFieldProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isUpdatingTask: boolean;
	selectedMembers: MemberOption[];
	members: MemberOption[];
	selectedAssigneeIds: string[];
	onToggleAssignee: (memberId: string) => Promise<void>;
	onUnassignAssignee: (memberId: string) => Promise<void>;
}

export function TaskAssigneeField({
	open,
	onOpenChange,
	isUpdatingTask,
	selectedMembers,
	members,
	selectedAssigneeIds,
	onToggleAssignee,
	onUnassignAssignee,
}: TaskAssigneeFieldProps) {
	return (
		<DetailRow icon={Users} label='Assignee'>
			<div className='flex flex-wrap items-center gap-3'>
				<Popover open={open} onOpenChange={onOpenChange}>
					<PopoverTrigger asChild>
						<button
							type='button'
							disabled={isUpdatingTask}
							className='flex min-h-10 flex-wrap items-center gap-2 rounded-2xl px-0 py-0 text-left disabled:opacity-60'
						>
							{selectedMembers.length ? (
								selectedMembers.map((member) => (
									<div
										key={member.id}
										className='inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1.5 text-sm text-foreground'
									>
										<Avatar className='size-7 border border-border'>
											<AvatarImage
												src={
													member.avatarUrl ??
													undefined
												}
												alt={member.name}
											/>
											<AvatarFallback className='bg-muted text-[11px] font-semibold text-foreground'>
												{getInitials(member.name)}
											</AvatarFallback>
										</Avatar>
										<span className='max-w-32 truncate font-medium'>
											{member.name}
										</span>
									</div>
								))
							) : (
								<div className='rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 cursor-pointer'>
									No assignee
								</div>
							)}
							<ChevronDown className='size-4 text-muted-foreground cursor-pointer' />
						</button>
					</PopoverTrigger>

					<PopoverContent
						align='start'
						sideOffset={12}
						className='w-[340px] rounded-2xl border border-border bg-popover p-0 shadow-md'
					>
						<div className='border-b border-border px-4 py-3'>
							<div className='flex flex-wrap gap-2'>
								{selectedMembers.length ? (
									selectedMembers.map((member) => (
										<div
											key={member.id}
											className='inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-sm text-foreground'
										>
											<Avatar className='size-6 border border-border'>
												<AvatarImage
													src={
														member.avatarUrl ??
														undefined
													}
													alt={member.name}
												/>
												<AvatarFallback className='bg-muted text-[10px] font-semibold text-foreground'>
													{getInitials(member.name)}
												</AvatarFallback>
											</Avatar>
											<span className='max-w-28 truncate'>
												{member.name}
											</span>

											<button
												type='button'
												disabled={isUpdatingTask}
												onClick={(event) => {
													event.stopPropagation();
													void onUnassignAssignee(
														member.id,
													);
												}}
												className='cursor-pointer text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-50'
												aria-label={`Unassign ${member.name}`}
											>
												<X size={12} />
											</button>
										</div>
									))
								) : (
									<span className='text-sm text-muted-foreground'>
										No one assigned yet
									</span>
								)}
							</div>
						</div>

						<Command className='bg-transparent'>
							<CommandInput placeholder='Search member...' />
							<CommandList className='max-h-64 p-1'>
								<CommandEmpty>
									No member found in this workspace.
								</CommandEmpty>
								<CommandGroup heading='Members'>
									{members.map((member) => {
										const checked =
											selectedAssigneeIds.includes(
												member.id,
											);

										return (
											<CommandItem
												key={member.id}
												value={`${member.name} ${member.email ?? ""}`}
												onSelect={() => {
													void onToggleAssignee(
														member.id,
													);
												}}
												className='cursor-pointer rounded-xl px-3 py-2.5 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground'
											>
												<Avatar className='size-8 border border-border'>
													<AvatarImage
														src={
															member.avatarUrl ??
															undefined
														}
														alt={member.name}
													/>
													<AvatarFallback className='bg-muted text-[10px] font-semibold text-foreground'>
														{getInitials(
															member.name,
														)}
													</AvatarFallback>
												</Avatar>
												<div className='min-w-0 flex-1'>
													<div className='truncate text-sm font-medium text-foreground'>
														{member.name}
														{member.isMe ? (
															<span className='ml-1 text-muted-foreground'>
																(you)
															</span>
														) : null}
													</div>
													{member.email ? (
														<div className='truncate text-xs text-muted-foreground'>
															{member.email}
														</div>
													) : null}
												</div>
												{checked ? (
													<Check className='size-4 text-primary' />
												) : null}
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</DetailRow>
	);
}
