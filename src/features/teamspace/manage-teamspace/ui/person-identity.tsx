"use client";

import type { ReactNode } from "react";

import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { getInitials } from "@/features/workspace-settings/ui/sections/people/people.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { getPersonName } from "../model/use-teamspace-management";

interface PersonIdentityProps {
	person: WorkspacePerson | undefined;
	/** Shown after the name, e.g. "(you)". */
	suffix?: ReactNode;
	/** Replaces the email line. */
	detail?: ReactNode;
}

export function PersonIdentity({ person, suffix, detail }: PersonIdentityProps) {
	const name = getPersonName(person);

	return (
		<div className='flex min-w-0 flex-1 items-center gap-3'>
			<Avatar className='size-8'>
				{person?.avatar_url ? (
					<AvatarImage src={person.avatar_url} alt={name} />
				) : null}

				<AvatarFallback className='text-xs font-medium'>
					{getInitials(name)}
				</AvatarFallback>
			</Avatar>

			<div className='min-w-0'>
				<p className='truncate text-sm font-medium'>
					{name}
					{suffix}
				</p>

				<p className='truncate text-xs text-muted-foreground'>
					{detail ?? person?.email}
				</p>
			</div>
		</div>
	);
}
