"use client";

import { Check, Search } from "lucide-react";
import { useState } from "react";

import { usePage } from "@/entities/page/model/page.queries";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/shared/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

const MAX_STACKED_AVATARS = 4;

function normalize(text: string) {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}

interface PersonCellProps {
	/** Page that owns the database; its workspace supplies the people list. */
	pageId: string;
	name: string;
	value: unknown;
	interactive: boolean;
	disabled?: boolean;
	onChange: (value: string[] | null) => void;
}

function PersonAvatar({ person }: { person: WorkspacePerson }) {
	return (
		<Avatar size='sm' className='size-5'>
			{person.avatar_url && <AvatarImage src={person.avatar_url} />}
			<AvatarFallback className='text-[10px]'>
				{person.full_name.charAt(0).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}

function PersonChip({ person }: { person: WorkspacePerson }) {
	return (
		<span className='inline-flex min-w-0 items-center gap-1.5'>
			<PersonAvatar person={person} />
			<span className='truncate'>{person.full_name}</span>
		</span>
	);
}

function SelectedPeople({ people }: { people: WorkspacePerson[] }) {
	if (people.length === 0) return null;

	if (people.length === 1) {
		return (
			<span className='flex min-w-0 items-center'>
				<PersonChip person={people[0]} />
			</span>
		);
	}

	const shown = people.slice(0, MAX_STACKED_AVATARS);
	const hiddenCount = people.length - shown.length;

	return (
		<AvatarGroup
			title={people.map((person) => person.full_name).join(", ")}
			aria-label={people.map((person) => person.full_name).join(", ")}
			className='*:data-[slot=avatar]:ring-1'
		>
			{shown.map((person) => (
				<PersonAvatar key={person.user_id} person={person} />
			))}
			{hiddenCount > 0 && (
				<AvatarGroupCount className='size-5 text-[10px] ring-1'>
					+{hiddenCount}
				</AvatarGroupCount>
			)}
		</AvatarGroup>
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

	const [query, setQuery] = useState("");

	const selected = selectedIds
		.map((id) => people.find((person) => person.user_id === id))
		.filter((person): person is WorkspacePerson => Boolean(person));

	const chips = <SelectedPeople people={selected} />;

	if (!interactive) {
		return <span className='block px-1'>{chips}</span>;
	}

	const normalizedQuery = normalize(query.trim());
	const matches = normalizedQuery
		? people.filter(
				(person) =>
					normalize(person.full_name).includes(normalizedQuery) ||
					normalize(person.email).includes(normalizedQuery),
			)
		: people;

	const toggle = (userId: string) => {
		const next = selectedIds.includes(userId)
			? selectedIds.filter((id) => id !== userId)
			: [...selectedIds, userId];
		onChange(next.length ? next : null);
	};

	return (
		<Popover onOpenChange={(open) => !open && setQuery("")}>
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

			<PopoverContent align='start' className='w-72 p-1'>
				<div className='flex items-center gap-2 border-b px-2 pb-1.5 pt-1'>
					<Search className='size-3.5 shrink-0 text-muted-foreground' />
					<input
						autoFocus
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder='Search people...'
						aria-label='Search people'
						className='h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
					/>
				</div>

				<div className='px-2 pb-1 pt-2 text-xs text-muted-foreground'>
					Workspace members
				</div>

				{isLoading ? (
					<div className='px-2 py-2 text-sm text-muted-foreground'>
						Loading...
					</div>
				) : matches.length === 0 ? (
					<div className='px-2 py-2 text-sm text-muted-foreground'>
						{people.length === 0 ? "No members found" : "No matching people"}
					</div>
				) : (
					<div className='max-h-64 overflow-y-auto'>
						{matches.map((person) => {
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
									<PersonAvatar person={person} />
									<span className='min-w-0 flex-1'>
										<span className='block truncate'>{person.full_name}</span>
										<span className='block truncate text-xs text-muted-foreground'>
											{person.email}
										</span>
									</span>
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
