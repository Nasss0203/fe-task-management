"use client";

import { Check } from "lucide-react";

import { usePage } from "@/entities/page/model/page.queries";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface PersonCellProps {
	/** Page that owns the database; its workspace supplies the people list. */
	pageId: string;
	name: string;
	value: unknown;
	interactive: boolean;
	disabled?: boolean;
	onChange: (value: string[] | null) => void;
}

function PersonChip({ person }: { person: WorkspacePerson }) {
	return (
		<span className='inline-flex min-w-0 items-center gap-1.5'>
			<Avatar size='sm' className='size-5'>
				{person.avatar_url && <AvatarImage src={person.avatar_url} />}
				<AvatarFallback className='text-[10px]'>
					{person.full_name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<span className='truncate'>{person.full_name}</span>
		</span>
	);
}

export function PersonCell({
	pageId,
	name,
	value,
	interactive,
	disabled,
	onChange,
}: PersonCellProps) {
	const selectedIds = Array.isArray(value)
		? value.filter((id): id is string => typeof id === "string")
		: [];

	const { data: page } = usePage(pageId);
	const { data: people = [], isLoading } = useWorkspacePeople(
		page?.workspace_id ?? "",
		interactive || selectedIds.length > 0,
	);

	const selected = selectedIds
		.map((id) => people.find((person) => person.user_id === id))
		.filter((person): person is WorkspacePerson => Boolean(person));

	const chips = (
		<span className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
			{selected.map((person) => (
				<PersonChip key={person.user_id} person={person} />
			))}
		</span>
	);

	if (!interactive) {
		return <span className='block px-1'>{chips}</span>;
	}

	const toggle = (userId: string) => {
		const next = selectedIds.includes(userId)
			? selectedIds.filter((id) => id !== userId)
			: [...selectedIds, userId];
		onChange(next.length ? next : null);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={name}
					disabled={disabled}
					className='group/person flex min-h-8 w-full items-center rounded-sm px-1 text-left outline-none hover:bg-muted/60 focus-visible:bg-muted/60'
				>
					{selected.length ? (
						chips
					) : (
						<span className='text-muted-foreground opacity-0 group-hover/person:opacity-100 group-focus-visible/person:opacity-100'>
							Add people
						</span>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-64 p-1'>
				<div className='px-2 py-1.5 text-xs text-muted-foreground'>
					Workspace members
				</div>

				{isLoading ? (
					<div className='px-2 py-2 text-sm text-muted-foreground'>
						Loading...
					</div>
				) : people.length === 0 ? (
					<div className='px-2 py-2 text-sm text-muted-foreground'>
						No members found
					</div>
				) : (
					<div className='max-h-64 overflow-y-auto'>
						{people.map((person) => {
							const active = selectedIds.includes(person.user_id);
							return (
								<button
									key={person.user_id}
									type='button'
									disabled={disabled}
									aria-pressed={active}
									onClick={() => toggle(person.user_id)}
									className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50'
								>
									<PersonChip person={person} />
									{active && (
										<Check className='ml-auto size-4 shrink-0' />
									)}
								</button>
							);
						})}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
