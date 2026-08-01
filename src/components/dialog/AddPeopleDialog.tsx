"use client";

import { Copy, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Combobox } from "../ui/combobox";

import {
	useInviteWorkspaceMembers,
	useSearchInviteUsers,
} from "@/features/workspace/hooks/useWorkspaceInvite";
import {
	InviteRecipient,
	InviteRecipientType,
	InviteSuggestionStatus,
	InviteSuggestionType,
	RoleName,
	SearchInviteUserResponse,
} from "@/services/workspace-invite/type";

type AddPeopleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workspaceId: string;
	workspaceName?: string;
	inviteLink?: string;
};

export function AddPeopleDialog({
	open,
	onOpenChange,
	workspaceId,
	workspaceName = "Task tracking",
	inviteLink,
}: AddPeopleDialogProps) {
	const [query, setQuery] = useState("");
	const [role, setRole] = useState<RoleName>(RoleName.MEMBER);
	const [selectedRecipients, setSelectedRecipients] = useState<
		InviteRecipient[]
	>([]);
	const [copied, setCopied] = useState(false);

	const searchInviteUsers = useSearchInviteUsers(workspaceId, query);
	const inviteMembers = useInviteWorkspaceMembers(workspaceId);

	const suggestions = Array.isArray(searchInviteUsers.data)
		? searchInviteUsers.data
		: [];

	const handleSelectOption = (item: SearchInviteUserResponse) => {
		if (item.status !== InviteSuggestionStatus.CAN_INVITE) return;

		const recipient: InviteRecipient =
			item.type === InviteSuggestionType.USER
				? {
						type: InviteRecipientType.USER,
						user_id: item.user_id ?? undefined,
						email: item.email,
					}
				: {
						type: InviteRecipientType.EMAIL,
						email: item.email,
					};

		setSelectedRecipients((prev) => {
			const existed = prev.some(
				(r) =>
					r.email?.toLowerCase() === recipient.email?.toLowerCase(),
			);

			if (existed) return prev;

			return [...prev, recipient];
		});

		setQuery("");
	};

	const handleRemoveRecipient = (email?: string) => {
		if (!email) return;

		setSelectedRecipients((prev) =>
			prev.filter(
				(item) => item.email?.toLowerCase() !== email.toLowerCase(),
			),
		);
	};

	const handleInvite = () => {
		if (selectedRecipients.length === 0) return;

		inviteMembers.mutate(
			{
				role_name: role,
				recipients: selectedRecipients,
			},

			{
				onSuccess: () => {
					toast.success(
						selectedRecipients.length > 1
							? `Đã gửi ${selectedRecipients.length} lời mời.`
							: "Đã gửi lời mời.",
					);
					setQuery("");
					setRole(RoleName.MEMBER);
					setSelectedRecipients([]);
					onOpenChange(false);
				},
				onError: () => {
					toast.error("Không thể gửi lời mời.");
				},
			},
		);
	};

	const handleCopyLink = async () => {
		if (!inviteLink) return;

		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);

		window.setTimeout(() => {
			setCopied(false);
		}, 1200);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='w-[calc(100vw-2rem)] max-w-[420px] gap-0 rounded-sm border border-border bg-background p-0 shadow-2xl sm:max-w-[420px] [&>button]:right-5 [&>button]:top-5'>
				<div className='flex items-center justify-between px-5 pb-3 pt-5'>
					<DialogTitle className='text-lg font-semibold text-foreground'>
						Thêm thành viên vào {workspaceName}
					</DialogTitle>
				</div>

				<div className='px-5 pb-5'>
					<div className='space-y-2'>
						<Label className='text-xs text-muted-foreground'>
							Tên hoặc email{" "}
							<span className='text-red-400'>*</span>
						</Label>

						<Combobox items={suggestions}>
							<div className='relative'>
								<div className='flex min-h-10 flex-wrap items-center gap-2 rounded-sm border border-border px-2 py-1'>
									{selectedRecipients.map((recipient) => (
										<div
											key={
												recipient.email ??
												recipient.user_id
											}
											className='flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs'
										>
											<span>{recipient.email}</span>

											<button
												type='button'
												onClick={() =>
													handleRemoveRecipient(
														recipient.email,
													)
												}
												className='text-muted-foreground hover:text-foreground'
											>
												<X className='size-3' />
											</button>
										</div>
									))}

									<input
										value={query}
										onChange={(event) =>
											setQuery(event.target.value)
										}
										placeholder={
											selectedRecipients.length === 0
												? "VD: Maria, maria@company.com"
												: "thêm người khác..."
										}
										className='h-8 min-w-40 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
									/>
								</div>

								{query.trim().length >= 2 && (
									<div className='absolute left-0 right-0 top-full z-50 mt-1 max-h-[252px] overflow-y-auto rounded-sm border border-border bg-background py-1 shadow-xl'>
										{searchInviteUsers.isFetching && (
											<div className='px-3 py-3 text-sm text-muted-foreground'>
												Đang tìm kiếm...
											</div>
										)}

										{!searchInviteUsers.isFetching &&
											suggestions.length === 0 && (
												<div className='px-3 py-3 text-sm text-muted-foreground'>
													Không tìm thấy người phù hợp.
												</div>
											)}

										{suggestions.map((item) => {
											const disabled =
												item.status !==
												InviteSuggestionStatus.CAN_INVITE;

											return (
												<button
													key={`${item.type}-${item.email}`}
													type='button'
													disabled={disabled}
													onMouseDown={(event) => {
														event.preventDefault();

														if (disabled) return;

														handleSelectOption(
															item,
														);
													}}
													className='flex w-full items-center gap-3 px-3 py-2 text-left hover:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
												>
													<div className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground'>
														{item.avatar_url ? (
															<img
																src={
																	item.avatar_url
																}
																alt={item.email}
																className='size-full object-cover'
															/>
														) : (
															<UsersRound className='size-4' />
														)}
													</div>

													<div className='min-w-0 flex-1'>
														<div className='truncate text-sm font-medium'>
															{item.full_name ??
																item.username ??
																item.email}
														</div>

														<div className='truncate text-xs text-muted-foreground'>
															{item.email}
														</div>
													</div>

													<div className='shrink-0 text-xs text-muted-foreground'>
														{item.status ===
															InviteSuggestionStatus.CAN_INVITE &&
															"Mời"}

														{item.status ===
															InviteSuggestionStatus.MEMBER &&
															"Đã là thành viên"}

														{item.status ===
															InviteSuggestionStatus.PENDING_INVITE &&
															"Đã mời"}
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</Combobox>
					</div>

					<div className='mt-5 flex items-center justify-between'>
						<Button
							type='button'
							variant='ghost'
							className='gap-2 px-0 text-muted-foreground hover:bg-transparent'
							onClick={handleCopyLink}
							disabled={!inviteLink}
						>
							<Copy className='size-4' />
							{copied ? "Đã sao chép" : "Sao chép liên kết"}
						</Button>

						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='ghost'
								onClick={() => onOpenChange(false)}
							>
								Hủy
							</Button>

							<Button
								type='button'
								onClick={handleInvite}
								disabled={
									selectedRecipients.length === 0 ||
									inviteMembers.isPending
								}
							>
								{inviteMembers.isPending ? "Đang thêm..." : "Thêm"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
