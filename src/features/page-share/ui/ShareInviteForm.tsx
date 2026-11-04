"use client";

import { useEffect, useState, type FormEvent } from "react";

import { usePageShareCandidates } from "@/entities/page-share/model/page-share.queries";

import { useSharePage } from "@/entities/page-share/model/page-share.mutations";

import type {
	PageShareAccessLevel,
	PageShareCandidate,
	PageShareMember,
} from "@/entities/page-share/model/page-share.types";

import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

const selectStyle = "border-border bg-popover text-popover-foreground";

const getUserName = (user: PageShareCandidate) =>
	user.displayName?.trim() || user.username?.trim() || user.email;

interface ShareInviteFormProps {
	pageId: string;

	shares: PageShareMember[];

	canAdd: boolean;

	canGrantFullAccess: boolean;
}

export function ShareInviteForm({
	pageId,
	shares,
	canAdd,
	canGrantFullAccess,
}: ShareInviteFormProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<PageShareCandidate | null>(
		null,
	);
	const [selectedLevel, setSelectedLevel] =
		useState<PageShareAccessLevel>("VIEWER");
	const [shareError, setShareError] = useState<string | null>(null);

	const {
		data: candidates = [],
		isFetching: isCandidatesFetching,
		isError: isCandidatesError,
	} = usePageShareCandidates(pageId, debouncedQuery, canAdd && !selectedUser);

	const sharePage = useSharePage(pageId);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setDebouncedQuery(searchQuery.trim());
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [searchQuery]);

	const chooseCandidate = (candidate: PageShareCandidate) => {
		setSelectedUser(candidate);

		setSearchQuery(getUserName(candidate));

		setShareError(null);
	};

	const submitShare = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!canAdd || !selectedUser || sharePage.isPending) {
			return;
		}

		setShareError(null);

		try {
			await sharePage.mutateAsync({
				user_id: selectedUser.id,

				access_level: selectedLevel,
			});

			setSelectedUser(null);
			setSearchQuery("");
			setDebouncedQuery("");

			setSelectedLevel("VIEWER");
		} catch (error) {
			setShareError(
				getFriendlyApiErrorMessage(error, "Unable to share this page."),
			);
		}
	};

	const showCandidates = !selectedUser && searchQuery.trim().length >= 2;

	const candidateQueryReady = debouncedQuery === searchQuery.trim();

	const visibleCandidates = candidates.filter(
		(candidate) => !shares.some((share) => share.userId === candidate.id),
	);

	if (!canAdd) {
		return null;
	}

	return (
		<form onSubmit={submitShare} className='space-y-2'>
			<div className='flex gap-2'>
				<div className='relative flex h-[34px] min-w-0 flex-1 items-center rounded-md border border-input bg-background pr-1 focus-within:border-ring'>
					<Input
						aria-label='Search people by name or email'
						placeholder='Search people by name or email'
						value={searchQuery}
						onChange={(event) => {
							setSearchQuery(event.target.value);

							setSelectedUser(null);

							setShareError(null);
						}}
						onKeyDown={(event) => {
							if (
								event.key === "Enter" &&
								showCandidates &&
								candidateQueryReady &&
								visibleCandidates[0]
							) {
								event.preventDefault();

								chooseCandidate(visibleCandidates[0]);
							}
						}}
						className='h-8 flex-1 border-0 bg-transparent px-2.5 text-[13px] text-foreground shadow-none placeholder:text-faint focus-visible:border-0 focus-visible:ring-0 md:text-[13px] dark:bg-transparent'
					/>

					<Select
						value={selectedLevel}
						onValueChange={(value) =>
							setSelectedLevel(value as PageShareAccessLevel)
						}
					>
						<SelectTrigger
							size='sm'
							aria-label='New share access level'
							className='max-w-28 shrink-0 gap-1 border-0 bg-transparent px-2 py-0 text-[12.5px] text-muted-foreground shadow-none hover:bg-accent data-[size=sm]:h-7 focus-visible:border-0 focus-visible:ring-1 focus-visible:ring-ring/40 dark:bg-transparent'
						>
							<SelectValue />
						</SelectTrigger>

						<SelectContent className={selectStyle}>
							<SelectItem value='VIEWER'>Can view</SelectItem>

							<SelectItem value='EDITOR'>Can edit</SelectItem>

							{canGrantFullAccess && (
								<SelectItem value='FULL_ACCESS'>
									Full access
								</SelectItem>
							)}
						</SelectContent>
					</Select>

					{showCandidates && (
						<div className='absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-[10px] border border-border bg-popover p-[5px] shadow-elevated'>
							{!candidateQueryReady || isCandidatesFetching ? (
								<p className='px-2 py-2 text-xs text-muted-foreground'>
									Searching...
								</p>
							) : isCandidatesError ? (
								<p className='px-2 py-2 text-xs text-red-400'>
									Unable to search people.
								</p>
							) : visibleCandidates.length === 0 ? (
								<p className='px-2 py-2 text-xs text-muted-foreground'>
									No available people found.
								</p>
							) : (
								visibleCandidates.map((candidate) => (
									<button
										key={candidate.id}
										type='button'
										onClick={() =>
											chooseCandidate(candidate)
										}
										className='flex w-full flex-col rounded-[5px] px-2 py-1.5 text-left text-[13px] hover:bg-accent'
									>
										<span className='font-medium text-foreground'>
											{getUserName(candidate)}
										</span>

										<span className='text-xs text-muted-foreground'>
											{candidate.email}
										</span>
									</button>
								))
							)}
						</div>
					)}
				</div>

				<Button
					type='submit'
					disabled={!selectedUser || sharePage.isPending}
					// Chỉ bật khi đã chọn người trong gợi ý; lúc tắt phải trông khác hẳn để không tưởng là lỗi
					title={selectedUser ? undefined : "Choose a person from the list first"}
					className='h-[34px] rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-none hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100'
				>
					{sharePage.isPending ? "Sharing..." : "Share"}
				</Button>
			</div>

			{shareError && (
				<p role='alert' className='text-xs text-red-400'>
					{shareError}
				</p>
			)}
		</form>
	);
}
