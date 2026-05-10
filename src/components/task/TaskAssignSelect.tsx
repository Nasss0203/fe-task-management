"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

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
import { cn } from "@/lib/utils";

type MemberOption = {
	id: string;
	name: string;
	email?: string;
	avatarUrl?: string | null;
	isMe?: boolean;
};

type TaskAssigneeSelectProps = {
	members: MemberOption[];
	value: string[];
	onChange: (value: string[]) => void;
};

const getInitials = (name?: string) => {
	if (!name) return "?";

	return name
		.split(" ")
		.filter(Boolean)
		.map((item) => item[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};

export const TaskAssigneeSelect = ({
	members,
	value,
	onChange,
}: TaskAssigneeSelectProps) => {
	const [open, setOpen] = useState(false);

	const selectedMembers = useMemo(() => {
		return members.filter((member) => value.includes(member.id));
	}, [members, value]);

	const toggleMember = (memberId: string) => {
		if (value.includes(memberId)) {
			onChange(value.filter((id) => id !== memberId));
			return;
		}

		onChange([...value, memberId]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className={cn(
						"flex min-h-9 w-[calc(100%-30%)]  items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
						"text-muted-foreground hover:bg-accent hover:text-foreground",
					)}
				>
					{selectedMembers.length === 0 ? (
						<div>Trống</div>
					) : (
						<>
							<div className='flex -space-x-2'>
								{selectedMembers.slice(0, 3).map((member) => (
									<Avatar
										key={member.id}
										className='size-6 border border-background'
									>
										<AvatarImage
											src={member.avatarUrl ?? undefined}
										/>
										<AvatarFallback className='bg-neutral-800 text-[10px] text-neutral-200'>
											{getInitials(member.name)}
										</AvatarFallback>
									</Avatar>
								))}
							</div>

							<span className='max-w-[160px] truncate text-neutral-300'>
								{selectedMembers.length === 1
									? selectedMembers[0].name
									: `${selectedMembers.length} người được giao`}
							</span>
						</>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				align='start'
				sideOffset={8}
				className='w-60 rounded-xl border border-border bg-popover p-0 shadow-xl'
			>
				<Command className='bg-transparent'>
					<CommandInput
						placeholder='Tìm kiếm thành viên...'
						className='h-11'
					/>

					<CommandList>
						<CommandEmpty>Không tìm thấy thành viên.</CommandEmpty>

						<CommandGroup
							heading='Thành viên'
							className='px-2 pb-2'
						>
							{members.map((member) => {
								const checked = value.includes(member.id);

								return (
									<CommandItem
										key={member.id}
										value={`${member.name} ${member.email ?? ""}`}
										onSelect={() => toggleMember(member.id)}
										className='flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2'
									>
										<Avatar className='size-7 border border-border'>
											<AvatarImage
												src={
													member.avatarUrl ??
													undefined
												}
											/>
											<AvatarFallback className='bg-neutral-800 text-xs text-neutral-200'>
												{getInitials(member.name)}
											</AvatarFallback>
										</Avatar>

										<div className='min-w-0 flex-1'>
											<div className='truncate text-sm font-medium text-foreground'>
												{member.name}
												{member.isMe && (
													<span className='ml-1 text-muted-foreground'>
														(Bạn)
													</span>
												)}
											</div>

											{member.email && (
												<div className='truncate text-xs text-muted-foreground'>
													{member.email}
												</div>
											)}
										</div>

										<div className='flex size-5 items-center justify-center'>
											{checked && (
												<Check className='size-4 text-primary' />
											)}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
