"use client";

import { Check, Globe2 } from "lucide-react";
import { toast } from "sonner";

import { useJoinTeamspace } from "@/entities/teamspace/model/teamspace.mutations";
import { useDiscoverTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import type { DiscoverTeamspaceItem } from "@/entities/teamspace/model/teamspace.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

interface BrowseTeamspacesDialogProps {
	workspaceId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Lists the workspace's open teamspaces so members can join them. */
export function BrowseTeamspacesDialog({
	workspaceId,
	open,
	onOpenChange,
}: BrowseTeamspacesDialogProps) {
	const discoverQuery = useDiscoverTeamspaces(workspaceId, open);

	const joinMutation = useJoinTeamspace();

	const teamspaces = discoverQuery.data?.items ?? [];

	const handleJoin = (teamspace: DiscoverTeamspaceItem) => {
		joinMutation.mutate(teamspace.id, {
			onSuccess: () => toast.success(`You joined ${teamspace.name}`),
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not join the teamspace."),
				),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-h-[min(85vh,640px)] flex-col sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Browse teamspaces</DialogTitle>

					<DialogDescription>
						Open teamspaces in this workspace. Private ones need an
						invitation.
					</DialogDescription>
				</DialogHeader>

				<div className='-mx-1 min-h-0 flex-1 overflow-y-auto px-1'>
					{discoverQuery.isLoading ? (
						<div className='flex flex-col gap-3 py-2' aria-busy='true'>
							<span className='sr-only'>Loading teamspaces</span>
							<Skeleton className='h-12 w-full' />
							<Skeleton className='h-12 w-full' />
						</div>
					) : discoverQuery.isError ? (
						<p
							role='alert'
							className='py-8 text-center text-sm text-muted-foreground'
						>
							Unable to load teamspaces.
						</p>
					) : teamspaces.length === 0 ? (
						<div className='flex flex-col items-center gap-2 py-10 text-center'>
							<span className='flex size-10 items-center justify-center rounded-xl bg-muted'>
								<Globe2 className='size-5 text-muted-foreground' />
							</span>

							<p className='text-sm font-medium'>No open teamspaces</p>

							<p className='max-w-xs text-xs text-muted-foreground'>
								Teamspaces set to Open will show up here.
							</p>
						</div>
					) : (
						<ul className='divide-y'>
							{teamspaces.map((teamspace) => {
								const isJoining =
									joinMutation.isPending &&
									joinMutation.variables === teamspace.id;

								return (
									<li
										key={teamspace.id}
										className='flex items-center gap-3 py-3'
									>
										<span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400'>
											<Globe2 className='size-4' />
										</span>

										<div className='min-w-0 flex-1'>
											<p className='truncate text-sm font-medium'>
												{teamspace.name}
											</p>

											{teamspace.description && (
												<p className='line-clamp-2 text-xs text-muted-foreground'>
													{teamspace.description}
												</p>
											)}
										</div>

										{teamspace.isMember ? (
											<span className='inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground'>
												<Check className='size-3.5' />
												Joined
											</span>
										) : (
											<Button
												size='sm'
												className='h-8 shrink-0'
												disabled={joinMutation.isPending}
												onClick={() => handleJoin(teamspace)}
											>
												{isJoining ? "Joining..." : "Join"}
											</Button>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
