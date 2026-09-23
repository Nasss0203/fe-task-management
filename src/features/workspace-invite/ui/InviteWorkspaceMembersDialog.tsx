"use client";

import { Crown, UserPlus, UserRound, X } from "lucide-react";
import * as React from "react";

import { useSearchWorkspaceInviteUsers } from "@/entities/workspace-invite/model/workspace-invite.queries";

import type {
	InviteSuggestion,
	WorkspaceInviteRole,
} from "@/entities/workspace-invite/model/workspace-invite.types";

import { Button } from "@/shared/ui/button";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

import { Input } from "@/shared/ui/input";

import { useInviteWorkspaceMembers } from "@/entities/workspace-invite/model/workspace-invite.mutations";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/shared/ui/select";

interface InviteWorkspaceMembersDialogProps {
	open: boolean;

	onOpenChange: (open: boolean) => void;

	workspaceId: string;
}

export function InviteWorkspaceMembersDialog({
	open,
	onOpenChange,
	workspaceId,
}: InviteWorkspaceMembersDialogProps) {
	const [search, setSearch] = React.useState("");

	const [debouncedSearch, setDebouncedSearch] = React.useState("");

	const [role, setRole] = React.useState<WorkspaceInviteRole>("MEMBER");

	const [selectedRecipients, setSelectedRecipients] = React.useState<
		InviteSuggestion[]
	>([]);

	const inviteMutation = useInviteWorkspaceMembers();
	/**
	 * Debounce search để tránh gọi API
	 * ở mỗi lần gõ phím.
	 */
	React.useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(search.trim());
		}, 350);

		return () => {
			window.clearTimeout(timer);
		};
	}, [search]);

	const {
		data: suggestions = [],
		isFetching,
		isError,
	} = useSearchWorkspaceInviteUsers(workspaceId, debouncedSearch);

	const isSelected = (suggestion: InviteSuggestion) => {
		return selectedRecipients.some(
			(item) =>
				(item.user_id && item.user_id === suggestion.user_id) ||
				item.email.toLowerCase() === suggestion.email.toLowerCase(),
		);
	};

	const canSelect = (suggestion: InviteSuggestion) => {
		return (
			suggestion.status === "CAN_INVITE" || suggestion.status === "GUEST"
		);
	};

	const handleSelectSuggestion = (suggestion: InviteSuggestion) => {
		if (!canSelect(suggestion) || isSelected(suggestion)) {
			return;
		}

		setSelectedRecipients((current) => [...current, suggestion]);

		setSearch("");
		setDebouncedSearch("");
	};

	const handleRemoveRecipient = (suggestion: InviteSuggestion) => {
		setSelectedRecipients((current) =>
			current.filter(
				(item) =>
					!(
						(item.user_id && item.user_id === suggestion.user_id) ||
						item.email.toLowerCase() ===
							suggestion.email.toLowerCase()
					),
			),
		);
	};
	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setSearch("");
			setDebouncedSearch("");
			setSelectedRecipients([]);
			setRole("MEMBER");

			inviteMutation.reset();
		}

		onOpenChange(nextOpen);
	};

	const handleSendInvite = () => {
		if (selectedRecipients.length === 0 || inviteMutation.isPending) {
			return;
		}

		const recipients = selectedRecipients.map((recipient) => {
			if (recipient.type === "USER" && recipient.user_id) {
				return {
					type: "USER" as const,
					user_id: recipient.user_id,

					/**
					 * Gửi luôn email vì DTO backend
					 * cũng validate email.
					 */
					email: recipient.email,
				};
			}

			return {
				type: "EMAIL" as const,
				email: recipient.email,
			};
		});

		inviteMutation.mutate(
			{
				workspaceId,

				payload: {
					role_name: role,
					recipients,
				},
			},
			{
				onSuccess: () => {
					setSearch("");
					setDebouncedSearch("");
					setSelectedRecipients([]);
					setRole("MEMBER");

					onOpenChange(false);
				},
			},
		);
	};

	const showSuggestions = debouncedSearch.length > 0;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className='max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-xl border-border/80 bg-popover p-5 shadow-2xl sm:max-w-[460px] sm:p-6 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:top-4'>
				<DialogHeader className='items-center gap-0 text-center'>
					<div className='mb-2 flex size-8 items-center justify-center text-muted-foreground'>
						<UserPlus className='size-5 stroke-[1.7]' />
					</div>

					<DialogTitle className='text-base font-semibold tracking-[-0.01em]'>
						Add members
					</DialogTitle>

					<DialogDescription className='mt-1.5 max-w-[360px] text-sm leading-5'>
						Search by name or email to invite people to this
						workspace.
					</DialogDescription>
				</DialogHeader>

				<div className='mt-5 space-y-4'>
					{/* Selected recipients */}
					{selectedRecipients.length > 0 && (
						<div className='flex flex-wrap gap-1.5'>
							{selectedRecipients.map((recipient) => (
								<div
									key={recipient.user_id ?? recipient.email}
									className='flex max-w-full items-center gap-2 rounded-md bg-muted px-2.5 py-1.5'
								>
									<div className='min-w-0'>
										<p className='max-w-52 truncate text-sm font-medium'>
											{recipient.full_name ??
												recipient.username ??
												recipient.email}
										</p>

										{recipient.full_name && (
											<p className='max-w-52 truncate text-xs text-muted-foreground'>
												{recipient.email}
											</p>
										)}
									</div>

									<button
										type='button'
										onClick={() =>
											handleRemoveRecipient(recipient)
										}
										className='shrink-0 rounded p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
										aria-label={`Remove ${recipient.email}`}
									>
										<X className='size-3.5' />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Search */}
					<div className='relative'>
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={
								selectedRecipients.length > 0
									? "Add another person..."
									: "Search names or emails"
							}
							autoComplete='off'
							aria-label='Search names or emails'
							className='h-9 rounded-md border-input bg-background/60 px-3 text-sm shadow-xs placeholder:text-muted-foreground/70 focus-visible:ring-ring/20 dark:bg-white/[0.04]'
						/>

						{showSuggestions && (
							<div className='absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-lg border bg-popover p-1.5 shadow-xl'>
								{isFetching ? (
									<p className='px-3 py-2.5 text-sm text-muted-foreground'>
										Searching...
									</p>
								) : isError ? (
									<p className='px-3 py-2.5 text-sm text-destructive'>
										Unable to search users.
									</p>
								) : suggestions.length === 0 ? (
									<p className='px-3 py-2.5 text-sm text-muted-foreground'>
										No users found.
									</p>
								) : (
									suggestions.map((suggestion) => {
										const selectable =
											canSelect(suggestion);

										const selected = isSelected(suggestion);

										return (
											<button
												key={
													suggestion.user_id ??
													suggestion.email
												}
												type='button'
												disabled={
													!selectable || selected
												}
												onClick={() =>
													handleSelectSuggestion(
														suggestion,
													)
												}
												className='flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-accent disabled:cursor-default disabled:opacity-50'
											>
												<div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold'>
													{getInitials(suggestion)}
												</div>

												<div className='min-w-0 flex-1'>
													<p className='truncate text-sm font-medium'>
														{suggestion.full_name ??
															suggestion.username ??
															suggestion.email}
													</p>

													<p className='truncate text-xs text-muted-foreground'>
														{suggestion.email}
													</p>
												</div>

												<SuggestionStatus
													suggestion={suggestion}
													selected={selected}
												/>
											</button>
										);
									})
								)}
							</div>
						)}
					</div>

					{/* Role */}
					<div className='space-y-1.5'>
						<p className='text-[13px] font-medium'>Select role</p>

						<Select
							value={role}
							onValueChange={(value) =>
								setRole(value as WorkspaceInviteRole)
							}
						>
							<SelectTrigger className='min-h-14 w-full rounded-md border-input bg-background/60 px-3 py-2 text-left shadow-xs hover:bg-accent/40 focus-visible:ring-ring/20 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]'>
								<RolePreview role={role} />
							</SelectTrigger>

							<SelectContent
								position='popper'
								className='w-[var(--radix-select-trigger-width)] rounded-lg'
							>
								<SelectItem
									value='MEMBER'
									className='py-2.5 pr-8'
								>
									<RolePreview role='MEMBER' />
								</SelectItem>

								<SelectItem
									value='OWNER'
									className='py-2.5 pr-8'
								>
									<RolePreview role='OWNER' />
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						{inviteMutation.isError && (
							<p
								role='alert'
								className='text-sm text-destructive'
							>
								Unable to send invitation. Please try again.
							</p>
						)}
						<Button
							type='button'
							className='h-9 w-full bg-[#2383e2] text-white shadow-sm hover:bg-[#1f74c9] disabled:bg-muted-foreground/35 disabled:text-background disabled:opacity-100 dark:bg-[#2383e2] dark:hover:bg-[#1f74c9]'
							disabled={
								selectedRecipients.length === 0 ||
								inviteMutation.isPending
							}
							onClick={handleSendInvite}
						>
							Send invite
						</Button>

						<Button
							type='button'
							variant='ghost'
							className='h-8 w-full'
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function RolePreview({ role }: { role: WorkspaceInviteRole }) {
	const isOwner = role === "OWNER";
	const Icon = isOwner ? Crown : UserRound;

	return (
		<span className='flex min-w-0 items-start gap-3 whitespace-normal'>
			<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />

			<span className='min-w-0'>
				<span className='block text-sm font-medium leading-5'>
					{isOwner ? "Workspace owner" : "Member"}
				</span>

				<span className='block text-xs leading-5 text-muted-foreground'>
					{isOwner
						? "Can manage workspace settings and invite new members."
						: "Can collaborate inside the workspace."}
				</span>
			</span>
		</span>
	);
}

function SuggestionStatus({
	suggestion,
	selected,
}: {
	suggestion: InviteSuggestion;
	selected: boolean;
}) {
	if (selected) {
		return (
			<span className='shrink-0 text-xs text-muted-foreground'>
				Selected
			</span>
		);
	}

	switch (suggestion.status) {
		case "GUEST":
			return (
				<span className='shrink-0 text-xs text-muted-foreground'>
					Guest
				</span>
			);

		case "MEMBER":
			return (
				<span className='shrink-0 text-xs text-muted-foreground'>
					Already member
				</span>
			);

		case "PENDING_INVITE":
			return (
				<span className='shrink-0 text-xs text-muted-foreground'>
					Invite pending
				</span>
			);

		case "CAN_INVITE":
		default:
			return null;
	}
}

function getInitials(suggestion: InviteSuggestion) {
	const value =
		suggestion.full_name ?? suggestion.username ?? suggestion.email;

	return value.trim().charAt(0).toUpperCase();
}
