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

const selectStyle = "border-[#414141] bg-[#2b2b2b] text-white";

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
				<div className='relative min-w-0 flex-1'>
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
						className='h-9 border-[#414141] bg-transparent text-xs text-white placeholder:text-[#777]'
					/>

					{showCandidates && (
						<div className='absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-[#414141] bg-[#2b2b2b] p-1 shadow-xl'>
							{!candidateQueryReady || isCandidatesFetching ? (
								<p className='px-2 py-2 text-xs text-[#aaa]'>
									Searching...
								</p>
							) : isCandidatesError ? (
								<p className='px-2 py-2 text-xs text-red-400'>
									Unable to search people.
								</p>
							) : visibleCandidates.length === 0 ? (
								<p className='px-2 py-2 text-xs text-[#aaa]'>
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
										className='flex w-full flex-col rounded px-2 py-1.5 text-left text-xs hover:bg-white/10'
									>
										<span className='font-medium text-white'>
											{getUserName(candidate)}
										</span>

										<span className='text-[#aaa]'>
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
					className='h-9 bg-[#2f86df] px-3.5 text-xs text-white hover:bg-[#3b91e8]'
				>
					{sharePage.isPending ? "Sharing..." : "Share"}
				</Button>
			</div>

			{selectedUser && (
				<div className='flex items-center gap-2 text-xs text-[#aaa]'>
					<span className='truncate'>{selectedUser.email}</span>

					<Select
						value={selectedLevel}
						onValueChange={(value) =>
							setSelectedLevel(value as PageShareAccessLevel)
						}
					>
						<SelectTrigger
							aria-label='New share access level'
							className='ml-auto h-7 w-28 border-[#414141] bg-transparent text-xs'
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
				</div>
			)}

			{shareError && (
				<p role='alert' className='text-xs text-red-400'>
					{shareError}
				</p>
			)}
		</form>
	);
}
