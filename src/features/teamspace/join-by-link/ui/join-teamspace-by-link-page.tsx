"use client";

import { CheckCircle2, Link2Off, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { useJoinTeamspaceByLink } from "@/entities/teamspace/model/teamspace.mutations";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";

// Same shape the backend validates (32 random bytes, base64url).
const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Landing page for teamspace invite links (/join/teamspace/:token).
 * Joining waits for an explicit click so opening a link never joins by itself.
 */
export function JoinTeamspaceByLinkPage() {
	const { token } = useParams<{ token: string }>();

	const joinMutation = useJoinTeamspaceByLink();

	const isValidToken = INVITE_TOKEN_PATTERN.test(token ?? "");

	if (!isValidToken) {
		return (
			<JoinCard
				icon={<Link2Off className='size-5 text-muted-foreground' />}
				title='This invite link is not valid'
				description='Check that you copied the whole link, or ask for a new one.'
			/>
		);
	}

	if (joinMutation.isSuccess) {
		return (
			<JoinCard
				icon={
					<CheckCircle2 className='size-5 text-emerald-600 dark:text-emerald-400' />
				}
				title="You're in"
				description='The teamspace now appears in the sidebar of its workspace.'
			/>
		);
	}

	return (
		<JoinCard
			icon={<Users className='size-5 text-teal-600 dark:text-teal-400' />}
			title='Join teamspace'
			description="You've been invited to a teamspace with a link. Join to see its pages."
			error={
				joinMutation.isError
					? getApiErrorMessage(
							joinMutation.error,
							"Could not join with this link.",
						)
					: undefined
			}
			action={
				<Button
					className='w-full'
					disabled={joinMutation.isPending}
					onClick={() => joinMutation.mutate(token)}
				>
					{joinMutation.isPending ? "Joining..." : "Join teamspace"}
				</Button>
			}
		/>
	);
}

interface JoinCardProps {
	icon: ReactNode;
	title: string;
	description: string;
	error?: string;
	action?: ReactNode;
}

function JoinCard({ icon, title, description, error, action }: JoinCardProps) {
	return (
		<div className='mx-auto flex w-full max-w-sm flex-col items-center gap-4 px-4 pt-12 text-center'>
			<span className='flex size-12 items-center justify-center rounded-xl bg-muted'>
				{icon}
			</span>

			<div className='flex flex-col gap-1'>
				<h1 className='text-xl font-semibold tracking-tight'>{title}</h1>

				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>

			{error && (
				<p
					role='alert'
					className='w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'
				>
					{error}
				</p>
			)}

			{action}

			<Button asChild variant='ghost' size='sm' className='text-muted-foreground'>
				<Link href='/dashboard'>Go to dashboard</Link>
			</Button>
		</div>
	);
}
