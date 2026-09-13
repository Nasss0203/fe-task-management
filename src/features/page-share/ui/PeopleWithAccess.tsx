"use client";

import {
	AccessLevelMenu,
	type AccessLevel,
} from "@/entities/access/ui/AccessLevelMenu";

import type {
	PageShareAccessLevel,
	PageShareMember,
} from "@/entities/page-share/model/page-share.types";

import { useUser } from "@/features/auth/model/use-user";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

const menuLevel: Record<PageShareAccessLevel, AccessLevel> = {
	VIEWER: "view",
	COMMENTER: "comment",
	EDITOR: "edit",
	FULL_ACCESS: "full",
};

const apiLevel: Record<AccessLevel, PageShareAccessLevel> = {
	view: "VIEWER",
	comment: "COMMENTER",
	edit: "EDITOR",
	full: "FULL_ACCESS",
};

const accessLabel: Record<PageShareAccessLevel, string> = {
	VIEWER: "Can view",
	COMMENTER: "Can comment",
	EDITOR: "Can edit",
	FULL_ACCESS: "Full access",
};

const getUserName = (user: PageShareMember["user"]) =>
	user.displayName?.trim() || user.username?.trim() || user.email;

interface PeopleWithAccessProps {
	shares: PageShareMember[];

	effectiveAccessLevel: PageShareAccessLevel | null;

	canManage: boolean;

	isPending: boolean;
	isError: boolean;

	isUpdating: boolean;
	isUpdateError: boolean;

	onChangeAccess: (
		shareId: string,
		accessLevel: PageShareAccessLevel,
	) => void;
}

export function PeopleWithAccess({
	shares,
	effectiveAccessLevel,
	canManage,
	isPending,
	isError,
	isUpdating,
	isUpdateError,
	onChangeAccess,
}: PeopleWithAccessProps) {
	const { user: currentUser } = useUser();

	/**
	 * Current user được render riêng bằng
	 * effective access nên loại khỏi direct shares.
	 */
	const directShares = currentUser
		? shares.filter((share) => share.userId !== currentUser.id)
		: shares;

	const currentUserName =
		currentUser?.username?.trim() || currentUser?.email || "You";

	return (
		<section className='space-y-2.5'>
			<h2 className='text-[11px] font-semibold text-[#aaa]'>
				People with access
			</h2>

			{/* Current user */}
			{currentUser && (
				<div className='flex items-center justify-between gap-3 rounded-lg px-1 py-1.5'>
					<div className='flex min-w-0 items-center gap-2.5'>
						<Avatar className='size-9 shrink-0'>
							<AvatarImage
								src={currentUser.avatarUrl ?? undefined}
								alt={currentUserName}
							/>

							<AvatarFallback className='bg-[#1296d4] text-white'>
								{currentUserName.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className='min-w-0 leading-4'>
							<p className='truncate text-[13px] text-[#ededed]'>
								{currentUserName}{" "}
								<span className='text-[#aaa]'>(You)</span>
							</p>

							<p className='truncate text-[11px] text-[#9a9a9a]'>
								{currentUser.email}
							</p>
						</div>
					</div>

					<AccessLevelMenu
						currentLevel={
							menuLevel[effectiveAccessLevel ?? "VIEWER"]
						}
						inheritedFrom='Effective access to this page'
						overrideWarning='Your effective access cannot be changed from this page sharing menu.'
						readOnly
					/>
				</div>
			)}

			{/* Direct shares */}
			{isPending ? (
				<p className='py-2 text-xs text-[#8f8f8f]'>
					Loading people with access...
				</p>
			) : isError ? (
				<p className='py-2 text-xs text-red-400'>
					Unable to load people with access.
				</p>
			) : directShares.length === 0 ? (
				!currentUser && (
					<p className='py-2 text-xs text-[#8f8f8f]'>
						No one has been shared directly yet.
					</p>
				)
			) : (
				<div className='space-y-1'>
					{directShares.map((share) => {
						const name = getUserName(share.user);

						return (
							<div
								key={share.id}
								className='flex items-center justify-between gap-3 rounded-lg px-1 py-1.5'
							>
								<div className='flex min-w-0 items-center gap-2.5'>
									<Avatar className='size-9 shrink-0'>
										<AvatarImage
											src={
												share.user.avatarUrl ??
												undefined
											}
											alt={name}
										/>

										<AvatarFallback className='bg-[#1296d4] text-white'>
											{name.charAt(0).toUpperCase() ||
												"?"}
										</AvatarFallback>
									</Avatar>

									<div className='min-w-0 leading-4'>
										<p className='truncate text-[13px] text-[#ededed]'>
											{name}
										</p>

										<p className='truncate text-[11px] text-[#9a9a9a]'>
											{share.user.email}
										</p>
									</div>
								</div>

								{canManage ? (
									<AccessLevelMenu
										currentLevel={
											menuLevel[share.accessLevel]
										}
										allowedLevels={[
											"view",
											"comment",
											"edit",
											"full",
										]}
										disabled={isUpdating}
										onChange={(level) => {
											onChangeAccess(
												share.id,
												apiLevel[level],
											);
										}}
									/>
								) : (
									<span className='shrink-0 text-xs text-[#aaa]'>
										{accessLabel[share.accessLevel]}
									</span>
								)}
							</div>
						);
					})}
				</div>
			)}

			{isUpdateError && (
				<p role='alert' className='text-xs text-red-400'>
					Unable to update access.
				</p>
			)}
		</section>
	);
}
